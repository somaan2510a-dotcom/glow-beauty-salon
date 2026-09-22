FROM node:22-alpine

WORKDIR /app

COPY server/package.json ./server/
RUN cd server && npm install --omit=dev --no-audit --no-fund

COPY server ./server

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server/index.js"]
