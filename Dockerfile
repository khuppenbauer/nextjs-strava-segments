# Use an official node runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

ARG DIRECTUS_URL
ARG DIRECTUS_TOKEN

ENV DIRECTUS_URL=${DIRECTUS_URL}
ENV DIRECTUS_TOKEN=${DIRECTUS_TOKEN}

# Build the Next.js app
RUN npm run build

# Start the Next.js app
CMD ["npm", "start"]

# Expose port 3000
EXPOSE 3000