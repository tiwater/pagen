FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm install --production=false --legacy-peer-deps

# Copy app files
COPY . .

# Set environment variables
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=development

# Start in development mode for HMR
CMD ["npm", "run", "dev"]
