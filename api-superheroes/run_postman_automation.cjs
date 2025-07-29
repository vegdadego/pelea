#!/usr/bin/env node

/**
 * Script para ejecutar la automatización completa de Postman
 * Requiere: npm install -g newman
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Automatización Completa de API Superhéroes');
console.log('=====================================================\n');

// Configuración
const config = {
    collection: './Postman_Complete_Collection.json',
    environment: './postman_environment.json',
    iterations: 1,
    delay: 1000, // 1 segundo entre requests
    timeout: 30000, // 30 segundos timeout
    reporters: ['cli', 'json'],
    reporterOptions: {
        json: {
            output: './test-results.json'
        }
    }
};

// Crear archivo de entorno temporal
const environmentData = {
    id: 'api-superheroes-env',
    name: 'API Superhéroes Environment',
    values: [
        {
            key: 'baseUrl',
            value: 'https://pelea.onrender.com/api',
            enabled: true
        },
        {
            key: 'apiVersion',
            value: '1.0.0',
            enabled: true
        },
        {
            key: 'environment',
            value: 'production',
            enabled: true
        },
        {
            key: 'authToken',
            value: '',
            enabled: true
        },
        {
            key: 'adminToken',
            value: '',
            enabled: true
        },
        {
            key: 'currentBattleId',
            value: '',
            enabled: true
        },
        {
            key: 'currentTeamId',
            value: '',
            enabled: true
        },
        {
            key: 'availableCharacters',
            value: '[]',
            enabled: true
        },
        {
            key: 'availableTeams',
            value: '[]',
            enabled: true
        }
    ]
};

// Función para crear archivo de entorno
function createEnvironmentFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile(
            config.environment,
            JSON.stringify(environmentData, null, 2),
            (err) => {
                if (err) {
                    console.error('❌ Error creando archivo de entorno:', err);
                    reject(err);
                } else {
                    console.log('✅ Archivo de entorno creado:', config.environment);
                    resolve();
                }
            }
        );
    });
}

// Función para verificar que Newman esté instalado
function checkNewman() {
    return new Promise((resolve, reject) => {
        exec('newman --version', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Newman no está instalado. Instálalo con: npm install -g newman');
                reject(error);
            } else {
                console.log('✅ Newman instalado:', stdout.trim());
                resolve();
            }
        });
    });
}

// Función para ejecutar la colección
function runCollection() {
    return new Promise((resolve, reject) => {
        const command = `newman run "${config.collection}" \
            --environment "${config.environment}" \
            --iteration-count ${config.iterations} \
            --delay-request ${config.delay} \
            --timeout ${config.timeout} \
            --reporters cli,json \
            --reporter-json-export test-results.json`;

        console.log('🔄 Ejecutando colección de Postman...');
        console.log('Comando:', command);
        console.log('');

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Error ejecutando Newman:', error);
                reject(error);
            } else {
                console.log('✅ Colección ejecutada exitosamente');
                console.log('Salida:', stdout);
                if (stderr) {
                    console.log('Errores:', stderr);
                }
                resolve(stdout);
            }
        });
    });
}

// Función para mostrar resultados
function showResults() {
    return new Promise((resolve, reject) => {
        if (fs.existsSync('./test-results.json')) {
            fs.readFile('./test-results.json', 'utf8', (err, data) => {
                if (err) {
                    console.error('❌ Error leyendo resultados:', err);
                    reject(err);
                } else {
                    const results = JSON.parse(data);
                    console.log('\n📊 RESULTADOS DE LA AUTOMATIZACIÓN');
                    console.log('=====================================');
                    console.log(`Total de requests: ${results.run.stats.requests.total}`);
                    console.log(`Requests exitosos: ${results.run.stats.requests.passed}`);
                    console.log(`Requests fallidos: ${results.run.stats.requests.failed}`);
                    console.log(`Tiempo total: ${results.run.timings.completed - results.run.timings.started}ms`);
                    
                    if (results.run.failures && results.run.failures.length > 0) {
                        console.log('\n❌ FALLOS ENCONTRADOS:');
                        results.run.failures.forEach((failure, index) => {
                            console.log(`${index + 1}. ${failure.source.name}: ${failure.error.message}`);
                        });
                    } else {
                        console.log('\n✅ Todos los tests pasaron exitosamente!');
                    }
                    
                    resolve(results);
                }
            });
        } else {
            console.log('⚠️ No se encontró archivo de resultados');
            resolve();
        }
    });
}

// Función para limpiar archivos temporales
function cleanup() {
    return new Promise((resolve) => {
        const filesToClean = [config.environment];
        
        filesToClean.forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlink(file, (err) => {
                    if (err) {
                        console.log(`⚠️ No se pudo eliminar ${file}:`, err.message);
                    } else {
                        console.log(`🧹 Archivo eliminado: ${file}`);
                    }
                });
            }
        });
        
        resolve();
    });
}

// Función principal
async function main() {
    try {
        // Verificar Newman
        await checkNewman();
        
        // Crear archivo de entorno
        await createEnvironmentFile();
        
        // Ejecutar colección
        await runCollection();
        
        // Mostrar resultados
        await showResults();
        
        // Limpiar archivos temporales
        await cleanup();
        
        console.log('\n🎉 Automatización completada!');
        
    } catch (error) {
        console.error('💥 Error en la automatización:', error);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main();
}

module.exports = {
    main,
    createEnvironmentFile,
    checkNewman,
    runCollection,
    showResults,
    cleanup
}; 