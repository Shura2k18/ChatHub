FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Создаём production-сборку
RUN npm run build

# ====== RUN Nginx =====
FROM nginx:alpine AS prod

# Копируем собранный билд в Nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
#FROM node:22 AS build
#
#WORKDIR /app
#
#COPY package*.json ./
#RUN npm install
#
#COPY . .
#
## Собираем приложение
#RUN npm run build
