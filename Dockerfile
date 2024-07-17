# Use the official Node.js image
FROM node:20-bullseye

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json, package-lock.json, and prisma schema to the working directory
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["pnpm", "run", "dev:docker"]
