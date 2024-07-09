FROM node:20-alpine AS build
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN mkdir -p /app/build
RUN npm install -g serve
COPY --from=build /app/build/ /app/build/
ENTRYPOINT ["serve","-s","build"]

