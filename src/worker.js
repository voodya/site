const CONTENT_KEY = 'content.json';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const json = (value, init = {}) => new Response(JSON.stringify(value), {
  ...init,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...(init.headers || {}) },
});

const toBase64Url = (value) => {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

const sign = async (value, secret) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
};

const getCookie = (request, name) => request.headers.get('Cookie')
  ?.split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${name}=`))
  ?.slice(name.length + 1);

const isAuthenticated = async (request, env) => {
  if (!env.CONFIGURE_SESSION_SECRET) throw new Error('CONFIGURE_SESSION_SECRET is not configured');
  const token = getCookie(request, 'configure_session');
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  if (signature !== await sign(payload, env.CONFIGURE_SESSION_SECRET)) return false;

  try {
    const { expiresAt } = JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/')));
    return Number.isFinite(expiresAt) && expiresAt > Date.now();
  } catch {
    return false;
  }
};

const passwordsMatch = async (provided, expected) => {
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(provided)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  const left = new Uint8Array(providedHash);
  const right = new Uint8Array(expectedHash);
  let difference = left.length ^ right.length;
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) difference |= (left[index] || 0) ^ (right[index] || 0);
  return difference === 0;
};

const getContent = async (request, env) => {
  const saved = env.CONFIG_CONTENT ? await env.CONFIG_CONTENT.get(CONTENT_KEY) : null;
  if (saved) return saved;
  const staticUrl = new URL('/assets/Content.json', request.url);
  const response = await env.ASSETS.fetch(new Request(staticUrl));
  if (!response.ok) throw new Error('The bundled Content.json was not found');
  return response.text();
};

const requireAuth = async (request, env) => {
  if (await isAuthenticated(request, env)) return null;
  return json({ error: 'Требуется авторизация.' }, { status: 401 });
};

async function handleConfigureApi(request, env, pathname) {
  if (pathname === '/api/configure/session' && request.method === 'GET') {
    return json({ authenticated: await isAuthenticated(request, env) });
  }

  if (pathname === '/api/configure/login' && request.method === 'POST') {
    if (!env.CONFIGURE_PASSWORD) return json({ error: 'Пароль не настроен на сервере.' }, { status: 500 });
    const { password } = await request.json().catch(() => ({}));
    if (typeof password !== 'string' || !(await passwordsMatch(password, env.CONFIGURE_PASSWORD))) {
      return json({ error: 'Неверный пароль.' }, { status: 401 });
    }
    const payload = toBase64Url(JSON.stringify({ expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 }));
    const token = `${payload}.${await sign(payload, env.CONFIGURE_SESSION_SECRET)}`;
    return json({ ok: true }, {
      headers: { 'Set-Cookie': `configure_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}` },
    });
  }

  if (pathname === '/api/configure/logout' && request.method === 'POST') {
    return json({ ok: true }, { headers: { 'Set-Cookie': 'configure_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0' } });
  }

  const authError = await requireAuth(request, env);
  if (authError) return authError;

  if (pathname === '/api/configure/content' && request.method === 'GET') {
    return new Response(await getContent(request, env), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  }

  if (pathname === '/api/configure/content' && request.method === 'PUT') {
    if (!env.CONFIG_CONTENT) return json({ error: 'KV binding CONFIG_CONTENT не настроен.' }, { status: 500 });
    const body = await request.text();
    try {
      const content = JSON.parse(body);
      if (!Array.isArray(content)) throw new Error('Корневое значение должно быть массивом.');
      await env.CONFIG_CONTENT.put(CONTENT_KEY, JSON.stringify(content, null, 2));
      return json({ ok: true });
    } catch (error) {
      return json({ error: `Некорректный JSON: ${error.message}` }, { status: 400 });
    }
  }

  return json({ error: 'Не найдено.' }, { status: 404 });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    try {
      if (pathname.startsWith('/api/configure/')) return handleConfigureApi(request, env, pathname);
      if (pathname === '/configure') return Response.redirect(new URL('/configure/', request.url), 302);
      if (pathname === '/assets/Content.json') {
        return new Response(await getContent(request, env), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      return json({ error: error.message || 'Внутренняя ошибка сервера.' }, { status: 500 });
    }
  },
};
