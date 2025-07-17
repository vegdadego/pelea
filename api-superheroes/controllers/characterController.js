import express from 'express';
import { check, validationResult } from 'express-validator';
import characterService from '../services/characterService.js';

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
 *     summary: Obtiene todos los personajes
 *     tags: [Personajes]
 *     responses:
 *       200:
 *         description: Lista de personajes
 */
router.get('/personajes', async (req, res) => {
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
 *     summary: Obtiene un personaje por ID
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personaje encontrado
 *       404:
 *         description: Personaje no encontrado
 */
router.get('/personajes/:id', async (req, res) => {
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
 *     summary: Crea un nuevo personaje
 *     tags: [Personajes]
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
 */
router.post('/personajes',
    [
        check('nombre').not().isEmpty().withMessage('El nombre es requerido'),
        check('alias').not().isEmpty().withMessage('El alias es requerido'),
        check('tipo').isIn(['heroe', 'villano']).withMessage('El tipo debe ser heroe o villano')
    ],
    async (req, res) => {
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
 *     summary: Actualiza un personaje
 *     tags: [Personajes]
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
 *       404:
 *         description: Personaje no encontrado
 */
router.put('/personajes/:id', async (req, res) => {
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
 *     summary: Elimina un personaje
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personaje eliminado
 *       404:
 *         description: Personaje no encontrado
 */
router.delete('/personajes/:id', async (req, res) => {
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
 *     summary: Obtiene personajes por tipo (heroe o villano)
 *     tags: [Personajes]
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
 */
router.get('/personajes/tipo/:tipo', async (req, res) => {
    try {
        const personajes = await characterService.getCharactersByType(req.params.tipo);
        res.json(personajes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 