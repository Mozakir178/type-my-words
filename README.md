Dockerfile.frontend
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


docker-compose.yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: typing-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
      - ./backend/mongo-init:/docker-entrypoint-initdb.d:ro
    environment:
      MONGO_INITDB_DATABASE: typing-practice
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/typing-practice --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    container_name: typing-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/typing-practice
      - JWT_SECRET=${JWT_SECRET:-change-me-in-production}
      - FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}
    depends_on:
      mongodb:
        condition: service_healthy
    volumes:
      - ./backend/logs:/app/logs
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    container_name: typing-frontend
    restart: unless-stopped
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=/api
    depends_on:
      - backend
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/conf.d/default.conf:ro

  # Optional: Redis for caching leaderboards
  redis:
    image: redis:7-alpine
    container_name: typing-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  mongo-data:
  redis-data:


docker-compose-dev.yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:5000/api
    command: npm run dev









    # 🚀 TypeMyWords - Full-Stack Typing Practice Platform

A modern, production-ready typing practice application built with React, Node.js, Express, MongoDB, and Socket.io. Inspired by Monkeytype & 10FastFingers.

## ✨ Features
- ⌨️ **Smart Typing Engine**: Smooth caret, word highlighting, backspace logic, anti-cheat paste prevention
- 📊 **Real-time Metrics**: WPM, accuracy, consistency, error tracking, keyboard heatmap
- 👤 **Authentication**: JWT-based login/signup with bcrypt password hashing
- 📈 **Dashboard & Analytics**: Interactive charts, test history, performance trends
- 🏆 **Leaderboards**: Global rankings with daily/weekly/monthly filters
- 🌐 **Multiplayer Mode**: Real-time typing races via WebSockets
- 🎨 **UI/UX**: Dark/Light mode, focus mode, responsive design, smooth animations

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Framer Motion, Recharts, Axios, Socket.io Client
- **Backend**: Node.js, Express, Mongoose, Socket.io, Express Validator, Helmet
- **Database**: MongoDB (Atlas compatible)
- **Deployment Ready**: Docker, Vercel/Render compatible

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd TypeMyWords

# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..