# ЭТАП 1: Сборка проекта
FROM node:22-alpine as build

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь остальной код проекта
COPY . .

# Собираем проект (результат будет в папке /app/dist)
RUN npm run build

# ЭТАП 2: Запуск веб-сервера (Production)
FROM nginx:alpine

# Удаляем стандартный конфиг Nginx и копируем наш (см. файл nginx.conf ниже)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы из первого этапа в папку, которую раздает Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Если ты хочешь, чтобы контент (картинки, json) можно было обновлять без пересборки образа,
# можно объявить volume для папки assets или Content.
# VOLUME /usr/share/nginx/html/assets

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
