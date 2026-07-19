const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors()); // Permitir peticiones desde nuestro frontend (puerto 5173)
app.use(express.json());

// Servir la carpeta uploads como archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurar que exista la carpeta uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Usar area y ticketId del body, o 'misc' si no viene
    const area = req.body.area || 'misc';
    const ticketId = req.body.ticketId || 'misc';
    const dynamicDir = path.join(uploadDir, area, ticketId);
    if (!fs.existsSync(dynamicDir)) {
      fs.mkdirSync(dynamicDir, { recursive: true });
    }
    cb(null, dynamicDir);
  },
  filename: function (req, file, cb) {
    // Evitar colisiones de nombres: [timestamp]-[nombre original]
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB por archivo
});

// Endpoint POST para subir múltiples archivos
// Espera un campo llamado 'adjuntos'
app.post('/api/upload', upload.array('adjuntos', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No se subieron archivos.' });
    }

    // Mapear los archivos a URLs públicas
    const area = req.body.area || 'misc';
    const ticketId = req.body.ticketId || 'misc';
    const urls = req.files.map(file => {
      return `http://localhost:${PORT}/uploads/${area}/${ticketId}/${file.filename}`;
    });

    res.json({
      success: true,
      message: 'Archivos subidos exitosamente',
      urls: urls
    });
  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend de Gestor corriendo en http://localhost:${PORT}`);
  console.log(`Endpoint de subida: POST http://localhost:${PORT}/api/upload`);
});
