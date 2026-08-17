# Portfolio site

Одностраничное портфолио Владимира Васильева. Это статический React-сайт: отдельного backend-сервера и базы данных нет.

## Что внутри

- **React 19 + Vite 7** — интерфейс и production-сборка.
- **Tailwind CSS** — стили, применяемые прямо в JSX-классах.
- **lucide-react** — иконки.
- [src/App.jsx](src/App.jsx) — практически всё приложение: три вкладки (опыт, портфолио, контакты), модальные окна проектов и форма обратной связи.
- [public/assets/Content.json](public/assets/Content.json) — данные о компаниях и проектах. При запуске сайт загружает этот файл и сортирует записи по `StartDate`; изменять портфолио в первую очередь следует здесь.
- Медиафайлы и аватар в большинстве случаев загружаются по внешним URL `https://www.voodyadev.online/...`, а не хранятся в репозитории.
- Форма контактов и событие посещения отправляют POST-запросы в два webhook-а Make.com, адреса которых сейчас заданы прямо в `src/App.jsx`.

## Требования

- Node.js **22 LTS** (допустимы Node.js >=20.19 или >=22.12).
- npm (поставляется с Node.js).
- Docker Desktop — только для контейнерного деплоя.

## Локальная разработка и проверка

```powershell
npm ci
npm run dev
```

Vite напечатает локальный адрес, обычно `http://localhost:5173`. Откройте его в браузере и проверьте:

1. загрузился ли список опыта и карточки проектов;
2. работают ли фильтр и модальные окна;
3. корректно ли открываются ссылки и внешние изображения;
4. при необходимости — отправку формы (она отправляет реальный запрос в Make.com).

Команды контрольной проверки:

```powershell
npm run build      # создаёт готовую статику в dist/
npm run preview    # проверяет именно собранную версию, обычно на http://localhost:4173
npm run lint       # статический анализ JSX/JavaScript
```

`dist/` — одноразовый результат сборки, он игнорируется Git и не должен коммититься.

## Деплой без Docker

Подходит для любого статического хостинга или вашего Nginx.

```powershell
npm ci
npm run build
```

Загрузите **содержимое** папки `dist/` в web-root сайта (например, `/var/www/portfolio`). Важно сохранить путь `assets/Content.json`: без него приложение покажет ошибку загрузки данных. Для Nginx используйте правило SPA fallback: `try_files $uri $uri/ /index.html;`.

## Деплой в Docker

В `Dockerfile` — двухэтапная сборка: Node собирает Vite-приложение, затем Nginx раздаёт файлы на порту 80. Конфиг [nginx.conf](nginx.conf) уже содержит SPA fallback, gzip и кэширование статики.

```powershell
docker build -t portfolio-site:latest .
docker run -d --name portfolio-site --restart unless-stopped -p 8080:80 portfolio-site:latest
```

## Защищённое редактирование `/configure`

В проекте настроен Cloudflare Worker, который защищает редактор паролем и сохраняет изменения в Cloudflare KV. Для работы в Cloudflare создайте KV namespace (например, `portfolio-content`) и добавьте к Worker binding:

```text
Variable name: CONFIG_CONTENT
Type: KV Namespace
Value: portfolio-content
```

Также добавьте два **Secret** (не обычные Variables):

```text
CONFIGURE_PASSWORD        # пароль для входа
CONFIGURE_SESSION_SECRET  # случайная длинная строка для подписи сессии
```

После следующего деплоя редактор доступен по `https://ваш-домен/configure/`. В нём можно отредактировать и сохранить JSON. Публичный сайт автоматически получает сохранённую в KV версию по прежнему адресу `/assets/Content.json`; если KV ещё пуст, используется файл из репозитория.

В конфигурации [wrangler.jsonc](wrangler.jsonc) Worker уже подключён к собранной папке `dist`. Не удаляйте `main`, `assets.binding` и `assets.run_worker_first` из этого файла.

После запуска сайт будет доступен по `http://localhost:8080`. На сервере замените `8080` на свободный внешний порт или подключите контейнер к reverse proxy с HTTPS.

Чтобы обновить опубликованную версию после изменений:

```powershell
docker build -t portfolio-site:latest .
docker stop portfolio-site
docker rm portfolio-site
docker run -d --name portfolio-site --restart unless-stopped -p 8080:80 portfolio-site:latest
```

## Перед публикацией

- Проверьте, что ссылки на `voodyadev.online` и Make.com доступны с устройства посетителя.
- Проверьте, что JSON валиден: `Get-Content public/assets/Content.json -Raw | ConvertFrom-Json | Out-Null`.
- Если домен отличается от корневого пути (например, сайт размещён в `https://example.com/portfolio/`), потребуется задать `base` в `vite.config.js` и пересобрать приложение.
- В `nginx.conf` JSON кэшируется до шести месяцев, но приложение добавляет к запросу timestamp-параметр, поэтому после обновления `Content.json` браузер всё равно запрашивает свежую версию.

## Текущий статус проверок

- `npm ci` — успешно.
- `npm run build` — успешно.
- `npm run lint` — сейчас завершается с 5 ошибками в `src/App.jsx` (неиспользуемые переменные и правило React Hooks). Они не блокируют production-сборку, но их стоит исправить отдельно перед настройкой CI.
