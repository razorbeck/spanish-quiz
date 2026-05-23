FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Create data directory (will be replaced by persistent volume in DO)
RUN mkdir -p /var/data

# Non-root user for security
RUN addgroup -S quizapp && adduser -S quizapp -G quizapp
RUN chown -R quizapp:quizapp /app /var/data
USER quizapp

EXPOSE 3000

ENV NODE_ENV=production
ENV DB_DIR=/var/data

CMD ["node", "server.js"]
