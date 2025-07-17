/**
 * Script de prueba para el sistema de batallas activas
 * 
 * Este script demuestra cómo:
 * 1. Crear una batalla entre equipos
 * 2. Ejecutar acciones de pelea paso a paso
 * 3. Obtener el estado de la batalla
 * 
 * Para ejecutar: node test_battle_system.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';
let authToken = null;

// Función para hacer login y obtener token
async function login() {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            console.log('✅ Login exitoso');
            return true;
        } else {
            console.log('❌ Error en login:', await response.text());
            return false;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return false;
    }
}

// Función para crear una batalla entre equipos
async function createTeamBattle() {
    try {
        const response = await fetch(`${BASE_URL}/battles/team-vs-team`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                equipo1Id: 1, // Los Vengadores
                equipo2: 2, // La Liga de la Justicia
                equipo1Level: 3, // Nivel 3 para Los Vengadores
                equipo2Level: 4 // Nivel4para La Liga de la Justicia
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Batalla creada exitosamente');
            console.log('Battle ID:', data.battleId);
            console.log('Estado inicial:', data.currentCharacterStates.length, 'personajes');
            return data.battleId;
        } else {
            console.log('❌ Error creando batalla:', await response.text());
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Función para obtener el estado de la batalla
async function getBattleState(battleId) {
    try {
        const response = await fetch(`${BASE_URL}/battles/${battleId}/state`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('\n📊 Estado de la batalla:');
            console.log(`Turno: ${data.battleState.currentTurn}`);
            console.log(`Equipo actual: ${data.battleState.currentTeamTurn}`);
            console.log(`Acciones restantes: ${data.battleState.remainingActions}`);
            console.log(`Estado: ${data.battleState.battleStatus}`);
            console.log(`Terminada: ${data.battleState.isFinished}`);
            
            console.log('\n👥 Personajes:');
            data.battleState.characterStates.forEach(char => {
                const status = char.isAlive ? '🟢' : '🔴';
                console.log(`${status} ${char.alias} (Equipo ${char.teamId}): ${char.currentHealth}/${char.maxHealth} HP`);
            });
            
            return data.battleState;
        } else {
            console.log('❌ Error obteniendo estado:', await response.text());
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Función para obtener acciones disponibles
async function getAvailableActions(battleId) {
    try {
        const response = await fetch(`${BASE_URL}/battles/${battleId}/available-actions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('\n🎯 Acciones disponibles:');
            console.log(`Equipo actual: ${data.currentTeam}`);
            console.log(`Acciones restantes: ${data.remainingActions}`);
            
            console.log('\n⚔️ Atacantes disponibles:');
            data.availableAttackers.forEach(attacker => {
                console.log(`  - ${attacker.alias} (ID: ${attacker.id}) - HP: ${attacker.currentHealth}`);
            });
            
            console.log('\n🎯 Objetivos disponibles:');
            data.availableTargets.forEach(target => {
                console.log(`  - ${target.alias} (ID: ${target.id}) - HP: ${target.currentHealth}`);
            });
            
            return data;
        } else {
            console.log('❌ Error obteniendo acciones disponibles:', await response.text());
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Función para ejecutar una acción de pelea
async function executeBattleAction(battleId, attackerId, targetId, attackType) {
    try {
        const response = await fetch(`${BASE_URL}/battles/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                battleId,
                attackerId,
                targetId,
                attackType
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('\n⚔️ Acción ejecutada:');
            console.log(`${data.attackLog.attacker} → ${data.attackLog.defender}`);
            console.log(`Ataque: ${data.attackLog.attackName}`);
            console.log(`Tipo: ${data.attackLog.attackType}`);
            console.log(`Daño: ${data.attackLog.damage}`);
            console.log(`Crítico: ${data.attackLog.critical ? '✅' : '❌'}`);
            console.log(`Falló: ${data.attackLog.miss ? '✅' : '❌'}`);
            console.log(`Vida restante del objetivo: ${data.attackLog.defenderHealth}`);
            
            return data;
        } else {
            console.log('❌ Error ejecutando acción:', await response.text());
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Función principal que ejecuta la demostración
async function runDemo() {
    console.log('🎮 Iniciando demostración del sistema de batallas activas...\n');

    // 1. Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ No se pudo hacer login. Terminando demo.');
        return;
    }

    // 2. Crear batalla
    const battleId = await createTeamBattle();
    if (!battleId) {
        console.log('❌ No se pudo crear la batalla. Terminando demo.');
        return;
    }

    // 3. Mostrar estado inicial
    await getBattleState(battleId);

    // 3.5. Mostrar acciones disponibles
    await getAvailableActions(battleId);

    // 4. Ejecutar acciones de pelea para demostrar el nuevo sistema
    console.log('\n🎯 Ejecutando acciones de pelea (nuevo sistema de múltiples ataques)...');
    
    // Equipo 1 ataca (3 acciones disponibles)
    console.log('\n⚔️ Turno del Equipo 1 (Los Vengadores):');
    
    // Acción 1: Spider-Man ataca a Superman con ataque especial
    await executeBattleAction(battleId, 1, 4, 'especial');
    await getBattleState(battleId);

    // Acción 2: Iron Man ataca a Batman con ataque especial
    await executeBattleAction(battleId, 2, 5, 'especial');
    await getBattleState(battleId);

    // Acción 3: Thor ataca a Wonder Woman con ataque especial
    await executeBattleAction(battleId, 3, 6, 'especial');
    await getBattleState(battleId);

    // Equipo 2 ataca (3 acciones disponibles)
    console.log('\n⚔️ Turno del Equipo 2 (La Liga de la Justicia):');
    
    // Acción 4: Superman ataca a Spider-Man con ataque normal
    await executeBattleAction(battleId, 4, 1, 'normal');
    await getBattleState(battleId);

    // Acción 5: Batman ataca a Iron Man con ataque normal
    await executeBattleAction(battleId, 5, 2, 'normal');
    await getBattleState(battleId);

    // Acción 6: Wonder Woman ataca a Thor con ataque especial
    await executeBattleAction(battleId, 6, 3, 'especial');
    await getBattleState(battleId);

    // Segundo turno del Equipo 1
    console.log('\n⚔️ Segundo turno del Equipo 1:');
    
    // Acción 7: Spider-Man ataca a Superman con ataque normal
    await executeBattleAction(battleId, 1, 4, 'normal');
    await getBattleState(battleId);

    console.log('\n🎉 Demostración completada!');
    console.log('Puedes continuar ejecutando acciones hasta que la batalla termine.');
    console.log('Usa getBattleState() para ver el estado actual en cualquier momento.');
}

// Ejecutar la demostración
runDemo().catch(console.error); 