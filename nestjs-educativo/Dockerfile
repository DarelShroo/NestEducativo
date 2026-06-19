# Lightweight Node Container for TypeScript/NestJS educational platform
FROM node:20-bullseye-slim

# Install dependencies if needed
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install TypeScript, tsx, and ts-node globally
RUN npm install -g typescript ts-node tsx @types/node @nestjs/cli

WORKDIR /app

# Install Node dependencies for the web server
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
