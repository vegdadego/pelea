import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación de usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - password
 *               - nombre
 *             properties:
 *               user:
 *                 type: string
 *                 description: Nombre de usuario único
 *               password:
 *                 type: string
 *                 description: Contraseña
 *               nombre:
 *                 type: string
 *                 description: Nombre completo
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos o usuario ya existe
 */
router.post('/register', async (req, res) => {
    try {
        const { user, password, nombre } = req.body;
        if (!user || !password || !nombre) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        const existingUser = await User.findOne({ user });
        if (existingUser) {
            return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ user, password: hashedPassword, nombre });
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - password
 *             properties:
 *               user:
 *                 type: string
 *                 description: Nombre de usuario
 *               password:
 *                 type: string
 *                 description: Contraseña
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token JWT
 *       400:
 *         description: Credenciales inválidas
 */
// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { user, password } = req.body;
        if (!user || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
        }
        const foundUser = await User.findOne({ user });
        if (!foundUser) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }
        const token = jwt.sign({ userId: foundUser._id, user: foundUser.user }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, user: { id: foundUser._id, user: foundUser.user, nombre: foundUser.nombre } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 