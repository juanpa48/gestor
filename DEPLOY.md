# 📋 Instructivo de Despliegue — Gestor ACT

Cada vez que hagas cambios en el código y quieras que se reflejen para los usuarios de la empresa, sigue estos pasos **en el orden exacto**.

---

## PARTE 1: Comandos en Windows (PowerShell)

Abre **PowerShell** en tu computadora y ejecuta estos comandos **uno por uno**.

---

### Paso 1 — Entrar a la carpeta del proyecto
```powershell
cd F:\descargas\gestor
```

---

### Paso 2 — Compilar el frontend (React → archivos optimizados)
```powershell
npm run build
```
> **¿Qué hace?** Toma todo tu código de React y lo convierte en archivos listos para producción dentro de la carpeta `dist`. Lee el archivo `.env.production` para saber la IP del backend (`192.168.1.9`).

---

### Paso 3 — Borrar el ZIP viejo y crear uno nuevo
```powershell
del dist.zip
tar.exe -a -c -f dist.zip dist
```
> **¿Qué hace?** Primero borra el ZIP anterior (para que no haya conflictos). Luego comprime la carpeta `dist` en un archivo `dist.zip` listo para enviar.

---

### Paso 4 — Enviar el frontend (dist.zip) a Ubuntu
```powershell
scp dist.zip juan@192.168.1.9:~
```
> **¿Qué hace?** Envía el archivo `dist.zip` al servidor Ubuntu, a la carpeta `/home/juan/`.
> Te pedirá la contraseña de juan. Escríbela y dale Enter. No vas a ver lo que escribes, es normal por seguridad.

---

### Paso 5 — Enviar el backend (server.js) a Ubuntu
```powershell
scp backend\server.js juan@192.168.1.9:~/gestor/backend/
```
> **¿Qué hace?** Envía el archivo `server.js` actualizado al servidor Ubuntu, directamente a la carpeta donde pm2 lo ejecuta: `/home/juan/gestor/backend/`.
> Te pedirá la contraseña de nuevo.

> ⚠️ **MUY IMPORTANTE:** La ruta es `~/gestor/backend/`, NO `~/backend/`. Si te equivocas de ruta, el archivo no llega al lugar correcto y los cambios del backend no se aplican.

---

## PARTE 2: Comandos en Ubuntu (Terminal SSH)

Ahora ve a tu **terminal de Ubuntu** (donde dice `juan@serverweb`) y ejecuta estos comandos **uno por uno**.

---

### Paso 6 — Descomprimir el ZIP del frontend
```bash
unzip -o ~/dist.zip -d ~/
```
> **¿Qué hace?** Descomprime el `dist.zip` que acabas de enviar. La opción `-o` significa "overwrite" (sobrescribir), así que reemplaza automáticamente los archivos viejos. No necesitas borrar nada antes.

---

### Paso 7 — Borrar el frontend viejo de Nginx
```bash
sudo rm -rf /var/www/gestor/*
```
> **¿Qué hace?** Borra todo lo que hay dentro de la carpeta donde Nginx sirve la página web. Es necesario para que no queden archivos viejos mezclados con los nuevos.

---

### Paso 8 — Copiar el frontend nuevo a Nginx
```bash
sudo cp -r ~/dist/* /var/www/gestor/
```
> **¿Qué hace?** Copia los archivos nuevos (recién descomprimidos) a la carpeta de Nginx. A partir de este momento, Nginx servirá la versión actualizada del frontend.

---

### Paso 9 — Reiniciar el backend y Nginx
```bash
pm2 restart gestor-backend
sudo systemctl restart nginx
```
> **¿Qué hace?**
> - `pm2 restart gestor-backend` → Reinicia el backend (Node.js) para que lea el `server.js` nuevo que acabas de enviar.
> - `sudo systemctl restart nginx` → Reinicia el servidor web para que sirva los archivos nuevos del frontend.

---

### Paso 10 — Verificar que todo está bien
```bash
pm2 status
```
> Deberías ver `gestor-backend` con status **online** en verde. Si dice "errored" en rojo, algo salió mal con el server.js.

---

## ✅ ¡LISTO!

Dile a tus compañeros que recarguen la página con **Ctrl + F5** (esto fuerza al navegador a descargar la versión nueva y no usar la que tiene guardada en caché).

---

## 📋 Resumen Rápido (Copia y Pega)

Cuando ya te sepas los pasos de memoria, usa este resumen rápido:

**En Windows (PowerShell):**
```powershell
cd F:\descargas\gestor
npm run build
del dist.zip
tar.exe -a -c -f dist.zip dist
scp dist.zip juan@192.168.1.9:~
scp backend\server.js juan@192.168.1.9:~/gestor/backend/
```

**En Ubuntu (SSH):**
```bash
unzip -o ~/dist.zip -d ~/
sudo rm -rf /var/www/gestor/*
sudo cp -r ~/dist/* /var/www/gestor/
pm2 restart gestor-backend
sudo systemctl restart nginx
```

---

## 🗺️ Mapa de Rutas (para que nunca te confundas)

| Qué es | Ruta en Ubuntu |
|---|---|
| Carpeta personal de juan | `/home/juan/` (también se escribe `~/`) |
| Backend (server.js + código Node) | `/home/juan/gestor/backend/` |
| Frontend servido por Nginx | `/var/www/gestor/` |
| Archivos adjuntos (uploads) | `/home/juan/gestor/backend/uploads/` |
| Logs del backend | `pm2 logs gestor-backend` |
| Proceso del backend | `pm2 info gestor-backend` |

---

## 🚀 Despliegue Automático (La forma más rápida)

En lugar de hacer los pasos anteriores uno por uno, ahora tenemos un script que hace todo automáticamente.

### 1. ¿Cómo usar el script?
Solo abre tu terminal en Windows (PowerShell) dentro de la carpeta del proyecto y ejecuta:
```powershell
.\deploy.ps1
```
El script se encargará de:
1. Construir el frontend (`npm run build`).
2. Comprimir la carpeta en `.zip`.
3. Enviar todo al servidor mediante `scp`.
4. Conectarse a Ubuntu para descomprimir, copiar y reiniciar servicios.

---

## 🔑 Configurar Llaves SSH (Para no escribir contraseñas)

Si usas el script desde otra computadora o servidor y no quieres estar escribiendo la contraseña a cada rato, debes configurar una Llave SSH. Esto vincula tu computadora actual con el servidor de forma segura.

Ejecuta estos dos comandos en PowerShell **uno por uno**:

**Paso 1: Crear la llave en tu Windows**
```powershell
ssh-keygen -t ed25519
```
*(Cuando te pregunte dónde guardarla o te pida "passphrase", **NO escribas nada**, solo presiona la tecla `Enter` 3 veces).*

**Paso 2: Enviar la llave al servidor Ubuntu**
```powershell
Get-Content ~/.ssh/id_ed25519.pub | ssh juan@192.168.1.9 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```
*(Aquí te pedirá la contraseña del servidor por única y última vez).*

¡Listo! A partir de ahora, cuando ejecutes `.\deploy.ps1` desde ese PC, entrará directo sin pedirte la clave.
