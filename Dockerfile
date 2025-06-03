FROM node:20-alpine AS development-dependencies-env
COPY package*.json ./
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY package*.json ./
WORKDIR /app
RUN npm ci 

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app

RUN npm run build && \
    echo "Contents of /app/build:" && \
    ls -la /app/build && \
    echo "Contents of /app/build/server:" && \
    ls -la /app/build/server || echo "/app/build/server NOT FOUND"

FROM node:20-alpine
COPY package*.json ./
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build

# Avoid copy error if build/server doesn't exist
RUN mkdir -p /app/build/server
COPY --from=build-env /app/build/server /app/build/server 2>/dev/null || true

WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "start"]