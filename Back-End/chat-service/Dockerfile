# Stage 1: Build the application
FROM node:16.16.0-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .
# Compile TypeScript
RUN npm run build

# Stage 2: Production image
FROM node:16.16.0-alpine AS production

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy build files from the build stage
COPY --from=build /app/build ./build
COPY tsconfig.json ./
# Expose port
EXPOSE 8180

# Set the command to run your application
CMD ["npm", "run", "prod"]
