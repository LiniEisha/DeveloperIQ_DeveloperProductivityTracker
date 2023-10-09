FROM node:14

WORKDIR /prService

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy all application files to the container's working directory
COPY . .

# Expose the port your application is running on (if needed)
EXPOSE 3000

# Set AWS credentials as environment variables
ENV AWS_ACCESS_KEY_ID=AKIA345HUQEBK5ULT3E6
ENV AWS_SECRET_ACCESS_KEY=2nscwxsc6/6iS9NZLnUuQKltCaPW7zP7GygDhDP3
ENV AWS_REGION=ap-south-1

# Define the command to run your application
CMD [ "node", "prService.js" ]
