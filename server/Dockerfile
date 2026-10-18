FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# Do not run as root inside the container.
USER node
EXPOSE 8080
# Apply the database migrations (safe to repeat), then start the server.
CMD ["sh", "-c", "npm run db:migrate && node src/server.js"]
