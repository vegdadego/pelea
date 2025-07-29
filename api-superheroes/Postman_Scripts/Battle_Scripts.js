// ========================================
// SCRIPTS DE BATALLAS - POSTMAN
// ========================================

// Tipos de ataques disponibles
const attackTypes = ["normal", "especial", "ultimate"];

// Función para generar batalla 1v1 aleatoria
function generateRandom1v1Battle() {
    const char1Id = Math.floor(Math.random() * 8) + 1;
    let char2Id = Math.floor(Math.random() * 8) + 1;
    
    // Asegurar que los personajes sean diferentes
    while (char2Id === char1Id) {
        char2Id = Math.floor(Math.random() * 8) + 1;
    }
    
    return {
        char1Id: char1Id,
        char2Id: char2Id
    };
}

// Función para generar batalla entre equipos aleatoria
function generateRandomTeamBattle() {
    // Obtener equipos disponibles
    let availableTeams = [];
    try {
        availableTeams = JSON.parse(pm.collectionVariables.get("availableTeams") || "[]");
    } catch (e) {
        // Si no hay equipos disponibles, usar IDs del 1 al 5
        availableTeams = Array.from({length: 5}, (_, i) => ({id: i + 1}));
    }
    
    if (availableTeams.length < 2) {
        // Si no hay suficientes equipos, usar IDs por defecto
        return {
            equipo1Id: 1,
            equipo2Id: 2
        };
    }
    
    // Seleccionar dos equipos aleatorios diferentes
    const shuffled = [...availableTeams].sort(() => 0.5 - Math.random());
    const equipo1 = shuffled[0];
    const equipo2 = shuffled[1];
    
    return {
        equipo1Id: equipo1.id,
        equipo2Id: equipo2.id
    };
}

// Script para crear batalla 1v1
function create1v1BattleScript() {
    const battleData = generateRandom1v1Battle();
    
    pm.request.body.raw = JSON.stringify(battleData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Creando batalla 1v1 entre personajes:", battleData.char1Id, "vs", battleData.char2Id);
}

// Script para crear batalla entre equipos
function createTeamBattleScript() {
    const battleData = generateRandomTeamBattle();
    
    pm.request.body.raw = JSON.stringify(battleData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Creando batalla entre equipos:", battleData.equipo1Id, "vs", battleData.equipo2Id);
}

// Script para guardar ID de batalla
function saveBattleId() {
    if (pm.response.code === 201) {
        const response = pm.response.json();
        if (response.battleId) {
            pm.collectionVariables.set("currentBattleId", response.battleId);
            console.log("ID de batalla guardado:", response.battleId);
        }
    }
}

// Script para obtener estado de batalla
function getBattleStateScript() {
    const battleId = pm.collectionVariables.get("currentBattleId");
    if (battleId) {
        pm.request.url.path[2] = battleId;
        console.log("Obteniendo estado de batalla:", battleId);
    } else {
        console.log("No hay ID de batalla disponible");
    }
}

// Script para ejecutar acción de batalla
function executeBattleActionScript() {
    const battleId = pm.collectionVariables.get("currentBattleId");
    if (!battleId) {
        console.log("No hay ID de batalla disponible");
        return;
    }
    
    // Generar acción aleatoria
    const actionData = {
        battleId: battleId,
        attackerId: Math.floor(Math.random() * 8) + 1,
        targetId: Math.floor(Math.random() * 8) + 1,
        attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)]
    };
    
    pm.request.body.raw = JSON.stringify(actionData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Ejecutando acción de batalla:", actionData);
}

// Script para obtener personajes para batalla
function getBattleCharactersScript() {
    console.log("Obteniendo personajes disponibles para batalla...");
}

// Script para obtener ataques de personaje
function getCharacterAttacksScript() {
    const characterId = Math.floor(Math.random() * 8) + 1;
    pm.request.url.path[3] = characterId.toString();
    
    console.log("Obteniendo ataques del personaje:", characterId);
}

// Script para obtener todas las batallas
function getAllBattlesScript() {
    console.log("Obteniendo todas las batallas...");
}

// Script para simular batalla completa
function simulateCompleteBattleScript() {
    const battleId = pm.collectionVariables.get("currentBattleId");
    if (battleId) {
        pm.request.url.path[2] = battleId;
        console.log("Simulando batalla completa:", battleId);
    } else {
        console.log("No hay ID de batalla disponible");
    }
}

// Script para ejecutar round de batalla
function executeBattleRoundScript() {
    const battleId = pm.collectionVariables.get("currentBattleId");
    if (battleId) {
        pm.request.url.path[2] = battleId;
        
        const roundData = {
            useFinalAttack: Math.random() > 0.7, // 30% de probabilidad
            useShield: Math.random() > 0.8 // 20% de probabilidad
        };
        
        pm.request.body.raw = JSON.stringify(roundData);
        pm.request.headers.add({
            key: "Content-Type",
            value: "application/json"
        });
        
        console.log("Ejecutando round de batalla:", battleId, "con datos:", roundData);
    } else {
        console.log("No hay ID de batalla disponible");
    }
}

// Script para crear batalla con personajes específicos
function createSpecificBattleScript() {
    const battleData = {
        char1Id: 1, // Spider-Man
        char2Id: 2  // Superman
    };
    
    pm.request.body.raw = JSON.stringify(battleData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Creando batalla específica: Spider-Man vs Superman");
}

// Script para crear batalla entre héroes y villanos
function createHeroVsVillainBattleScript() {
    const battleData = {
        char1Id: 1, // Spider-Man (héroe)
        char2Id: 6  // Thanos (villano)
    };
    
    pm.request.body.raw = JSON.stringify(battleData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Creando batalla héroe vs villano: Spider-Man vs Thanos");
}

// Script para ejecutar múltiples acciones en una batalla
function executeMultipleActionsScript() {
    const battleId = pm.collectionVariables.get("currentBattleId");
    if (!battleId) {
        console.log("No hay ID de batalla disponible");
        return;
    }
    
    // Generar múltiples acciones
    const actions = [];
    for (let i = 0; i < 3; i++) {
        actions.push({
            battleId: battleId,
            attackerId: Math.floor(Math.random() * 8) + 1,
            targetId: Math.floor(Math.random() * 8) + 1,
            attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)]
        });
    }
    
    // Usar la primera acción
    const actionData = actions[0];
    
    pm.request.body.raw = JSON.stringify(actionData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Ejecutando acción de batalla (1 de 3):", actionData);
    console.log("Acciones restantes:", actions.slice(1));
}

// Script para validar estado de batalla
function validateBattleState() {
    if (pm.response.code === 200) {
        const battleState = pm.response.json();
        
        if (battleState.isFinished) {
            console.log("Batalla terminada. Ganador:", battleState.winner);
        } else {
            console.log("Batalla en curso. Turno:", battleState.currentTurn);
            console.log("Equipo actual:", battleState.currentTeamTurn);
            console.log("Acciones restantes:", battleState.remainingActions);
        }
    }
}

// Script para obtener acciones disponibles
function getAvailableActionsScript() {
    const battleId = pm.collectionVariables.get("currentBattleId");
    if (battleId) {
        pm.request.url.path[2] = battleId;
        console.log("Obteniendo acciones disponibles para batalla:", battleId);
    } else {
        console.log("No hay ID de batalla disponible");
    }
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        attackTypes,
        generateRandom1v1Battle,
        generateRandomTeamBattle,
        create1v1BattleScript,
        createTeamBattleScript,
        saveBattleId,
        getBattleStateScript,
        executeBattleActionScript,
        getBattleCharactersScript,
        getCharacterAttacksScript,
        getAllBattlesScript,
        simulateCompleteBattleScript,
        executeBattleRoundScript,
        createSpecificBattleScript,
        createHeroVsVillainBattleScript,
        executeMultipleActionsScript,
        validateBattleState,
        getAvailableActionsScript
    };
} 