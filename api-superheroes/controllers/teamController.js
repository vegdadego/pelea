import express from 'express';
import { check, validationResult } from 'express-validator';
import characterRepository from '../repositories/characterRepository.js';
import teamRepository from '../repositories/teamRepository.js';
import authMiddleware, { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Función para expandir los miembros de un equipo con info completa
async function expandTeam(team) {
    const personajes = await characterRepository.getCharacters();
    return {
        ...team,
        miembros: team.miembros.map(id => {
            const p = personajes.find(p => p.id === id);
            return p ? {
                id: p.id,
                nombre: p.nombre,
                alias: p.alias,
                tipo: p.tipo,
                stats: p.stats
            } : { id };
        })
    };
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipo:
 *       type: object
 *       required:
 *         - nombre
 *         - miembros
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         miembros:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs de los personajes (3)
 */

/**
 * @swagger
 * /api/equipos:
 *   get:
 *     summary: Obtiene todos los equipos
 *     tags: [Equipos]
 *     responses:
 *       200:
 *         description: Lista de equipos
 */
// Obtener todos los equipos (solo los del usuario, excepto admin)
router.get('/equipos', authMiddleware, async (req, res) => {
    const user = req.user;
    const teams = await teamRepository.getTeams();
    let filtered = teams;
    if (!isAdmin(user)) {
        filtered = teams.filter(t => t.userId === user.userId);
    }
    const expanded = await Promise.all(filtered.map(expandTeam));
    res.json(expanded);
});

/**
 * @swagger
 * /api/equipos/{id}:
 *   get:
 *     summary: Obtiene un equipo por ID
 *     tags: [Equipos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipo encontrado
 *       404:
 *         description: Equipo no encontrado
 */
// Obtener un equipo por ID (solo si es del usuario o admin)
router.get('/equipos/:id', authMiddleware, async (req, res) => {
    const user = req.user;
    const teams = await teamRepository.getTeams();
    const equipo = teams.find(t => t.id === parseInt(req.params.id));
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    if (!isAdmin(user) && equipo.userId !== user.userId) {
        return res.status(403).json({ error: 'Acceso denegado. Solo puedes ver tus propios equipos.' });
    }
    const expanded = await expandTeam(equipo);
    res.json(expanded);
});

/**
 * @swagger
 * /api/equipos:
 *   post:
 *     summary: Crea un nuevo equipo de 3 personajes (Requiere Autenticación)
 *     tags: [Equipos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipo'
 *     responses:
 *       201:
 *         description: Equipo creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
// Crear equipo (asignar userId)
router.post('/equipos',
    authMiddleware,
    [
        check('nombre').not().isEmpty().withMessage('El nombre es requerido'),
        check('miembros').isArray({ min: 3, max: 3 }).withMessage('El equipo debe tener exactamente 3 miembros'),
        check('miembros.*').isInt().withMessage('Todos los IDs de los miembros deben ser números enteros')
    ],
    async (req, res) => {
        const user = req.user;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        // Validar que los personajes existen
        const personajes = await characterRepository.getCharacters();
        for (const id of req.body.miembros) {
            if (!personajes.find(p => p.id === id)) {
                return res.status(400).json({ error: `El personaje con ID ${id} no existe` });
            }
        }
        const teams = await teamRepository.getTeams();
        const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
        const equipo = { id: newId, nombre: req.body.nombre, miembros: req.body.miembros, userId: user.userId };
        teams.push(equipo);
        await teamRepository.saveTeams(teams);
        res.status(201).json(equipo);
    }
);

/**
 * @swagger
 * /api/equipos/{id}:
 *   put:
 *     summary: Actualiza un equipo (Requiere Autenticación)
 *     tags: [Equipos]
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
 *             $ref: '#/components/schemas/Equipo'
 *     responses:
 *       200:
 *         description: Equipo actualizado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Equipo no encontrado
 */
// Modificar equipo (solo si es del usuario o admin)
router.put('/equipos/:id',
    authMiddleware,
    [
        check('nombre').not().isEmpty().withMessage('El nombre es requerido'),
        check('miembros').isArray({ min: 3, max: 3 }).withMessage('El equipo debe tener exactamente 3 miembros'),
        check('miembros.*').isInt().withMessage('Todos los IDs de los miembros deben ser números enteros')
    ],
    async (req, res) => {
        const user = req.user;
        const teams = await teamRepository.getTeams();
        const equipo = teams.find(t => t.id === parseInt(req.params.id));
        if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
        if (!isAdmin(user) && equipo.userId !== user.userId) {
            return res.status(403).json({ error: 'Acceso denegado. Solo puedes modificar tus propios equipos.' });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        // Validar que los personajes existen
        const personajes = await characterRepository.getCharacters();
        for (const id of req.body.miembros) {
            if (!personajes.find(p => p.id === id)) {
                return res.status(400).json({ error: `El personaje con ID ${id} no existe` });
            }
        }
        equipo.nombre = req.body.nombre;
        equipo.miembros = req.body.miembros;
        await teamRepository.saveTeams(teams);
        res.json(equipo);
    }
);

/**
 * @swagger
 * /api/equipos/{id}:
 *   delete:
 *     summary: Elimina un equipo (Requiere Autenticación)
 *     tags: [Equipos]
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
 *         description: Equipo eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Equipo no encontrado
 */
// Eliminar equipo (solo si es del usuario o admin)
router.delete('/equipos/:id', authMiddleware, async (req, res) => {
    const user = req.user;
    const teams = await teamRepository.getTeams();
    const index = teams.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Equipo no encontrado' });
    const equipo = teams[index];
    if (!isAdmin(user) && equipo.userId !== user.userId) {
        return res.status(403).json({ error: 'Acceso denegado. Solo puedes eliminar tus propios equipos.' });
    }
    teams.splice(index, 1);
    await teamRepository.saveTeams(teams);
    res.json({ message: 'Equipo eliminado' });
});

export default router; 