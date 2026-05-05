FROM node:20-slim

WORKDIR /app
COPY package.json ./
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
