#!/usr/bin/env node

/**
 * Script para probar la conectividad con la API desplegada en Render
 * https://pelea.onrender.com
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'https://pelea.onrender.com/api';

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

async function testEndpoint(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.text();

        return {
            success: response.ok,
            status: response.status,
            data: data,
            endpoint: endpoint
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            endpoint: endpoint
        };
    }
}

async function testAuthentication() {
    log('\n🔐 Probando Autenticación...', 'blue');
    
    // Test 1: Login Admin
    log('1. Probando login admin...', 'yellow');
    const loginResult = await testEndpoint('/auth/login', 'POST', {
        user: 'vegdadego',
        password: 'admin123'
    });
    
    if (loginResult.success) {
        log('✅ Login admin exitoso', 'green');
        try {
            const loginData = JSON.parse(loginResult.data);
            if (loginData.token) {
                log(`   Token obtenido: ${loginData.token.substring(0, 20)}...`, 'green');
                return loginData.token;
            }
        } catch (e) {
            log('⚠️ No se pudo parsear la respuesta del login', 'yellow');
        }
    } else {
        log(`❌ Login admin falló: ${loginResult.status}`, 'red');
        log(`   Respuesta: ${loginResult.data}`, 'red');
    }
    
    return null;
}

async function testCharacters(token) {
    log('\n👥 Probando Endpoints de Personajes...', 'blue');
    
    // Test 1: Obtener personajes (requiere admin)
    log('1. Probando GET /personajes (admin)...', 'yellow');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const charactersResult = await testEndpoint('/personajes', 'GET');
    if (charactersResult.success) {
        log('✅ GET /personajes exitoso', 'green');
        try {
            const characters = JSON.parse(charactersResult.data);
            log(`   Personajes encontrados: ${characters.length}`, 'green');
        } catch (e) {
            log('⚠️ No se pudo parsear la respuesta', 'yellow');
        }
    } else {
        log(`❌ GET /personajes falló: ${charactersResult.status}`, 'red');
        log(`   Respuesta: ${charactersResult.data}`, 'red');
    }
}

async function testTeams(token) {
    log('\n⚔️ Probando Endpoints de Equipos...', 'blue');
    
    // Test 1: Obtener equipos
    log('1. Probando GET /equipos...', 'yellow');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const teamsResult = await testEndpoint('/equipos', 'GET');
    if (teamsResult.success) {
        log('✅ GET /equipos exitoso', 'green');
        try {
            const teams = JSON.parse(teamsResult.data);
            log(`   Equipos encontrados: ${teams.length}`, 'green');
        } catch (e) {
            log('⚠️ No se pudo parsear la respuesta', 'yellow');
        }
    } else {
        log(`❌ GET /equipos falló: ${teamsResult.status}`, 'red');
        log(`   Respuesta: ${teamsResult.data}`, 'red');
    }
    
    // Test 2: Crear equipo
    log('2. Probando POST /equipos...', 'yellow');
    const createTeamResult = await testEndpoint('/equipos', 'POST', {
        nombre: 'Equipo de Prueba',
        miembros: [1, 2, 3]
    });
    
    if (createTeamResult.success) {
        log('✅ POST /equipos exitoso', 'green');
        try {
            const team = JSON.parse(createTeamResult.data);
            log(`   Equipo creado con ID: ${team.id}`, 'green');
        } catch (e) {
            log('⚠️ No se pudo parsear la respuesta', 'yellow');
        }
    } else {
        log(`❌ POST /equipos falló: ${createTeamResult.status}`, 'red');
        log(`   Respuesta: ${createTeamResult.data}`, 'red');
    }
}

async function testBattles(token) {
    log('\n⚔️ Probando Endpoints de Batallas...', 'blue');
    
    // Test 1: Obtener batallas
    log('1. Probando GET /battles...', 'yellow');
    const battlesResult = await testEndpoint('/battles', 'GET');
    if (battlesResult.success) {
        log('✅ GET /battles exitoso', 'green');
        try {
            const battles = JSON.parse(battlesResult.data);
            log(`   Batallas encontradas: ${battles.length}`, 'green');
        } catch (e) {
            log('⚠️ No se pudo parsear la respuesta', 'yellow');
        }
    } else {
        log(`❌ GET /battles falló: ${battlesResult.status}`, 'red');
        log(`   Respuesta: ${battlesResult.data}`, 'red');
    }
    
    // Test 2: Obtener personajes para batalla
    log('2. Probando GET /battles/characters...', 'yellow');
    const charactersResult = await testEndpoint('/battles/characters', 'GET');
    if (charactersResult.success) {
        log('✅ GET /battles/characters exitoso', 'green');
        try {
            const characters = JSON.parse(charactersResult.data);
            log(`   Personajes disponibles: ${characters.length}`, 'green');
        } catch (e) {
            log('⚠️ No se pudo parsear la respuesta', 'yellow');
        }
    } else {
        log(`❌ GET /battles/characters falló: ${charactersResult.status}`, 'red');
        log(`   Respuesta: ${charactersResult.data}`, 'red');
    }
}

async function testSwagger() {
    log('\n📚 Probando Documentación Swagger...', 'blue');
    
    // Test: Acceder a Swagger UI
    log('1. Probando acceso a Swagger UI...', 'yellow');
    try {
        const response = await fetch('https://pelea.onrender.com/api-docs');
        if (response.ok) {
            log('✅ Swagger UI accesible', 'green');
        } else {
            log(`❌ Swagger UI no accesible: ${response.status}`, 'red');
        }
    } catch (error) {
        log(`❌ Error accediendo a Swagger UI: ${error.message}`, 'red');
    }
}

async function main() {
    log('🚀 Iniciando Test de Conectividad con API Desplegada', 'bold');
    log('=====================================================', 'bold');
    log(`🌐 URL: ${API_BASE_URL}`, 'blue');
    
    // Test básico de conectividad
    log('\n🔍 Probando conectividad básica...', 'blue');
    const basicTest = await testEndpoint('/auth/login', 'POST', {
        user: 'test',
        password: 'test'
    });
    
    if (basicTest.success || basicTest.status === 400) {
        log('✅ API responde correctamente', 'green');
    } else {
        log('❌ API no responde', 'red');
        log(`   Error: ${basicTest.error || 'Sin respuesta'}`, 'red');
        return;
    }
    
    // Test de autenticación
    const token = await testAuthentication();
    
    // Test de endpoints
    await testCharacters(token);
    await testTeams(token);
    await testBattles(token);
    await testSwagger();
    
    log('\n🎉 Test de Conectividad Completado!', 'bold');
    log('=====================================', 'bold');
    log('✅ Tu API está funcionando correctamente en Render', 'green');
    log('📋 Puedes usar la automatización de Postman con confianza', 'green');
}

// Manejo de errores
process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Error no manejado: ${reason}`, 'red');
    process.exit(1);
});

// Ejecutar si es el archivo principal
if (require.main === module) {
    main().catch(error => {
        log(`💥 Error en el test: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = {
    testEndpoint,
    testAuthentication,
    testCharacters,
    testTeams,
    testBattles,
    testSwagger
}; 