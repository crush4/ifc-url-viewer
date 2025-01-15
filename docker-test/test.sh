#!/bin/bash

# Stop existing containers
docker-compose down

# Build fresh containers
docker-compose build --no-cache

# Run the container
docker-compose up 