FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Non-root user for security
RUN addgroup -S quizapp && adduser -S quizapp -G quizapp
RUN chown -R quizapp:quizapp /app
USER quizapp

# DigitalOcean App Platform injects PORT at runtime — default 8080
EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "server.js"]
