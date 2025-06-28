# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Set environment variables (Fly will override these if set in dashboard)
ENV NODE_ENV=production

# Start the bot
CMD ["npm", "start"]
