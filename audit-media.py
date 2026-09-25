import concurrent.futures
import datetime
import html
import json
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'Content.cloudflare.json').read_text(encoding='utf-8-sig'))
resources = {}

def add(url, company, project, field):
    if url:
        resources.setdefault(url, []).append({'company': company, 'project': project, 'field': field})

for company in data:
    add(company.get('LogoUrl'), company['Name'], '', 'LogoUrl')
    for project in company.get('Projects', []):
        add(project.get('ImageUrl'), company['Name'], project['Name'], 'ImageUrl')
        for field in ('ScreenUrls', 'VideoUrls'):
            for url in project.get(field, []):
                add(url, company['Name'], project['Name'], field)

def check(url):
    parts = urllib.parse.urlsplit(url)
    encoded = urllib.parse.urlunsplit(parts._replace(path=urllib.parse.quote(urllib.parse.unquote(parts.path), safe='/')))
    result = {'url': url, 'status': None, 'content_type': '', 'final_url': '', 'available': False}
    for attempt in range(2):
        try:
            request = urllib.request.Request(encoded, headers={'Range': 'bytes=0-511', 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioMediaAudit/1.0)'})
            with urllib.request.urlopen(request, timeout=20) as response:
                prefix = response.read(512)
                result.update(status=response.status, content_type=response.headers.get('Content-Type', ''), final_url=response.url)
            lowered = prefix.lstrip().lower()
            is_html = lowered.startswith((b'<!doctype html', b'<html')) or 'text/html' in result['content_type'].lower()
            is_media = (prefix.startswith((b'\xff\xd8\xff', b'\x89PNG\r\n\x1a\n', b'GIF87a', b'GIF89a', b'\x1aE\xdf\xa3'))
                        or (prefix.startswith(b'RIFF') and prefix[8:12] == b'WEBP')
                        or prefix[4:8] in (b'ftyp', b'moov', b'mdat', b'wide')
                        or b'<svg' in lowered
                        or result['content_type'].lower().startswith(('image/', 'video/')))
            result['available'] = 200 <= response.status < 300 and bool(prefix) and is_media and not is_html
            result['note'] = 'Медиа доступно' if result['available'] else ('HTML вместо медиа' if is_html else 'Медиа не подтверждено')
            return result
        except urllib.error.HTTPError as error:
            result.update(status=error.code, final_url=error.url, note=str(error))
            if error.code < 500:
                return result
        except Exception as error:
            result['note'] = str(error)
    return result

rows = []
urls = set()
for url, uses in resources.items():
    parts = urllib.parse.urlsplit(url)
    row = {'source': url, 'uses': uses}
    if parts.hostname in ('www.voodyadev.online', 'voodyadev.online'):
        row['online_url'] = url
        row['com_url'] = urllib.parse.urlunsplit(parts._replace(netloc='voodyadev.com'))
        urls.update((row['online_url'], row['com_url']))
    else:
        row['external_url'] = url
        urls.add(url)
    rows.append(row)

print(f'Checking {len(resources)} unique resources, {len(urls)} URLs', flush=True)
results = {}
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    futures = {pool.submit(check, url): url for url in sorted(urls)}
    for future in concurrent.futures.as_completed(futures):
        results[futures[future]] = future.result()
        if len(results) % 40 == 0:
            print(f'Checked {len(results)}/{len(urls)}', flush=True)

summary = {'resources': len(rows), 'both': 0, 'online_only': 0, 'com_only': 0, 'neither_confirmed': 0, 'external': 0}
for row in rows:
    for key in ('online', 'com', 'external'):
        if key + '_url' in row:
            row[key] = results[row[key + '_url']]
    if 'external' in row:
        summary['external'] += 1
    else:
        a, b = row['online']['available'], row['com']['available']
        summary['both' if a and b else 'online_only' if a else 'com_only' if b else 'neither_confirmed'] += 1

report = {'checked_at_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'domain_note': 'www.voodyadev.com не существует в DNS. Проверяется https://voodyadev.com без www.', 'summary': summary, 'resources': rows}
(ROOT / 'media-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

def cell(result):
    if not result:
        return '—'
    status = str(result['status'] or 'ошибка сети')
    label = ('✅ Есть' if result['available'] else '❌ Нет' if result['status'] in (404, 410) else '⚠ Не подтверждено') + ' · ' + status
    detail = result['note'] + ' | ' + result['content_type']
    if result['final_url']:
        detail += ' | Итоговый URL: ' + result['final_url']
    return f'<a title="{html.escape(detail, quote=True)}" href="{html.escape(result["url"], quote=True)}">{label}</a><small>{html.escape(detail)}</small>'

body = []
for index, row in enumerate(rows, 1):
    context = '; '.join(dict.fromkeys(u['company'] + (' / ' + u['project'] if u['project'] else '') for u in row['uses']))
    fields = ', '.join(dict.fromkeys(u['field'] for u in row['uses']))
    path = urllib.parse.unquote(urllib.parse.urlsplit(row['source']).path)
    body.append(f'<tr><td>{index}</td><td>{html.escape(context)}<small>{html.escape(fields)}</small></td><td>{html.escape(path)}</td><td>{cell(row.get("online"))}</td><td>{cell(row.get("com"))}</td><td>{cell(row.get("external"))}</td></tr>')
page = '''<!doctype html><html lang="ru"><meta charset="utf-8"><title>Проверка медиа портфолио</title>
<style>body{font:14px system-ui;margin:28px;color:#182338;background:#f6f8fb}table{border-collapse:collapse;width:100%;background:white}th,td{padding:10px;border:1px solid #d8dfeb;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{position:sticky;top:0;background:#e7eef8}small{display:block;font-size:11px;color:#5a6474;margin-top:6px}a{color:#164a99}input{padding:10px;width:450px;max-width:90%;margin:12px 0}</style>
<h1>Изображения и видео: .online и .com</h1>'''
page += '<p>Проверено (UTC): ' + report['checked_at_utc'] + '</p>'
page += '<p><strong>' + report['domain_note'] + '</strong></p>'
page += f'<p>Уникальных ресурсов: {summary["resources"]}. На обоих доменах: {summary["both"]}; только .online: {summary["online_only"]}; только .com: {summary["com_only"]}; не подтверждены на обоих: {summary["neither_confirmed"]}; внешние ресурсы: {summary["external"]}.</p>'
page += '<p>GET с Range 0–511, проверка HTTP, типа содержимого и начала файла. Это проверка доступности, не полная проверка воспроизведения или идентичности файлов. Редиректы указаны в деталях. Для внешних доменов проверяется исходная ссылка.</p><input id="filter" placeholder="Фильтр по компании, проекту, пути или статусу"><table><thead><tr><th>№</th><th>Компания / проект</th><th>Ресурс</th><th>voodyadev.online</th><th>voodyadev.com</th><th>Внешний домен</th></tr></thead><tbody>'
page += ''.join(body) + '</tbody></table><script>document.querySelector("#filter").addEventListener("input",e=>{const q=e.target.value.toLowerCase();document.querySelectorAll("tbody tr").forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q))})</script></html>'
(ROOT / 'media-audit.html').write_text(page, encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False), flush=True)
