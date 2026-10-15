FROM node:24-alpine AS build

WORKDIR /src

COPY package*.json ./
RUN npm ci


COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /src

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /src/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
