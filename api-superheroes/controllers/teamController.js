import express from 'express';
import { check, validationResult } from 'express-validator';
import authMiddleware, { isAdmin } from '../middleware/authMiddleware.js';
import Team from '../models/teamModel.js';
import Character from '../models/characterModel.js';

const router = express.Router();

// Función para expandir los miembros de un equipo con info completa y mapear _id a id
function mapTeamId(team) {
    if (!team) return team;
    const obj = team.toObject ? team.toObject() : team;
    obj.id = obj._id;
    delete obj._id;
    return obj;
}

async function expandTeam(team) {
    // Consultar personajes desde MongoDB
    const personajes = await Character.find({ id: { $in: team.miembros } });
    const mapped = mapTeamId(team);
    return {
        ...mapped,
        miembros: mapped.miembros.map(id => {
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
    let teams;
    if (isAdmin(user)) {
        teams = await Team.find();
    } else {
        teams = await Team.find({ userId: user._id || user.userId });
    }
    const expanded = await Promise.all(teams.map(expandTeam));
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
    let equipo;
    try {
        equipo = await Team.findOne({ id: parseInt(req.params.id) });
    } catch {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    if (!isAdmin(user) && equipo.userId.toString() !== (user._id || user.userId).toString()) {
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
        const personajes = await Character.find({ id: { $in: req.body.miembros } });
        for (const id of req.body.miembros) {
            if (!personajes.find(p => p.id === id)) {
                return res.status(400).json({ error: `El personaje con ID ${id} no existe` });
            }
        }
        // Guardar en MongoDB con id incremental
        try {
            const lastTeam = await Team.findOne().sort({ id: -1 });
            const nextId = lastTeam && lastTeam.id ? lastTeam.id + 1 : 1;
            const equipo = new Team({
                id: nextId,
                nombre: req.body.nombre,
                miembros: req.body.miembros,
                userId: user._id || user.userId
            });
            await equipo.save();
            res.status(201).json(equipo);
        } catch (err) {
            res.status(500).json({ error: 'Error al guardar el equipo en la base de datos', details: err.message });
        }
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
        let equipo;
        try {
            equipo = await Team.findOne({ id: parseInt(req.params.id) });
        } catch {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
        if (!isAdmin(user) && equipo.userId.toString() !== (user._id || user.userId).toString()) {
            return res.status(403).json({ error: 'Acceso denegado. Solo puedes modificar tus propios equipos.' });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        // Validar que los personajes existen
        const personajes = await Character.find({ id: { $in: req.body.miembros } });
        for (const id of req.body.miembros) {
            if (!personajes.find(p => p.id === id)) {
                return res.status(400).json({ error: `El personaje con ID ${id} no existe` });
            }
        }
        equipo.nombre = req.body.nombre;
        equipo.miembros = req.body.miembros;
        await equipo.save();
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
    let equipo;
    try {
        equipo = await Team.findOne({ id: parseInt(req.params.id) });
    } catch {
        return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    if (!isAdmin(user) && equipo.userId.toString() !== (user._id || user.userId).toString()) {
        return res.status(403).json({ error: 'Acceso denegado. Solo puedes eliminar tus propios equipos.' });
    }
    await equipo.deleteOne();
    res.json({ message: 'Equipo eliminado' });
});

/**
 * @swagger
 * /api/equipos/clear:
 *   delete:
 *     summary: Vacía todos los equipos (Solo Admin)
 *     tags: [Equipos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los equipos eliminados
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo admin
 */
// Vaciar todos los equipos (solo admin)
router.delete('/equipos/clear', authMiddleware, async (req, res) => {
    const user = req.user;
    
    if (!isAdmin(user)) {
        return res.status(403).json({ error: 'Acceso denegado. Solo los administradores pueden vaciar todos los equipos.' });
    }
    
    try {
        const result = await Team.deleteMany({});
        res.json({ 
            message: 'Todos los equipos han sido eliminados', 
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al vaciar los equipos', 
            details: error.message 
        });
    }
});

export default router; 