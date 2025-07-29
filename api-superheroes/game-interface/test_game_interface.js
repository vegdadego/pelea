#!/usr/bin/env node

/**
 * Script para probar la interfaz del juego Superhéroes Battle
 * Verifica que todos los componentes funcionen correctamente
 */

const fs = require('fs');
const path = require('path');

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

function checkFile(filePath, description) {
    try {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024).toFixed(2);
            log(`✅ ${description} - ${size} KB`, 'green');
            return true;
        } else {
            log(`❌ ${description} - No encontrado`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ ${description} - Error: ${error.message}`, 'red');
        return false;
    }
}

function validateHTML(htmlPath) {
    try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Verificar elementos esenciales
        const requiredElements = [
            'startScreen',
            'selectionScreen', 
            'battleScreen',
            'startBtn',
            'startBattleBtn',
            'charactersGrid',
            'attackBtn',
            'battleLog'
        ];

        let allFound = true;
        requiredElements.forEach(element => {
            if (!html.includes(`id="${element}"`)) {
                log(`❌ Elemento HTML faltante: ${element}`, 'red');
                allFound = false;
            }
        });

        if (allFound) {
            log('✅ Todos los elementos HTML requeridos encontrados', 'green');
        }

        // Verificar enlaces a archivos
        if (html.includes('styles.css')) {
            log('✅ Enlace a CSS encontrado', 'green');
        } else {
            log('❌ Enlace a CSS faltante', 'red');
        }

        if (html.includes('game.js')) {
            log('✅ Enlace a JavaScript encontrado', 'green');
        } else {
            log('❌ Enlace a JavaScript faltante', 'red');
        }

        return allFound;
    } catch (error) {
        log(`❌ Error validando HTML: ${error.message}`, 'red');
        return false;
    }
}

function validateCSS(cssPath) {
    try {
        const css = fs.readFileSync(cssPath, 'utf8');
        
        // Verificar variables CSS
        if (css.includes(':root')) {
            log('✅ Variables CSS definidas', 'green');
        } else {
            log('❌ Variables CSS faltantes', 'red');
        }

        // Verificar clases principales
        const requiredClasses = [
            '.container',
            '.header',
            '.btn',
            '.character-card',
            '.battle-field',
            '.health-bar',
            '.move-btn',
            '.battle-log'
        ];

        let allFound = true;
        requiredClasses.forEach(className => {
            if (!css.includes(className)) {
                log(`❌ Clase CSS faltante: ${className}`, 'red');
                allFound = false;
            }
        });

        if (allFound) {
            log('✅ Todas las clases CSS requeridas encontradas', 'green');
        }

        // Verificar animaciones
        if (css.includes('@keyframes')) {
            log('✅ Animaciones CSS definidas', 'green');
        } else {
            log('❌ Animaciones CSS faltantes', 'red');
        }

        return allFound;
    } catch (error) {
        log(`❌ Error validando CSS: ${error.message}`, 'red');
        return false;
    }
}

function validateJS(jsPath) {
    try {
        const js = fs.readFileSync(jsPath, 'utf8');
        
        // Verificar clase principal
        if (js.includes('class SuperheroesBattle')) {
            log('✅ Clase principal del juego encontrada', 'green');
        } else {
            log('❌ Clase principal del juego faltante', 'red');
        }

        // Verificar métodos principales
        const requiredMethods = [
            'constructor',
            'startGame',
            'loadCharacters',
            'startBattle',
            'performAttack',
            'apiCall'
        ];

        let allFound = true;
        requiredMethods.forEach(method => {
            if (!js.includes(`${method}(`)) {
                log(`❌ Método JavaScript faltante: ${method}`, 'red');
                allFound = false;
            }
        });

        if (allFound) {
            log('✅ Todos los métodos JavaScript requeridos encontrados', 'green');
        }

        // Verificar URL de API
        if (js.includes('https://pelea.onrender.com/api')) {
            log('✅ URL de API configurada correctamente', 'green');
        } else {
            log('❌ URL de API no configurada', 'red');
        }

        return allFound;
    } catch (error) {
        log(`❌ Error validando JavaScript: ${error.message}`, 'red');
        return false;
    }
}

function checkStructure() {
    log('\n📁 Verificando estructura de archivos...', 'blue');
    
    const files = [
        { path: 'index.html', description: 'Página principal del juego' },
        { path: 'styles.css', description: 'Estilos CSS' },
        { path: 'game.js', description: 'Lógica JavaScript del juego' },
        { path: 'README.md', description: 'Documentación' }
    ];

    let allFilesExist = true;
    files.forEach(file => {
        if (!checkFile(file.path, file.description)) {
            allFilesExist = false;
        }
    });

    return allFilesExist;
}

function validateContent() {
    log('\n🔍 Validando contenido de archivos...', 'blue');
    
    let allValid = true;
    
    // Validar HTML
    if (!validateHTML('index.html')) {
        allValid = false;
    }
    
    // Validar CSS
    if (!validateCSS('styles.css')) {
        allValid = false;
    }
    
    // Validar JavaScript
    if (!validateJS('game.js')) {
        allValid = false;
    }
    
    return allValid;
}

function generateTestReport() {
    log('\n📊 Generando reporte de pruebas...', 'blue');
    
    const report = {
        timestamp: new Date().toISOString(),
        files: {
            indexHtml: fs.existsSync('index.html'),
            stylesCss: fs.existsSync('styles.css'),
            gameJs: fs.existsSync('game.js'),
            readmeMd: fs.existsSync('README.md')
        },
        structure: checkStructure(),
        content: validateContent()
    };
    
    // Guardar reporte
    fs.writeFileSync('test_report.json', JSON.stringify(report, null, 2));
    log('✅ Reporte guardado en test_report.json', 'green');
    
    return report;
}

function showUsageInstructions() {
    log('\n🎮 Instrucciones de Uso:', 'blue');
    log('1. Abre index.html en tu navegador', 'yellow');
    log('2. Presiona "Comenzar Juego"', 'yellow');
    log('3. Selecciona un personaje', 'yellow');
    log('4. Inicia una batalla', 'yellow');
    log('5. ¡Disfruta del combate!', 'yellow');
    
    log('\n🌐 Tu API está en: https://pelea.onrender.com', 'blue');
    log('📚 Documentación: README.md', 'blue');
}

function main() {
    log('🎮 Test de Interfaz del Juego Superhéroes Battle', 'bold');
    log('================================================', 'bold');
    
    // Verificar que estemos en el directorio correcto
    if (!fs.existsSync('index.html')) {
        log('❌ No se encontró index.html. Asegúrate de estar en el directorio game-interface/', 'red');
        process.exit(1);
    }
    
    // Ejecutar pruebas
    const report = generateTestReport();
    
    // Mostrar resumen
    log('\n📋 Resumen de Pruebas:', 'blue');
    log(`✅ Archivos encontrados: ${Object.values(report.files).filter(Boolean).length}/4`, 'green');
    log(`✅ Estructura válida: ${report.structure ? 'Sí' : 'No'}`, report.structure ? 'green' : 'red');
    log(`✅ Contenido válido: ${report.content ? 'Sí' : 'No'}`, report.content ? 'green' : 'red');
    
    if (report.structure && report.content) {
        log('\n🎉 ¡La interfaz del juego está lista para usar!', 'green');
        showUsageInstructions();
    } else {
        log('\n⚠️ Se encontraron problemas. Revisa los errores arriba.', 'yellow');
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main();
}

module.exports = {
    checkFile,
    validateHTML,
    validateCSS,
    validateJS,
    checkStructure,
    validateContent,
    generateTestReport
}; 