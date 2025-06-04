# Stage 1: Install development dependencies
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Install production dependencies
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 3: Build the React app
FROM node:20-alpine AS build-env
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules
RUN npm run build && \
    echo "Contents of /app/build:" && ls -la /app/build

# Stage 4: Run the app
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
# REMOVE optional server folder COPY unless you're sure it exists
# COPY --from=build-env /app/build/server ./build/server

EXPOSE 3000
CMD ["npm", "run", "start"]