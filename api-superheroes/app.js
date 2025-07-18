import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authController from "./controllers/authController.js";
import characterController from './controllers/characterController.js';
import battleController from './controllers/battleController.js';
import teamController from './controllers/teamController.js';

dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();

app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado a MongoDB Atlas");
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`Documentación Swagger en: http://localhost:${PORT}/api-docs`);
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