Write-Host "1. Checking Passenger status..."
docker-compose exec web passenger-status

Write-Host "2. Checking Nginx configuration..."
docker-compose exec web nginx -t

Write-Host "3. Checking application logs..."
docker-compose exec web tail -f /var/log/nginx/error.log

Write-Host "4. Checking Node process..."
docker-compose exec web ps aux | grep node 