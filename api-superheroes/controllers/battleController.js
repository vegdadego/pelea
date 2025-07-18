import express from "express";
import { check, validationResult } from 'express-validator';
import battleService from "../services/battleService.js";
import teamController from './teamController.js';
import characterRepository from '../repositories/characterRepository.js';
import teamRepository from '../repositories/teamRepository.js';
import battleRepository from '../repositories/battleRepository.js';
import Character from '../models/characterModel.js';
import authMiddleware, { isAdmin, filterCharactersForUser, filterBattlesForUser, filterBattleStateForUser } from '../middleware/authMiddleware.js';

// Obtener referencia a los equipos
import teamsModule from './teamController.js';
let teams = null;
if (teamsModule && teamsModule.__esModule && teamsModule.default) {
    teams = teamsModule.default.teams || null;
}

const router = express.Router();

// Proteger todos los endpoints de batallas (excepto personajes y ataques)
router.use(['/battles', '/battles/1v1', '/battles/create', '/battles/team-vs-team', '/battles/action', '/battles/:id', '/battles/:id/round', '/battles/:id/simulate', '/battles/:battleId/state', '/battles/:battleId/available-actions'], authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Attack:
 *       type: object
 *       properties:
 *         attacker:
 *           type: string
 *           description: Nombre del atacante
 *         defender:
 *           type: string
 *           description: Nombre del defensor
 *         attackName:
 *           type: string
 *           description: Nombre del ataque usado
 *         attackDescription:
 *           type: string
 *           description: Descripción del ataque
 *         damage:
 *           type: integer
 *           description: Daño real infligido
 *         critical:
 *           type: boolean
 *           description: Si fue un golpe crítico
 *         miss:
 *           type: boolean
 *           description: Si el ataque falló
 *         defenderHealth:
 *           type: integer
 *           description: Vida restante del defensor
 *         baseDamage:
 *           type: integer
 *           description: Daño base del ataque
 *         finalDamage:
 *           type: integer
 *           description: Daño final calculado
 *         attackType:
 *           type: string
 *           enum: [normal, especial]
 *           description: Tipo de ataque realizado
 *         isFinalAttack:
 *           type: boolean
 *           description: Si fue un ataque final
 *         defenderUsedShield:
 *           type: boolean
 *           description: Si el defensor usó escudo
 *     Round:
 *       type: object
 *       properties:
 *         round:
 *           type: integer
 *           description: Número del round
 *         attacks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Attack'
 *     CharacterState:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del personaje
 *         nombre:
 *           type: string
 *           description: Nombre real del personaje
 *         alias:
 *           type: string
 *           description: Alias del personaje
 *         tipo:
 *           type: string
 *           description: Tipo de personaje (heroe/villano)
 *         currentHealth:
 *           type: integer
 *           description: Vida actual del personaje
 *         maxHealth:
 *           type: integer
 *           description: Vida máxima del personaje
 *         isAlive:
 *           type: boolean
 *           description: Si el personaje está vivo
 *         teamId:
 *           type: integer
 *           description: ID del equipo al que pertenece
 *     BattleAction:
 *       type: object
 *       required:
 *         - battleId
 *         - attackerId
 *         - targetId
 *         - attackType
 *       properties:
 *         battleId:
 *           type: string
 *           description: ID de la batalla activa
 *         attackerId:
 *           type: integer
 *           description: ID del personaje que ataca
 *         targetId:
 *           type: integer
 *           description: ID del personaje que recibe el ataque
 *         attackType:
 *           type: string
 *           enum: [normal, especial]
 *           description: Tipo de ataque a realizar
 *     AttackResult:
 *       type: object
 *       properties:
 *         attackName:
 *           type: string
 *           description: Nombre del ataque
 *         attackDescription:
 *           type: string
 *           description: Descripción del ataque
 *         baseDamage:
 *           type: integer
 *           description: Daño base calculado
 *         finalDamage:
 *           type: integer
 *           description: Daño final antes de defensa
 *         actualDamage:
 *           type: integer
 *           description: Daño real infligido
 *         critical:
 *           type: boolean
 *           description: Si fue un golpe crítico
 *         miss:
 *           type: boolean
 *           description: Si el ataque falló
 *     BattleState:
 *       type: object
 *       properties:
 *         currentTurn:
 *           type: integer
 *           description: Número de turno actual
 *         currentTeamTurn:
 *           type: integer
 *           description: Equipo que tiene el turno (1 o 2)
 *         remainingActions:
 *           type: integer
 *           description: Acciones restantes del equipo actual en este turno
 *         characterStates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CharacterState'
 *         isFinished:
 *           type: boolean
 *           description: Si la batalla ha terminado
 *         winner:
 *           type: string
 *           description: Ganador de la batalla
 *         loser:
 *           type: string
 *           description: Perdedor de la batalla
 *     BattleActionResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de confirmación
 *         attackResult:
 *           $ref: '#/components/schemas/AttackResult'
 *         battleState:
 *           $ref: '#/components/schemas/BattleState'
 *         attackLog:
 *           $ref: '#/components/schemas/Attack'
 *     AvailableActions:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de confirmación
 *         currentTeam:
 *           type: integer
 *           description: Equipo que tiene el turno actual (1 o 2)
 *         remainingActions:
 *           type: integer
 *           description: Acciones restantes del equipo actual
 *         availableAttackers:
 *           type: array
 *           description: Personajes del equipo actual que pueden atacar
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID del personaje
 *               alias:
 *                 type: string
 *                 description: Alias del personaje
 *               currentHealth:
 *                 type: integer
 *                 description: Vida actual del personaje
 *               isAlive:
 *                 type: boolean
 *                 description: Si el personaje está vivo
 *         availableTargets:
 *           type: array
 *           description: Personajes del equipo contrario que pueden ser atacados
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID del personaje
 *               alias:
 *                 type: string
 *                 description: Alias del personaje
 *               currentHealth:
 *                 type: integer
 *                 description: Vida actual del personaje
 *               isAlive:
 *                 type: boolean
 *                 description: Si el personaje está vivo
 *     Battle:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la batalla (MongoDB ObjectId)
 *         type:
 *           type: string
 *           description: Tipo de batalla (1v1 o 3v3)
 *         char1:
 *           type: object
 *           description: Primer personaje (para batallas 1v1)
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             alias:
 *               type: string
 *             tipo:
 *               type: string
 *             stats:
 *               type: object
 *         char2:
 *           type: object
 *           description: Segundo personaje (para batallas 1v1)
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             alias:
 *               type: string
 *             tipo:
 *               type: string
 *             stats:
 *               type: object
 *         equipo1:
 *           type: object
 *           description: Primer equipo (para batallas 3v3)
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             miembros:
 *               type: array
 *               items:
 *                 type: integer
 *         equipo2:
 *           type: object
 *           description: Segundo equipo (para batallas 3v3)
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             miembros:
 *               type: array
 *               items:
 *                 type: integer
 *         rounds:
 *           type: array
 *           description: Rounds de la batalla
 *           items:
 *             $ref: '#/components/schemas/Round'
 *         currentRound:
 *           type: integer
 *           description: Número del round actual
 *         currentTurn:
 *           type: integer
 *           description: Número del turno actual
 *         currentTeamTurn:
 *           type: integer
 *           description: Equipo que tiene el turno actual (1 o 2)
 *         remainingActions:
 *           type: integer
 *           description: Acciones restantes del equipo actual en este turno
 *         currentCharacterStates:
 *           type: array
 *           description: Estado actual de todos los personajes
 *           items:
 *             $ref: '#/components/schemas/CharacterState'
 *         battleStatus:
 *           type: string
 *           enum: [active, finished, paused]
 *           description: Estado actual de la batalla
 *         isFinished:
 *           type: boolean
 *           description: Si la batalla ha terminado
 *         winner:
 *           type: string
 *           description: Ganador de la batalla
 *         loser:
 *           type: string
 *           description: Perdedor de la batalla
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de inicio
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de finalización
 *         userFinalAttackUsed:
 *           type: boolean
 *           description: Si el usuario usó su ataque final
 *         userShieldUsed:
 *           type: boolean
 *           description: Si el usuario usó su escudo
 *         opponentFinalAttackUsed:
 *           type: boolean
 *           description: Si el oponente usó su ataque final
 *         opponentShieldUsed:
 *           type: boolean
 *           description: Si el oponente usó su escudo
 */

/**
 * @swagger
 * /api/battles:
 *   get:
 *     summary: Obtiene todas las batallas del usuario
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de batallas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Battle'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get("/battles", async (req, res) => {
    try {
        const user = req.user;
        
        // Si es admin, obtener todas las batallas
        if (isAdmin(user)) {
            const allBattles = await battleRepository.getAllBattles();
            res.json(allBattles);
        } else {
            // Si es usuario normal, solo sus batallas
            const userBattles = await battleRepository.getBattlesByUserId(user.userId);
            const filteredBattles = filterBattlesForUser(userBattles, user);
            res.json(filteredBattles);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint especial para admin - ver todas las batallas con detalles completos
router.get("/admin/battles", authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        
        if (!isAdmin(user)) {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden acceder a este endpoint.' });
        }
        
        const allBattles = await battleRepository.getAllBattles();
        res.json({
            message: 'Todas las batallas obtenidas (vista de administrador)',
            totalBattles: allBattles.length,
            battles: allBattles
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/battles/characters:
 *   get:
 *     summary: Obtiene todos los personajes disponibles para batalla
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de personajes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: "Peter Parker"
 *                   alias:
 *                     type: string
 *                     example: "Spider-Man"
 *                   tipo:
 *                     type: string
 *                     example: "heroe"
 *                   stats:
 *                     type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get("/battles/characters", async (req, res) => {
    try {
        const user = req.user;
        const characters = await characterRepository.getCharacters();
        const filteredCharacters = filterCharactersForUser(characters, user);
        res.json(filteredCharacters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint especial para admin - ver todos los personajes con detalles completos
router.get("/admin/characters", authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        
        if (!isAdmin(user)) {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden acceder a este endpoint.' });
        }
        
        const characters = await characterRepository.getCharacters();
        res.json({
            message: 'Todos los personajes obtenidos (vista de administrador)',
            totalCharacters: characters.length,
            characters: characters
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/battles/1v1:
 *   post:
 *     summary: Crea una nueva batalla 1v1 entre personajes
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - char1Id
 *               - char2Id
 *             properties:
 *               char1Id:
 *                 type: integer
 *                 description: ID del primer personaje
 *                 example: 1
 *               char2Id:
 *                 type: integer
 *                 description: ID del segundo personaje
 *                 example: 2
 *     responses:
 *       201:
 *         description: Batalla creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Batalla creada exitosamente"
 *                 battleId:
 *                   type: string
 *                   example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                 battle:
 *                   $ref: '#/components/schemas/Battle'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post("/battles/1v1",
    [
        check('char1Id').isInt().withMessage('char1Id debe ser un número entero'),
        check('char2Id').isInt().withMessage('char2Id debe ser un número entero')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        try {
            const { char1Id, char2Id } = req.body;
            const userId = req.user.userId;
            const battle = await battleService.createBattle(char1Id, char2Id, userId);
            res.status(201).json({
                message: 'Batalla creada exitosamente',
                battleId: battle._id,
                battle: battle
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /api/battles/create:
 *   get:
 *     summary: Crea una batalla de prueba y devuelve su ID
 *     tags: [Batallas]
 *     parameters:
 *       - in: query
 *         name: char1Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del primer personaje
 *       - in: query
 *         name: char2Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del segundo personaje
 *     responses:
 *       200:
 *         description: Batalla creada con su ID
 *       400:
 *         description: Datos inválidos
 */
router.get("/battles/create", async (req, res) => {
    try {
        const char1Id = parseInt(req.query.char1Id);
        const char2Id = parseInt(req.query.char2Id);
        
        if (!char1Id || !char2Id) {
            return res.status(400).json({ error: 'char1Id y char2Id son requeridos' });
        }
        
        const battle = await battleService.createBattle(char1Id, char2Id);
        res.json({
            message: 'Batalla creada exitosamente',
            battleId: battle.id,
            battle: battle
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/battles/team-vs-team:
 *   post:
 *     summary: Crea una nueva batalla entre equipos (Sistema de múltiples ataques por turno)
 *     description: |
 *       Crea una nueva batalla entre dos equipos sin simular automáticamente. Cada equipo inicia con 3 acciones
 *       por turno (una por cada personaje). El sistema permite que todos los personajes vivos de un equipo
 *       puedan atacar durante su turno.
 *       
 *       **Características del Sistema:**
 *       - 3 acciones iniciales por equipo
 *       - Acciones se reducen por cada ataque
 *       - Turno cambia cuando se agotan las acciones
 *       - Cálculo dinámico de acciones basado en personajes vivos
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipo1Id
 *               - equipo2Id
 *             properties:
 *               equipo1Id:
 *                 type: integer
 *                 description: ID del primer equipo
 *                 example: 1
 *               equipo2Id:
 *                 type: integer
 *                 description: ID del segundo equipo
 *                 example: 2
 *               equipo1Level:
 *                 type: integer
 *                 description: Nivel de los personajes del equipo 1 (1 a 5, por defecto 1)
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 3
 *               equipo2Level:
 *                 type: integer
 *                 description: Nivel de los personajes del equipo 2 (1 a 5, por defecto 1)
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 2
 *     responses:
 *       201:
 *         description: Batalla creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Batalla entre equipos creada exitosamente"
 *                 battleId:
 *                   type: string
 *                   description: ID único de la batalla
 *                   example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                 equipo1:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "Los Vengadores"
 *                     miembros:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3]
 *                 equipo2:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     nombre:
 *                       type: string
 *                       example: "La Liga de la Justicia"
 *                     miembros:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [4, 5, 6]
 *                 currentCharacterStates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CharacterState'
 *                 currentTurn:
 *                   type: integer
 *                   example: 1
 *                 currentTeamTurn:
 *                   type: integer
 *                   example: 1
 *                 remainingActions:
 *                   type: integer
 *                   example: 3
 *                 battleStatus:
 *                   type: string
 *                   example: "active"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Uno o ambos equipos no existen"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post("/battles/team-vs-team", async (req, res) => {
    try {
        const { equipo1Id, equipo2Id } = req.body;
        const userId = req.user.userId;
        const battle = await battleService.createTeamBattle(equipo1Id, equipo2Id, userId);
        res.status(201).json({
            message: 'Batalla 3v3 creada exitosamente',
            battleId: battle._id,
            battle: battle
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/battles/action:
 *   post:
 *     summary: Ejecuta una acción de pelea por turnos (sistema tipo Pokémon 3v3)
 *     description: |
 *       Ejecuta una acción de pelea en una batalla 3 vs 3 por turnos, estilo Pokémon.
 *       - Solo un personaje activo por equipo está en combate a la vez.
 *       - El usuario debe especificar el `battleId` de la batalla en curso.
 *       - El usuario elige el tipo de ataque: `normal`, `especial` o `ultimate` (la ultimate solo puede usarse una vez por personaje por combate).
 *       - El usuario puede seleccionar el objetivo con `targetId` (opcional). Si no se especifica, el ataque va dirigido al personaje activo enemigo.
 *       - Tras el ataque del usuario, el enemigo responde automáticamente.
 *       - Si un personaje es derrotado, entra el siguiente disponible del equipo.
 *       - El combate avanza turno a turno, y la respuesta del endpoint muestra el resumen de ambos turnos y el estado actual del combate, para que el usuario decida su siguiente acción.
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - battleId
 *               - attackerId
 *               - attackType
 *             properties:
 *               battleId:
 *                 type: string
 *                 description: ID de la batalla en curso
 *               attackerId:
 *                 type: integer
 *                 description: ID del personaje activo del usuario
 *               attackType:
 *                 type: string
 *                 enum: [normal, especial, ultimate]
 *                 description: Tipo de ataque a realizar. La ultimate solo puede usarse una vez por personaje por combate.
 *               targetId:
 *                 type: integer
 *                 description: (Opcional) ID del personaje enemigo al que se quiere atacar. Si no se especifica, se ataca al personaje activo enemigo.
 *     responses:
 *       200:
 *         description: Resumen del turno del jugador y del enemigo, y estado del combate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 turnoJugador:
 *                   type: string
 *                   description: Resumen del ataque del jugador (nombre del ataque, tipo, daño, mitigación, HP restante del enemigo)
 *                 turnoEnemigo:
 *                   type: string
 *                   description: Resumen del ataque automático del enemigo
 *                 estadoCombate:
 *                   type: string
 *                   enum: [En curso, Finalizado]
 *                   description: Estado actual del combate
 *                 siguienteTurno:
 *                   type: string
 *                   enum: [jugador, null]
 *                   description: Indica si el siguiente turno es del jugador o si la batalla terminó
 *                 ganador:
 *                   type: string
 *                   nullable: true
 *                   description: Nombre del ganador si la batalla terminó
 *       400:
 *         description: Error de validación o de reglas de combate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La ultimate solo puede usarse una vez por combate"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.post('/battles/action', async (req, res) => {
    try {
        const { battleId, attackerId, attackType, targetId } = req.body;
        const userId = req.user.userId;
        // Validaciones básicas
        if (!battleId || !attackerId || !attackType) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos: battleId, attackerId, attackType' 
            });
        }
        if (!['normal', 'especial', 'ultimate'].includes(attackType)) {
            return res.status(400).json({ 
                error: 'attackType debe ser "normal", "especial" o "ultimate"' 
            });
        }
        const result = await battleService.executeBattleAction(battleId, userId, {
            attackerId,
            attackType,
            targetId
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/battles/{battleId}/state:
 *   get:
 *     summary: Obtiene el estado actual de una batalla (incluye acciones restantes)
 *     description: |
 *       Obtiene el estado completo de una batalla, incluyendo información sobre las acciones restantes
 *       del equipo actual, el estado de todos los personajes, y el progreso de la batalla.
 *       
 *       **Información Incluida:**
 *       - Estado de todos los personajes (vida, estado)
 *       - Turno actual y equipo que tiene el turno
 *       - Acciones restantes del equipo actual
 *       - Rounds completados y ataques realizados
 *       - Estado de finalización de la batalla
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: battleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la batalla
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Estado actual de la batalla
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estado de la batalla obtenido exitosamente"
 *                 battleState:
 *                   $ref: '#/components/schemas/Battle'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Batalla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Batalla no encontrada"
 *       500:
 *         description: Error del servidor
 */
router.get('/battles/:battleId/state', async (req, res) => {
    try {
        const battleId = req.params.battleId;
        const user = req.user;

        const battleState = await battleService.getBattleState(battleId, user.userId);
        const filteredBattleState = filterBattleStateForUser(battleState, user);

        res.json({
            message: 'Estado de la batalla obtenido exitosamente',
            battleState: filteredBattleState
        });
    } catch (error) {
        if (error.message.includes('no encontrada')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

/**
 * @swagger
 * /api/battles/{id}/round:
 *   post:
 *     summary: Ejecuta un turno de combate por turnos (1v1 o equipos, con niveles de poder y selección de objetivo)
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la batalla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attackType:
 *                 type: string
 *                 enum: [normal, especial]
 *                 description: Tipo de ataque a usar
 *               useShield:
 *                 type: boolean
 *                 description: Si es true, el personaje usará su escudo (reduce daño, solo una vez por batalla)
 *               nivel:
 *                 type: integer
 *                 description: Nivel de poder del usuario (opcional, afecta el daño: daño = base * (1 + 0.1 * (nivel-1)))
 *               target:
 *                 type: string
 *                 description: |
 *                   Alias o id del objetivo del ataque.
 *                   - En 1v1 es opcional (por defecto ataca al oponente).
 *                   - En 3v3 es obligatorio (debe ser un enemigo vivo del equipo contrario).
 *           example:
 *             attackType: especial
 *             useShield: false
 *             nivel: 5
 *             target: "Joker"
 *     responses:
 *       200:
 *         description: Resultado del turno y estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 turno:
 *                   type: string
 *                   description: De quién fue el turno ('usuario' o 'ia')
 *                 acciones:
 *                   type: array
 *                   description: Acciones realizadas en el turno
 *                   items:
 *                     type: object
 *                     properties:
 *                       atacante:
 *                         type: string
 *                       defensor:
 *                         type: string
 *                       tipoAtaque:
 *                         type: string
 *                       danio:
 *                         type: number
 *                       absorbido:
 *                         type: number
 *                       hpDefensor:
 *                         type: number
 *                       nivel:
 *                         type: integer
 *                 estado:
 *                   type: object
 *                   description: Estado actualizado de los personajes (1v1) o equipos (3v3), incluyendo nivel
 *                 isFinished:
 *                   type: boolean
 *                   description: Si la batalla terminó
 *                 winner:
 *                   type: string
 *                   description: Ganador si la batalla terminó
 *             examples:
 *               1v1:
 *                 value:
 *                   turno: usuario
 *                   acciones:
 *                     - atacante: "Spider-Man"
 *                       defensor: "Thanos"
 *                       tipoAtaque: "especial"
 *                       danio: 45
 *                       absorbido: 10
 *                       hpDefensor: 60
 *                       nivel: 5
 *                   estado:
 *                     usuario: { hp: 100, escudoUsado: false, nivel: 5 }
 *                     ia: { hp: 60, escudoUsado: true, nivel: 1 }
 *                   isFinished: false
 *                   winner: null
 *               3v3:
 *                 value:
 *                   turno: usuario
 *                   acciones:
 *                     - atacante: "Batman"
 *                       defensor: "Joker"
 *                       tipoAtaque: "normal"
 *                       danio: 22
 *                       absorbido: 5
 *                       hpDefensor: 80
 *                       nivel: 3
 *                   estado:
 *                     equipo1:
 *                       - alias: "Batman"
 *                         hp: 100
 *                         escudoUsado: false
 *                         nivel: 3
 *                       - alias: "Superman"
 *                         hp: 100
 *                         escudoUsado: false
 *                         nivel: 1
 *                       - alias: "Wonder Woman"
 *                         hp: 100
 *                         escudoUsado: false
 *                         nivel: 1
 *                     equipo2:
 *                       - alias: "Joker"
 *                         hp: 80
 *                         escudoUsado: true
 *                         nivel: 1
 *                       - alias: "Thanos"
 *                         hp: 120
 *                         escudoUsado: false
 *                         nivel: 1
 *                       - alias: "Lex Luthor"
 *                         hp: 100
 *                         escudoUsado: false
 *                         nivel: 1
 *                   isFinished: false
 *                   winner: null
 *       400:
 *         description: Error en la simulación
 *       500:
 *         description: Error del servidor
 */
router.post("/battles/:id/round", async (req, res) => {
    try {
        const battleId = req.params.id;
        const userId = req.user.userId;
        const { attackType, useShield } = req.body;
        const round = await battleService.simulateRound(battleId, userId, { attackType, useShield });
        res.json(round);
    } catch (error) {
        if (error.message && error.message.includes('no encontrada')) {
            res.status(404).json({ error: error.message });
        } else if (error.message && error.message.includes('ya ha terminado')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

/**
 * @swagger
 * /api/battles/3v3/round:
 *   post:
 *     summary: Simula un round de batalla 3v3
 *     tags: [Batallas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attackType:
 *                 type: string
 *                 enum: [normal, especial, final]
 *                 description: 'Tipo de ataque a usar: normal (primer ataque del personaje), especial (segundo ataque del personaje), final (ataque final, solo una vez por batalla, daño x2)'
 *               useShield:
 *                 type: boolean
 *                 description: 'Si es true, el personaje usará su escudo (reduce daño a la mitad, solo una vez por batalla)'
 *     responses:
 *       200:
 *         description: Resultado del round
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 battleId:
 *                   type: string
 *                   description: ID de la batalla
 *                 round:
 *                   type: integer
 *                   description: Número de round
 *                 atacante:
 *                   type: string
 *                   description: Alias del atacante
 *                 defensor:
 *                   type: string
 *                   description: Alias del defensor
 *                 attacks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attacker:
 *                         type: string
 *                       defender:
 *                         type: string
 *                       attackName:
 *                         type: string
 *                       attackDescription:
 *                         type: string
 *                       damage:
 *                         type: integer
 *                       critical:
 *                         type: boolean
 *                       miss:
 *                         type: boolean
 *                       defenderHealth:
 *                         type: integer
 *                       baseDamage:
 *                         type: integer
 *                       finalDamage:
 *                         type: integer
 *                       isFinalAttack:
 *                         type: boolean
 *                       defenderUsedShield:
 *                         type: boolean
 *                 isFinished:
 *                   type: boolean
 *                   description: Si la batalla terminó
 *                 winner:
 *                   type: string
 *                   description: Ganador si la batalla terminó
 *       400:
 *         description: Error en la simulación
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/battles/{id}/simulate:
 *   post:
 *     summary: Simula una batalla completa (solo para batallas 1v1)
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la batalla (debe ser una batalla 1v1)
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Batalla simulada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Battle'
 *       400:
 *         description: La batalla ya ha terminado o es una batalla 3v3
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La batalla ya ha terminado"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Batalla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Batalla no encontrada"
 *       500:
 *         description: Error del servidor
 */
router.post("/battles/:id/simulate", async (req, res) => {
    try {
        const battleId = parseInt(req.params.id);
        const result = await battleService.simulateFullBattle(battleId);
        res.json(result);
    } catch (error) {
        if (error.message.includes('no encontrada')) {
            res.status(404).json({ error: error.message });
        } else if (error.message.includes('ya ha terminado')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

/**
 * @swagger
 * /api/battles/{id}:
 *   get:
 *     summary: Obtiene estadísticas de una batalla específica
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la batalla
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Estadísticas de la batalla
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Battle'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Batalla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Batalla no encontrada"
 *       500:
 *         description: Error del servidor
 */
router.get("/battles/:id", async (req, res) => {
    try {
        const battleId = parseInt(req.params.id);
        const userId = req.user.userId;
        const battleStats = await battleService.getBattleStats(battleId, userId);
        res.json(battleStats);
    } catch (error) {
        if (error.message.includes('no encontrada')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

/**
 * @swagger
 * /api/battles/characters/{id}/attacks:
 *   get:
 *     summary: Obtiene los tres tipos de ataque de un personaje específico
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del personaje
 *         example: 1
 *     responses:
 *       200:
 *         description: Tipos de ataque del personaje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 character:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     alias:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                 attacks:
 *                   type: object
 *                   properties:
 *                     normal:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         baseDamage:
 *                           type: number
 *                         damage:
 *                           type: number
 *                         description:
 *                           type: string
 *                     especial:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         baseDamage:
 *                           type: number
 *                         damage:
 *                           type: number
 *                         description:
 *                           type: string
 *                     final:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         baseDamage:
 *                           type: number
 *                         damage:
 *                           type: number
 *                         description:
 *                           type: string
 *             example:
 *               character:
 *                 id: 1
 *                 nombre: "Peter Parker"
 *                 alias: "Spider-Man"
 *                 tipo: "heroe"
 *               attacks:
 *                 normal:
 *                   name: "🕷️ Lanzamiento de Telaraña"
 *                   baseDamage: 65
 *                   damage: 1.2
 *                   description: "Lanza una telaraña que reduce la velocidad del oponente"
 *                 especial:
 *                   name: "🕸️ Red de Telaraña"
 *                   baseDamage: 65
 *                   damage: 1.5
 *                   description: "Crea una red que atrapa al enemigo"
 *                 final:
 *                   name: "💥 Ataque Final"
 *                   baseDamage: 65
 *                   damage: 2
 *                   description: "Ataque devastador, solo se puede usar una vez por batalla"
 *       404:
 *         description: Personaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Personaje no encontrado"
 *       500:
 *         description: Error del servidor
 */
router.get("/battles/characters/:id/attacks", async (req, res) => {
    try {
        const user = req.user;
        const characterId = parseInt(req.params.id);
        const characters = await characterRepository.getCharacters();
        const character = characters.find(c => c.id === characterId);
        
        if (!character) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }
        
        // Crear una instancia del personaje para obtener sus ataques
        const charInstance = new Character(
            character.id,
            character.nombre,
            character.alias,
            character.tipo,
            character.ciudad,
            character.equipo,
            character.stats,
            character.attacks
        );

        // Definir ataques según el tipo de usuario
        let normal, especial, final;
        
        if (isAdmin(user)) {
            // Admin ve todos los detalles
            normal = charInstance.attacks[0] || null;
            especial = charInstance.attacks[1] || null;
            final = normal ? {
                name: '💥 Ataque Final',
                baseDamage: charInstance.stats.attack,
                damage: 2,
                description: 'Ataque devastador, solo se puede usar una vez por batalla'
            } : null;
        } else {
            // Usuario normal solo ve nombres y descripciones
            normal = charInstance.attacks[0] ? {
                name: charInstance.attacks[0].name,
                description: charInstance.attacks[0].description
            } : null;
            especial = charInstance.attacks[1] ? {
                name: charInstance.attacks[1].name,
                description: charInstance.attacks[1].description
            } : null;
            final = {
                name: '💥 Ataque Final',
                description: 'Ataque devastador, solo se puede usar una vez por batalla'
            };
        }

        res.json({
            character: {
                id: character.id,
                nombre: character.nombre,
                alias: character.alias,
                tipo: character.tipo
            },
            attacks: {
                normal: normal,
                especial: especial,
                final: final
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/battles/{battleId}/available-actions:
 *   get:
 *     summary: Obtiene las acciones disponibles para el equipo actual
 *     description: |
 *       Obtiene información detallada sobre las acciones disponibles para el equipo que tiene el turno actual.
 *       Incluye la lista de personajes que pueden atacar y los objetivos válidos del equipo contrario.
 *       
 *       **Información Proporcionada:**
 *       - Equipo que tiene el turno actual
 *       - Número de acciones restantes
 *       - Lista de atacantes disponibles (personajes vivos del equipo actual)
 *       - Lista de objetivos válidos (personajes vivos del equipo contrario)
 *       
 *       **Uso Recomendado:**
 *       - Consultar antes de ejecutar acciones para ver opciones disponibles
 *       - Verificar que hay acciones restantes antes de atacar
 *       - Identificar personajes que pueden atacar y objetivos válidos
 *     tags: [Batallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: battleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la batalla
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Acciones disponibles obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailableActions'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Batalla no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/battles/:battleId/available-actions', async (req, res) => {
    try {
        const battleId = req.params.battleId;
        const userId = req.user.userId;

        const battle = await battleService.getBattleState(battleId, userId);
        
        // Obtener personajes del equipo actual
        const currentTeamId = battle.currentTeamTurn === 1 ? battle.equipo1.id : battle.equipo2.id;
        const availableAttackers = battle.characterStates.filter(c => 
            c.teamId === currentTeamId && c.isAlive
        ).map(c => ({
            id: c.id,
            alias: c.alias,
            currentHealth: c.currentHealth,
            isAlive: c.isAlive
        }));

        // Obtener objetivos del equipo contrario
        const oppositeTeamId = battle.currentTeamTurn === 1 ? battle.equipo2.id : battle.equipo1.id;
        const availableTargets = battle.characterStates.filter(c => 
            c.teamId === oppositeTeamId && c.isAlive
        ).map(c => ({
            id: c.id,
            alias: c.alias,
            currentHealth: c.currentHealth,
            isAlive: c.isAlive
        }));

        res.json({
            message: 'Acciones disponibles obtenidas exitosamente',
            currentTeam: battle.currentTeamTurn,
            remainingActions: battle.remainingActions,
            availableAttackers,
            availableTargets
        });
    } catch (error) {
        if (error.message.includes('no encontrada')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

export default router; 