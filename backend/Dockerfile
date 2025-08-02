# Backend Dockerfile

FROM node:20-alpine

WORKDIR /user/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN mkdir -p /usr/src/app/logs

EXPOSE 3001

CMD ["npm", "start"]