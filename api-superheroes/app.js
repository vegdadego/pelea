import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from 'url';
import authController from "./controllers/authController.js";
import characterController from './controllers/characterController.js';
import battleController from './controllers/battleController.js';
import teamController from './controllers/teamController.js';

dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado a MongoDB Atlas");
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`📚 Documentación Swagger en: http://localhost:${PORT}/api-docs`);
      console.log(`🎮 Página principal en: http://localhost:${PORT}/main`);
      console.log(`🎮 Interfaz del juego en: http://localhost:${PORT}/game`);
      console.log(`⚔️ Batalla 1 vs 1 en: http://localhost:${PORT}/battle-1v1`);
      console.log(`⚔️ Batalla 3 vs 3 en: http://localhost:${PORT}/battle-3v3`);
      console.log(`📘 Historial de batallas en: http://localhost:${PORT}/battle-history`);
      console.log(`👑 Panel de administración en: http://localhost:${PORT}/admin`);
      console.log(`\n💡 Para acceder directamente a la página principal, abre: http://localhost:${PORT}/main`);
      console.log(`\n`);
    });
  })
  .catch((err) => {
    console.error("Error de conexión a MongoDB Atlas:", err);
  });

// Configuración de Swagger con JWT Bearer
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Superhéroes',
    version: '1.0.0',
    description: 'Documentación de la API de superhéroes con JWT',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['./controllers/*.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Redirigir la raíz '/' a la documentación Swagger
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.use('/api/auth', authController);
app.use('/api', characterController);
app.use('/api', battleController);
app.use('/api', teamController);

// Servir archivos estáticos
app.use('/game-interface', express.static(path.join(__dirname, 'game-interface')));

// Ruta para el panel de administración
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'game-interface', 'admin-interface.html'));
});

// Ruta para la página principal
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'game-interface', 'main.html'));
});

// Ruta para la interfaz principal del juego
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'game-interface', 'index.html'));
});

// Ruta para la batalla 1 vs 1
app.get('/battle-1v1', (req, res) => {
    res.sendFile(path.join(__dirname, 'game-interface', 'battle-1v1.html'));
});

// Ruta para la batalla 3 vs 3
app.get('/battle-3v3', (req, res) => {
    res.sendFile(path.join(__dirname, 'game-interface', 'battle-3v3.html'));
});

// Ruta para el historial de batallas
app.get('/battle-history', (req, res) => {
    res.sendFile(path.join(__dirname, 'game-interface', 'battle-history.html'));
}); 