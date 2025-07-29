// ========================================
// SCRIPTS DE EQUIPOS - POSTMAN
// ========================================

// Nombres de equipos predefinidos
const teamNames = [
    "Los Vengadores",
    "La Liga de la Justicia",
    "Los X-Men",
    "Los 4 Fantásticos",
    "Los Defensores",
    "Los Guardianes de la Galaxia",
    "Los Inhumanos",
    "Los Thunderbolts",
    "Los Hijos de Thanos",
    "La Hermandad de Mutantes",
    "Los Sinestro Corps",
    "Los Black Order",
    "Los Masters del Mal",
    "Los Seis Siniestros",
    "Los Caballeros Oscuros"
];

// Función para generar equipo aleatorio
function generateRandomTeam() {
    const nombre = teamNames[Math.floor(Math.random() * teamNames.length)];
    
    // Obtener personajes disponibles
    let availableCharacters = [];
    try {
        availableCharacters = JSON.parse(pm.collectionVariables.get("availableCharacters") || "[]");
    } catch (e) {
        // Si no hay personajes disponibles, usar IDs del 1 al 8
        availableCharacters = Array.from({length: 8}, (_, i) => ({id: i + 1}));
    }
    
    // Seleccionar 3 personajes aleatorios
    const miembros = [];
    const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
        miembros.push(shuffled[i].id);
    }
    
    return {
        nombre: nombre,
        miembros: miembros
    };
}

// Script para crear equipo
function createTeamScript() {
    const teamData = generateRandomTeam();
    
    pm.request.body.raw = JSON.stringify(teamData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Creando equipo:", teamData.nombre, "con miembros:", teamData.miembros);
}

// Script para obtener equipos
function getTeamsScript() {
    console.log("Obteniendo lista de equipos...");
}

// Script para guardar equipos disponibles
function saveAvailableTeams() {
    if (pm.response.code === 200) {
        const teams = pm.response.json();
        pm.collectionVariables.set("availableTeams", JSON.stringify(teams));
        console.log("Equipos disponibles guardados:", teams.length);
        
        // Guardar el primer equipo como currentTeamId si existe
        if (teams.length > 0) {
            pm.collectionVariables.set("currentTeamId", teams[0].id);
        }
    }
}

// Script para obtener equipo por ID
function getTeamByIdScript() {
    // Intentar usar currentTeamId, si no existe usar un ID aleatorio
    let teamId = pm.collectionVariables.get("currentTeamId");
    if (!teamId) {
        teamId = Math.floor(Math.random() * 10) + 1; // IDs del 1 al 10
    }
    
    pm.request.url.path[2] = teamId.toString();
    console.log("Obteniendo equipo con ID:", teamId);
}

// Script para actualizar equipo
function updateTeamScript() {
    let teamId = pm.collectionVariables.get("currentTeamId");
    if (!teamId) {
        teamId = Math.floor(Math.random() * 10) + 1;
    }
    
    pm.request.url.path[2] = teamId.toString();
    
    // Generar nuevos datos aleatorios
    const updateData = generateRandomTeam();
    
    pm.request.body.raw = JSON.stringify(updateData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Actualizando equipo con ID:", teamId);
}

// Script para eliminar equipo
function deleteTeamScript() {
    let teamId = pm.collectionVariables.get("currentTeamId");
    if (!teamId) {
        teamId = Math.floor(Math.random() * 10) + 1;
    }
    
    pm.request.url.path[2] = teamId.toString();
    console.log("Eliminando equipo con ID:", teamId);
}

// Script para crear equipo con personajes específicos
function createTeamWithSpecificCharacters() {
    // Crear equipo con personajes específicos (Spider-Man, Iron Man, Captain America)
    const teamData = {
        nombre: "Los Vengadores Clásicos",
        miembros: [1, 4, 5] // IDs de Spider-Man, Iron Man, Captain America
    };
    
    pm.request.body.raw = JSON.stringify(teamData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Creando equipo específico:", teamData.nombre, "con miembros:", teamData.miembros);
}

// Script para crear equipo con villanos
function createVillainTeam() {
    // Crear equipo con villanos
    const teamData = {
        nombre: "Los Villanos Unidos",
        miembros: [6, 7, 8] // IDs de Thanos, Joker, Loki
    };
    
    pm.request.body.raw = JSON.stringify(teamData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Creando equipo de villanos:", teamData.nombre, "con miembros:", teamData.miembros);
}

// Script para crear múltiples equipos
function createMultipleTeams() {
    const teams = [
        {
            nombre: "Los Vengadores",
            miembros: [1, 4, 5]
        },
        {
            nombre: "La Liga de la Justicia",
            miembros: [2, 3, 5]
        },
        {
            nombre: "Los Villanos",
            miembros: [6, 7, 8]
        }
    ];
    
    // Seleccionar equipo aleatorio
    const randomTeam = teams[Math.floor(Math.random() * teams.length)];
    
    pm.request.body.raw = JSON.stringify(randomTeam);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Creando equipo:", randomTeam.nombre, "con miembros:", randomTeam.miembros);
}

// Función para validar que los personajes existen
function validateTeamMembers(miembros) {
    try {
        const availableCharacters = JSON.parse(pm.collectionVariables.get("availableCharacters") || "[]");
        const availableIds = availableCharacters.map(char => char.id);
        
        for (const memberId of miembros) {
            if (!availableIds.includes(memberId)) {
                console.warn(`Personaje con ID ${memberId} no encontrado en la lista disponible`);
                return false;
            }
        }
        return true;
    } catch (e) {
        console.warn("No se pudo validar los miembros del equipo");
        return true; // Permitir continuar
    }
}

// Script para crear equipo validado
function createValidatedTeam() {
    const teamData = generateRandomTeam();
    
    // Validar que los personajes existen
    if (validateTeamMembers(teamData.miembros)) {
        pm.request.body.raw = JSON.stringify(teamData);
        pm.request.headers.add({
            key: "Content-Type",
            value: "application/json"
        });
        
        console.log("Creando equipo validado:", teamData.nombre, "con miembros:", teamData.miembros);
    } else {
        // Si la validación falla, usar personajes conocidos
        teamData.miembros = [1, 2, 3];
        pm.request.body.raw = JSON.stringify(teamData);
        pm.request.headers.add({
            key: "Content-Type",
            value: "application/json"
        });
        
        console.log("Creando equipo con personajes por defecto:", teamData.nombre, "con miembros:", teamData.miembros);
    }
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        teamNames,
        generateRandomTeam,
        createTeamScript,
        getTeamsScript,
        saveAvailableTeams,
        getTeamByIdScript,
        updateTeamScript,
        deleteTeamScript,
        createTeamWithSpecificCharacters,
        createVillainTeam,
        createMultipleTeams,
        validateTeamMembers,
        createValidatedTeam
    };
} 