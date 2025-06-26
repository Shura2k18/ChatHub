# ====== DEV (Development) ======
FROM node:22 AS dev

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (и dev-зависимости)
RUN npm install

# Устанавливаем ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Копируем весь код в контейнер
COPY . .

# Открываем порт
EXPOSE 5000

# Запускаем сервер в dev-режиме с nodemon
CMD ["npm", "run", "dev"]

# ====== BUILD (Production) ======
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# ====== RUN (Production) ======
FROM node:22 AS prod

WORKDIR /app

# Копируем только нужные файлы из build-стадии
COPY --from=build /app /app
RUN apt-get update && apt-get install -y ffmpeg

# Открываем порт 5000
EXPOSE 5000

# Запускаем сервер
CMD ["npm", "start"]