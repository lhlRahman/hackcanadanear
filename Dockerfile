# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json .
COPY package-lock.json .  # Or yarn.lock if using Yarn
RUN npm install

# Bundle app source
COPY . .

# Expose port 3000 for the app
EXPOSE 3000

# Run the app when the container launches
CMD ["npm", "start"]
