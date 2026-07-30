Write-Host "Iniciando proceso de despliegue..." -ForegroundColor Cyan

Write-Host "1. Construyendo el frontend..." -ForegroundColor Yellow
npm run build

Write-Host "2. Preparando archivos (comprimiendo dist)..." -ForegroundColor Yellow
if (Test-Path dist.zip) { Remove-Item dist.zip }
tar.exe -a -c -f dist.zip dist

Write-Host "3. Subiendo archivos al servidor..." -ForegroundColor Yellow
scp dist.zip juan@192.168.1.9:~
scp backend\server.js juan@192.168.1.9:~/gestor/backend/

Write-Host "4. Ejecutando actualización en Ubuntu..." -ForegroundColor Yellow
ssh -t juan@192.168.1.9 "unzip -o ~/dist.zip -d ~/ && sudo rm -rf /var/www/gestor/* && sudo cp -r ~/dist/* /var/www/gestor/ && pm2 restart gestor-backend && sudo systemctl restart nginx"

Write-Host "¡Despliegue completado exitosamente!" -ForegroundColor Green
