import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

// Función para verificar si el usuario es admin (vegdadego)
export function isAdmin(user) {
    return user && user.user === 'vegdadego';
}

// Middleware para verificar acceso a batallas (solo propietario o admin)
export function battleAccessMiddleware(req, res, next) {
    const userId = req.user.userId;
    const battleUserId = req.params.userId || req.body.userId;
    
    // Si es admin (vegdadego), tiene acceso completo
    if (isAdmin(req.user)) {
        return next();
    }
    
    // Si no es admin, solo puede acceder a sus propias batallas
    if (userId !== battleUserId) {
        return res.status(403).json({ error: 'Acceso denegado. Solo puedes acceder a tus propias batallas.' });
    }
    
    next();
}

// Función para filtrar personajes según el tipo de usuario
export function filterCharactersForUser(characters, user) {
    if (isAdmin(user)) {
        // Admin ve todos los detalles
        return characters;
    }
    
    // Usuario normal solo ve información necesaria para jugar
    return characters.map(char => ({
        id: char.id,
        nombre: char.nombre,
        alias: char.alias,
        tipo: char.tipo,
        ciudad: char.ciudad,
        equipo: char.equipo,
        stats: {
            health: char.stats.health,
            maxHealth: char.stats.maxHealth,
            attack: char.stats.attack,
            defense: char.stats.defense,
            speed: char.stats.speed
        },
        attacks: char.attacks.map(attack => ({
            name: attack.name,
            description: attack.description
            // NO incluir baseDamage ni damage para usuarios normales
        }))
    }));
}

// Función para filtrar batallas según el tipo de usuario
export function filterBattlesForUser(battles, user) {
    if (isAdmin(user)) {
        // Admin ve todas las batallas con detalles completos
        return battles;
    }
    
    // Usuario normal solo ve sus propias batallas con información limitada
    return battles.filter(battle => battle.userId === user.userId).map(battle => ({
        id: battle._id,
        type: battle.type,
        isFinished: battle.isFinished,
        winner: battle.winner,
        startTime: battle.startTime,
        endTime: battle.endTime,
        currentRound: battle.currentRound,
        // NO incluir detalles de personajes, equipos, etc.
    }));
}

// Función para filtrar estado de batalla según el tipo de usuario
export function filterBattleStateForUser(battleState, user) {
    if (isAdmin(user)) {
        // Admin ve todo el estado
        return battleState;
    }
    
    // Usuario normal solo ve información necesaria para jugar
    return {
        id: battleState.id,
        type: battleState.type,
        isFinished: battleState.isFinished,
        winner: battleState.winner,
        currentTurn: battleState.currentTurn,
        currentTeamTurn: battleState.currentTeamTurn,
        remainingActions: battleState.remainingActions,
        // Campos necesarios para 3v3
        active1: battleState.active1,
        active2: battleState.active2,
        activeIndex1: battleState.activeIndex1,
        activeIndex2: battleState.activeIndex2,
        turnoActual: battleState.turnoActual,
        // Incluir información de equipos para 3v3
        equipo1: battleState.equipo1,
        equipo2: battleState.equipo2,
        // Solo información básica de personajes
        characterStates: battleState.characterStates.map(char => ({
            id: char.id,
            alias: char.alias,
            currentHealth: char.currentHealth,
            maxHealth: char.maxHealth,
            isAlive: char.isAlive,
            teamId: char.teamId
            // NO incluir stats completos, ataques, etc.
        }))
    };
} 