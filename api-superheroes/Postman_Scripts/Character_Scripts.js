// ========================================
// SCRIPTS DE PERSONAJES - POSTMAN
// ========================================

// Datos de personajes predefinidos
const superheroes = [
    {
        nombre: "Peter Parker",
        alias: "Spider-Man",
        tipo: "heroe",
        ciudad: "Nueva York",
        equipo: "Los Vengadores",
        stats: { health: 100, maxHealth: 100, attack: 85, defense: 60, speed: 90 },
        attacks: [
            { name: "🕷️ Lanzamiento de Telaraña", description: "Lanza una telaraña que reduce la velocidad del oponente", baseDamage: 60, damage: 1.2 },
            { name: "🕷️ Ataque de Araña", description: "Ataque rápido con patas de araña", baseDamage: 75, damage: 1.5 }
        ]
    },
    {
        nombre: "Clark Kent",
        alias: "Superman",
        tipo: "heroe",
        ciudad: "Metrópolis",
        equipo: "La Liga de la Justicia",
        stats: { health: 150, maxHealth: 150, attack: 95, defense: 80, speed: 85 },
        attacks: [
            { name: "👊 Puñetazo Sónico", description: "Puñetazo que rompe la barrera del sonido", baseDamage: 80, damage: 1.3 },
            { name: "👁️ Rayos X", description: "Emite rayos X desde los ojos", baseDamage: 90, damage: 1.6 }
        ]
    },
    {
        nombre: "Bruce Wayne",
        alias: "Batman",
        tipo: "heroe",
        ciudad: "Gotham City",
        equipo: "La Liga de la Justicia",
        stats: { health: 120, maxHealth: 120, attack: 75, defense: 70, speed: 80 },
        attacks: [
            { name: "🦇 Batarang", description: "Lanza un batarang afilado", baseDamage: 65, damage: 1.1 },
            { name: "🦇 Ataque Nocturno", description: "Ataque sigiloso desde las sombras", baseDamage: 70, damage: 1.4 }
        ]
    },
    {
        nombre: "Tony Stark",
        alias: "Iron Man",
        tipo: "heroe",
        ciudad: "Nueva York",
        equipo: "Los Vengadores",
        stats: { health: 110, maxHealth: 110, attack: 80, defense: 85, speed: 75 },
        attacks: [
            { name: "⚡ Rayo Repulsor", description: "Dispara un rayo de energía desde el pecho", baseDamage: 70, damage: 1.3 },
            { name: "🚀 Misil Guiado", description: "Lanza un misil inteligente", baseDamage: 85, damage: 1.7 }
        ]
    },
    {
        nombre: "Steve Rogers",
        alias: "Captain America",
        tipo: "heroe",
        ciudad: "Nueva York",
        equipo: "Los Vengadores",
        stats: { health: 130, maxHealth: 130, attack: 80, defense: 75, speed: 70 },
        attacks: [
            { name: "🛡️ Escudo Lanzado", description: "Lanza su escudo como un bumerán", baseDamage: 60, damage: 1.2 },
            { name: "🇺🇸 Ataque Patriótico", description: "Ataque con la fuerza de la libertad", baseDamage: 75, damage: 1.5 }
        ]
    },
    {
        nombre: "Thanos",
        alias: "El Titán Loco",
        tipo: "villano",
        ciudad: "Titan",
        equipo: "Los Hijos de Thanos",
        stats: { health: 200, maxHealth: 200, attack: 100, defense: 90, speed: 60 },
        attacks: [
            { name: "💎 Puño de Piedra", description: "Golpe devastador con el puño de piedra", baseDamage: 90, damage: 1.8 },
            { name: "⚡ Rayo Cósmico", description: "Dispara rayos cósmicos desde el guantelete", baseDamage: 100, damage: 2.0 }
        ]
    },
    {
        nombre: "Joker",
        alias: "El Payaso del Crimen",
        tipo: "villano",
        ciudad: "Gotham City",
        equipo: "Solo",
        stats: { health: 90, maxHealth: 90, attack: 70, defense: 50, speed: 85 },
        attacks: [
            { name: "🃏 Carta Explosiva", description: "Lanza una carta que explota", baseDamage: 55, damage: 1.1 },
            { name: "🎭 Risa Histerica", description: "Risa que confunde al oponente", baseDamage: 65, damage: 1.3 }
        ]
    },
    {
        nombre: "Loki",
        alias: "El Dios del Engaño",
        tipo: "villano",
        ciudad: "Asgard",
        equipo: "Solo",
        stats: { health: 140, maxHealth: 140, attack: 75, defense: 65, speed: 80 },
        attacks: [
            { name: "🔮 Ilusión Mágica", description: "Crea ilusiones para confundir", baseDamage: 60, damage: 1.2 },
            { name: "⚔️ Daga de Loki", description: "Lanza dagas mágicas", baseDamage: 70, damage: 1.4 }
        ]
    }
];

// Función para generar personaje aleatorio
function generateRandomCharacter() {
    const personaje = superheroes[Math.floor(Math.random() * superheroes.length)];
    
    // Crear una copia para no modificar el original
    const nuevoPersonaje = JSON.parse(JSON.stringify(personaje));
    
    // Modificar ligeramente los stats para variabilidad
    nuevoPersonaje.stats.health += Math.floor(Math.random() * 20) - 10;
    nuevoPersonaje.stats.attack += Math.floor(Math.random() * 15) - 7;
    nuevoPersonaje.stats.defense += Math.floor(Math.random() * 15) - 7;
    nuevoPersonaje.stats.speed += Math.floor(Math.random() * 15) - 7;
    
    // Asegurar valores mínimos
    nuevoPersonaje.stats.health = Math.max(80, nuevoPersonaje.stats.health);
    nuevoPersonaje.stats.attack = Math.max(50, nuevoPersonaje.stats.attack);
    nuevoPersonaje.stats.defense = Math.max(30, nuevoPersonaje.stats.defense);
    nuevoPersonaje.stats.speed = Math.max(40, nuevoPersonaje.stats.speed);
    
    return nuevoPersonaje;
}

// Script para crear personaje
function createCharacterScript() {
    const characterData = generateRandomCharacter();
    
    pm.request.body.raw = JSON.stringify(characterData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    // Usar token de admin para crear personajes
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer {{adminToken}}"
    });
    
    console.log("Creando personaje:", characterData.alias);
}

// Script para obtener personajes
function getCharactersScript() {
    // Usar token de admin para ver todos los personajes
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer {{adminToken}}"
    });
    
    console.log("Obteniendo lista de personajes...");
}

// Script para guardar personajes disponibles
function saveAvailableCharacters() {
    if (pm.response.code === 200) {
        const characters = pm.response.json();
        pm.collectionVariables.set("availableCharacters", JSON.stringify(characters));
        console.log("Personajes disponibles guardados:", characters.length);
    }
}

// Script para obtener personaje por ID
function getCharacterByIdScript() {
    const characterId = Math.floor(Math.random() * 8) + 1; // IDs del 1 al 8
    pm.request.url.path[2] = characterId.toString();
    
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer {{adminToken}}"
    });
    
    console.log("Obteniendo personaje con ID:", characterId);
}

// Script para actualizar personaje
function updateCharacterScript() {
    const characterId = Math.floor(Math.random() * 8) + 1;
    pm.request.url.path[2] = characterId.toString();
    
    const updateData = {
        nombre: "Personaje Actualizado",
        alias: "Alias Nuevo",
        tipo: Math.random() > 0.5 ? "heroe" : "villano",
        ciudad: "Ciudad Actualizada",
        equipo: "Equipo Nuevo"
    };
    
    pm.request.body.raw = JSON.stringify(updateData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer {{adminToken}}"
    });
    
    console.log("Actualizando personaje con ID:", characterId);
}

// Script para eliminar personaje
function deleteCharacterScript() {
    const characterId = Math.floor(Math.random() * 8) + 1;
    pm.request.url.path[2] = characterId.toString();
    
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer {{adminToken}}"
    });
    
    console.log("Eliminando personaje con ID:", characterId);
}

// Función para obtener personajes por tipo
function getCharactersByTypeScript() {
    const tipos = ["heroe", "villano"];
    const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
    pm.request.url.path[3] = tipoAleatorio;
    
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer {{adminToken}}"
    });
    
    console.log("Obteniendo personajes de tipo:", tipoAleatorio);
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        superheroes,
        generateRandomCharacter,
        createCharacterScript,
        getCharactersScript,
        saveAvailableCharacters,
        getCharacterByIdScript,
        updateCharacterScript,
        deleteCharacterScript,
        getCharactersByTypeScript
    };
} 