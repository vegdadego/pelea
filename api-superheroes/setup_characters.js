#!/usr/bin/env node

/**
 * Script para verificar y crear personajes en la base de datos
 * Este script se conecta a MongoDB y crea personajes si no existen
 */

import mongoose from 'mongoose';
import Character from './models/characterModel.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Datos de personajes predefinidos
const defaultCharacters = [
    {
        id: 1,
        nombre: "Bruce Wayne",
        alias: "Batman",
        tipo: "heroe",
        ciudad: "Gotham City",
        equipo: "Justice League",
        stats: {
            health: 100,
            maxHealth: 100,
            attack: 85,
            defense: 90,
            speed: 80
        }
    },
    {
        id: 2,
        nombre: "Clark Kent",
        alias: "Superman",
        tipo: "heroe",
        ciudad: "Metropolis",
        equipo: "Justice League",
        stats: {
            health: 120,
            maxHealth: 120,
            attack: 95,
            defense: 85,
            speed: 90
        }
    },
    {
        id: 3,
        nombre: "Diana Prince",
        alias: "Wonder Woman",
        tipo: "heroe",
        ciudad: "Themyscira",
        equipo: "Justice League",
        stats: {
            health: 110,
            maxHealth: 110,
            attack: 90,
            defense: 88,
            speed: 85
        }
    },
    {
        id: 4,
        nombre: "Barry Allen",
        alias: "Flash",
        tipo: "heroe",
        ciudad: "Central City",
        equipo: "Justice League",
        stats: {
            health: 90,
            maxHealth: 90,
            attack: 75,
            defense: 70,
            speed: 100
        }
    },
    {
        id: 5,
        nombre: "Arthur Curry",
        alias: "Aquaman",
        tipo: "heroe",
        ciudad: "Atlantis",
        equipo: "Justice League",
        stats: {
            health: 105,
            maxHealth: 105,
            attack: 88,
            defense: 92,
            speed: 75
        }
    },
    {
        id: 6,
        nombre: "Victor Stone",
        alias: "Cyborg",
        tipo: "heroe",
        ciudad: "Detroit",
        equipo: "Justice League",
        stats: {
            health: 115,
            maxHealth: 115,
            attack: 92,
            defense: 95,
            speed: 70
        }
    },
    {
        id: 7,
        nombre: "Joker",
        alias: "The Joker",
        tipo: "villano",
        ciudad: "Gotham City",
        equipo: "Injustice League",
        stats: {
            health: 95,
            maxHealth: 95,
            attack: 80,
            defense: 65,
            speed: 75
        }
    },
    {
        id: 8,
        nombre: "Lex Luthor",
        alias: "Lex Luthor",
        tipo: "villano",
        ciudad: "Metropolis",
        equipo: "Injustice League",
        stats: {
            health: 85,
            maxHealth: 85,
            attack: 70,
            defense: 80,
            speed: 65
        }
    }
];

// Colores para console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function connectToDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/superheroes';
        await mongoose.connect(mongoUri);
        log('✅ Conectado a MongoDB', 'green');
        return true;
    } catch (error) {
        log(`❌ Error conectando a MongoDB: ${error.message}`, 'red');
        return false;
    }
}

async function checkExistingCharacters() {
    try {
        const count = await Character.countDocuments();
        log(`📊 Personajes existentes en la base de datos: ${count}`, 'blue');
        return count;
    } catch (error) {
        log(`❌ Error contando personajes: ${error.message}`, 'red');
        return 0;
    }
}

async function createCharacters() {
    try {
        log('\n🔄 Creando personajes...', 'yellow');
        
        for (const charData of defaultCharacters) {
            // Verificar si el personaje ya existe
            const existing = await Character.findOne({ id: charData.id });
            
            if (existing) {
                log(`⚠️ Personaje ${charData.alias} ya existe (ID: ${charData.id})`, 'yellow');
            } else {
                const character = new Character(charData);
                await character.save();
                log(`✅ Creado: ${charData.alias} (ID: ${charData.id})`, 'green');
            }
        }
        
        log('✅ Proceso de creación completado', 'green');
    } catch (error) {
        log(`❌ Error creando personajes: ${error.message}`, 'red');
    }
}

async function listCharacters() {
    try {
        const characters = await Character.find().sort({ id: 1 });
        log('\n📋 Lista de Personajes:', 'blue');
        log('================================', 'blue');
        
        characters.forEach(char => {
            log(`${char.id}. ${char.alias} (${char.nombre})`, 'green');
            log(`   Tipo: ${char.tipo} | Ciudad: ${char.ciudad}`, 'yellow');
            log(`   Stats: HP:${char.stats.health} ATK:${char.stats.attack} DEF:${char.stats.defense} SPD:${char.stats.speed}`, 'blue');
            log('', 'reset');
        });
        
        return characters.length;
    } catch (error) {
        log(`❌ Error listando personajes: ${error.message}`, 'red');
        return 0;
    }
}

async function testAPIEndpoint() {
    try {
        log('\n🌐 Probando endpoint de la API...', 'blue');
        
        // Primero hacer login
        const loginResponse = await fetch('https://pelea.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: 'vegdadego',
                password: 'admin123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login falló: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        log('✅ Login exitoso', 'green');
        
        // Ahora probar el endpoint de personajes
        const charactersResponse = await fetch('https://pelea.onrender.com/api/personajes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!charactersResponse.ok) {
            throw new Error(`Error obteniendo personajes: ${charactersResponse.status}`);
        }
        
        const characters = await charactersResponse.json();
        log(`✅ API devuelve ${characters.length} personajes`, 'green');
        
        return characters.length;
    } catch (error) {
        log(`❌ Error probando API: ${error.message}`, 'red');
        return 0;
    }
}

async function main() {
    log('🎮 Setup de Personajes - Superhéroes Battle', 'bold');
    log('==========================================', 'bold');
    
    // Conectar a la base de datos
    const connected = await connectToDatabase();
    if (!connected) {
        log('❌ No se pudo conectar a la base de datos', 'red');
        process.exit(1);
    }
    
    // Verificar personajes existentes
    const existingCount = await checkExistingCharacters();
    
    if (existingCount === 0) {
        log('\n📝 No hay personajes en la base de datos. Creando personajes por defecto...', 'yellow');
        await createCharacters();
    } else if (existingCount < defaultCharacters.length) {
        log(`\n⚠️ Solo hay ${existingCount} personajes. Creando los faltantes...`, 'yellow');
        await createCharacters();
    } else {
        log('\n✅ Ya hay suficientes personajes en la base de datos', 'green');
    }
    
    // Listar personajes
    const totalCharacters = await listCharacters();
    
    // Probar endpoint de la API
    const apiCharacters = await testAPIEndpoint();
    
    // Resumen final
    log('\n📊 Resumen:', 'blue');
    log(`✅ Personajes en MongoDB: ${totalCharacters}`, 'green');
    log(`✅ Personajes en API: ${apiCharacters}`, 'green');
    
    if (totalCharacters > 0 && apiCharacters > 0) {
        log('\n🎉 ¡Todo listo! Tu interfaz HTML debería cargar los personajes correctamente.', 'green');
        log('🌐 Abre game-interface/index.html en tu navegador', 'blue');
    } else {
        log('\n⚠️ Hay problemas con la carga de personajes. Revisa los errores arriba.', 'yellow');
    }
    
    // Cerrar conexión
    await mongoose.connection.close();
    log('\n🔌 Conexión a MongoDB cerrada', 'blue');
}

// Manejo de errores
process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Error no manejado: ${reason}`, 'red');
    process.exit(1);
});

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        log(`💥 Error en el setup: ${error.message}`, 'red');
        process.exit(1);
    });
}

export { main, defaultCharacters }; 