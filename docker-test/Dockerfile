FROM phusion/passenger-nodejs:latest

# Enable Nginx and Node.js
RUN rm /etc/service/nginx/down
RUN rm /etc/nginx/sites-enabled/default

# Set up application directory
WORKDIR /home/app/webapp

# Install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the Vite application
RUN npm run build

# Copy Passenger Nginx configuration
COPY docker-test/passenger.conf /etc/nginx/sites-enabled/webapp.conf

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Use baseimage-docker's init process
CMD ["/sbin/my_init"] 