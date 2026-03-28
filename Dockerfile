FROM node:20-alpine

# Install docker CLI (for docker compose) and git (for scanner)
RUN apk add --no-cache docker-cli git

WORKDIR /app

# Install backend deps (package-lock.json committed → reproducible)
COPY backend/package*.json backend/
RUN cd backend && npm install --omit=dev --ignore-scripts && npm install typescript ts-node-dev

# Install frontend deps
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

COPY backend/ backend/
COPY frontend/ frontend/

RUN cd backend && npm run build
RUN cd frontend && npm run build

EXPOSE 4242
CMD ["node", "backend/dist/index.js"]
