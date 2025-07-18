import express from 'express';
import { check, validationResult } from 'express-validator';
import characterService from '../services/characterService.js';
import authMiddleware, { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Personaje:
 *       type: object
 *       required:
 *         - nombre
 *         - alias
 *         - tipo
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         alias:
 *           type: string
 *         tipo:
 *           type: string
 *           enum: [heroe, villano]
 *         ciudad:
 *           type: string
 *         equipo:
 *           type: string
 *         stats:
 *           type: object
 *           properties:
 *             health:
 *               type: integer
 *             maxHealth:
 *               type: integer
 *             attack:
 *               type: integer
 *             defense:
 *               type: integer
 *             speed:
 *               type: integer
 */

/**
 * @swagger
 * /api/personajes:
 *   get:
 *     summary: Obtiene todos los personajes (Solo Administradores)
 *     tags: [Personajes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de personajes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 */
router.get('/personajes', authMiddleware, async (req, res) => {
    // Verificar si es admin
    if (!isAdmin(req.user)) {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden ver personajes.' });
    }
    
    try {
        const personajes = await characterService.getAllCharacters();
        res.json(personajes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/personajes/{id}:
 *   get:
 *     summary: Obtiene un personaje por ID (Solo Administradores)
 *     tags: [Personajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personaje encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 *       404:
 *         description: Personaje no encontrado
 */
router.get('/personajes/:id', authMiddleware, async (req, res) => {
    // Verificar si es admin
    if (!isAdmin(req.user)) {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden ver personajes.' });
    }
    
    try {
        const personaje = await characterService.getCharacterById(req.params.id);
        res.json(personaje);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/personajes:
 *   post:
 *     summary: Crea un nuevo personaje (Solo Administradores)
 *     tags: [Personajes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Personaje'
 *     responses:
 *       201:
 *         description: Personaje creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 */
router.post('/personajes',
    authMiddleware,
    [
        check('nombre').not().isEmpty().withMessage('El nombre es requerido'),
        check('alias').not().isEmpty().withMessage('El alias es requerido'),
        check('tipo').isIn(['heroe', 'villano']).withMessage('El tipo debe ser heroe o villano')
    ],
    async (req, res) => {
        // Verificar si es admin
        if (!isAdmin(req.user)) {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden crear personajes.' });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        try {
            const personaje = await characterService.addCharacter(req.body);
            res.status(201).json(personaje);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /api/personajes/{id}:
 *   put:
 *     summary: Actualiza un personaje (Solo Administradores)
 *     tags: [Personajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Personaje'
 *     responses:
 *       200:
 *         description: Personaje actualizado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 *       404:
 *         description: Personaje no encontrado
 */
router.put('/personajes/:id', authMiddleware, async (req, res) => {
    // Verificar si es admin
    if (!isAdmin(req.user)) {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden modificar personajes.' });
    }
    
    try {
        const personaje = await characterService.updateCharacter(req.params.id, req.body);
        res.json(personaje);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/personajes/{id}:
 *   delete:
 *     summary: Elimina un personaje (Solo Administradores)
 *     tags: [Personajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personaje eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 *       404:
 *         description: Personaje no encontrado
 */
router.delete('/personajes/:id', authMiddleware, async (req, res) => {
    // Verificar si es admin
    if (!isAdmin(req.user)) {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden eliminar personajes.' });
    }
    
    try {
        const result = await characterService.deleteCharacter(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/personajes/tipo/{tipo}:
 *   get:
 *     summary: Obtiene personajes por tipo (Solo Administradores)
 *     tags: [Personajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [heroe, villano]
 *     responses:
 *       200:
 *         description: Lista de personajes filtrados
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 */
router.get('/personajes/tipo/:tipo', authMiddleware, async (req, res) => {
    // Verificar si es admin
    if (!isAdmin(req.user)) {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden ver personajes.' });
    }
    
    try {
        const personajes = await characterService.getCharactersByType(req.params.tipo);
        res.json(personajes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 