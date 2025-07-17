import Character from '../models/characterModel.js';
import characterRepository from '../repositories/characterRepository.js';
import Battle from '../models/battleModel.js';
import teamRepository from '../repositories/teamRepository.js';

class BattleService {
    async createBattle(char1Id, char2Id, userId) {
        const characters = await characterRepository.getCharacters();
        const char1 = characters.find(c => c.id === parseInt(char1Id));
        const char2 = characters.find(c => c.id === parseInt(char2Id));
        if (!char1 || !char2) throw new Error('Uno o ambos personajes no encontrados');
        // Inicializar personajes con los campos requeridos
        const getCharState = (char) => ({
            id: char.id,
            nombre: char.nombre,
            alias: char.alias,
            tipo: char.tipo,
            hp: Number(char.stats.health) || 100,
            maxHp: Number(char.stats.maxHealth) || 100,
            ataque_normal: (char.attacks && char.attacks[0] && Number(char.attacks[0].baseDamage)) || 10,
            ataque_especial: (char.attacks && char.attacks[1] && Number(char.attacks[1].baseDamage)) || 20,
            escudo: Number(char.stats.defense) || 20,
            escudoUsado: false
        });
        const battleDoc = new Battle({
            userId,
            type: '1v1',
            char1: getCharState(char1),
            char2: getCharState(char2),
            rounds: [],
            currentRound: 0,
            isFinished: false,
            startTime: new Date(),
            turnoActual: 'usuario'
        });
        await battleDoc.save();
        return battleDoc;
    }

    async createBattle3v3(equipo1Id, equipo2Id, userId) {
        const allTeams = await teamRepository.getTeams();
        const equipo1 = allTeams.find(t => t.id === equipo1Id);
        const equipo2 = allTeams.find(t => t.id === equipo2Id);
        if (!equipo1 || !equipo2) throw new Error('Uno o ambos equipos no existen');
        if (!Array.isArray(equipo1.miembros) || !Array.isArray(equipo2.miembros) || equipo1.miembros.length !== 3 || equipo2.miembros.length !== 3) {
            throw new Error('Ambos equipos deben tener exactamente 3 miembros');
        }
        const personajes = await characterRepository.getCharacters();
        const getCharState = (char) => ({
            id: char.id,
            nombre: char.nombre,
            alias: char.alias,
            tipo: char.tipo,
            hp: Number(char.stats.health) || 100,
            maxHp: Number(char.stats.maxHealth) || 100,
            ataque_normal: (char.attacks && char.attacks[0] && Number(char.attacks[0].baseDamage)) || 10,
            ataque_especial: (char.attacks && char.attacks[1] && Number(char.attacks[1].baseDamage)) || 20,
            escudo: Number(char.stats.defense) || 20,
            escudoUsado: false
        });
        const miembros1 = equipo1.miembros.map(id => getCharState(personajes.find(p => p.id === id)));
        const miembros2 = equipo2.miembros.map(id => getCharState(personajes.find(p => p.id === id)));
        const battleDoc = new Battle({
            userId,
            type: '3v3',
            equipo1: {
                id: equipo1.id,
                nombre: equipo1.nombre,
                miembros: miembros1
            },
            equipo2: {
                id: equipo2.id,
                nombre: equipo2.nombre,
                miembros: miembros2
            },
            rounds: [],
            currentRound: 0,
            isFinished: false,
            startTime: new Date(),
            turnoActual: 'usuario'
        });
        await battleDoc.save();
        return battleDoc;
    }

    async getAllBattles(userId) {
        throw new Error('Lógica de batalla no implementada');
    }

    async getBattleStats(battleId, userId) {
        throw new Error('Lógica de batalla no implementada');
    }

    async simulateRound(battleId, userId, { attackType = 'normal', useShield, nivel, target }) {
        const battle = await Battle.findOne({ _id: battleId, userId });
        if (!battle) throw new Error('Batalla no encontrada');
        if (battle.isFinished) throw new Error('La batalla ya ha terminado');

        function aplicarDanio(defensor, danio, usarEscudo, nivelAtacante = 1) {
            let absorbido = 0;
            if (usarEscudo && !defensor.escudoUsado && defensor.escudo > 0) {
                absorbido = Math.min(defensor.escudo, danio);
                defensor.escudoUsado = true;
            }
            const danioConNivel = danio * (1 + (nivelAtacante - 1) * 0.1);
            const danioReal = Math.max(0, danioConNivel - absorbido);
            defensor.hp = Math.max(0, defensor.hp - danioReal);
            return { danioReal, absorbido };
        }

        // 1v1 (igual que antes)
        if (battle.type === '1v1') {
            let user = battle.char1;
            let ia = battle.char2;
            let turno = battle.turnoActual;
            let resultado = { turno, acciones: [] };
            // Nivel del usuario (del body o por defecto 1)
            const nivelUsuario = typeof nivel === 'number' && nivel > 0 ? nivel : (user.nivel || 1);
            const nivelIA = ia.nivel || 1;

            // TURNO DEL USUARIO
            if (turno === 'usuario') {
                let danio = attackType === 'especial' ? user.ataque_especial : user.ataque_normal;
                const { danioReal, absorbido } = aplicarDanio(ia, danio, false, nivelUsuario);
                resultado.acciones.push({
                    atacante: user.alias,
                    defensor: ia.alias,
                    tipoAtaque: attackType,
                    danio: danioReal,
                    absorbido,
                    hpDefensor: ia.hp,
                    nivel: nivelUsuario
                });
                battle.turnoActual = 'ia';
            }
            // TURNO DE LA IA
            else if (turno === 'ia') {
                let iaUsaEspecial = Math.random() < 0.3;
                let iaUsaEscudo = ia.hp < ia.maxHp * 0.4 && !ia.escudoUsado && ia.escudo > 0;
                let danio = iaUsaEspecial ? ia.ataque_especial : ia.ataque_normal;
                const { danioReal, absorbido } = aplicarDanio(user, danio, useShield, nivelIA);
                resultado.acciones.push({
                    atacante: ia.alias,
                    defensor: user.alias,
                    tipoAtaque: iaUsaEspecial ? 'especial' : 'normal',
                    danio: danioReal,
                    absorbido,
                    hpDefensor: user.hp,
                    userEscudo: useShield,
                    nivel: nivelIA
                });
                battle.turnoActual = 'usuario';
            }

            // Guardar round
            battle.rounds.push({ round: (battle.rounds.length + 1), acciones: resultado.acciones });

            // Verificar fin de batalla
            if (user.hp <= 0 || ia.hp <= 0) {
                battle.isFinished = true;
                battle.winner = user.hp > 0 ? user.alias : ia.alias;
                battle.loser = user.hp > 0 ? ia.alias : user.alias;
                battle.endTime = new Date();
            }
            await battle.save();
            return {
                ...resultado,
                estado: {
                    usuario: { hp: user.hp, escudoUsado: user.escudoUsado, nivel: nivelUsuario },
                    ia: { hp: ia.hp, escudoUsado: ia.escudoUsado, nivel: nivelIA }
                },
                isFinished: battle.isFinished,
                winner: battle.isFinished ? battle.winner : null
            };
        }

        // 3v3 (equipos)
        if (battle.type === '3v3') {
            let equipo1 = battle.equipo1.miembros;
            let equipo2 = battle.equipo2.miembros;
            let user = equipo1.find(p => p.hp > 0);
            let turno = battle.turnoActual;
            let resultado = { turno, acciones: [] };
            const nivelUsuario = typeof nivel === 'number' && nivel > 0 ? nivel : (user.nivel || 1);

            // Verificar fin de batalla antes de turno
            const equipo1Vivo = equipo1.some(p => p.hp > 0);
            const equipo2Vivo = equipo2.some(p => p.hp > 0);
            if (!equipo1Vivo || !equipo2Vivo) {
                battle.isFinished = true;
                battle.winner = equipo1Vivo ? battle.equipo1.nombre : battle.equipo2.nombre;
                battle.loser = equipo1Vivo ? battle.equipo2.nombre : battle.equipo1.nombre;
                battle.endTime = new Date();
                await battle.save();
                return {
                    estado: {
                        equipo1: equipo1.map(p => ({ alias: p.alias, hp: p.hp, nivel: p.nivel || 1 })),
                        equipo2: equipo2.map(p => ({ alias: p.alias, hp: p.hp, nivel: p.nivel || 1 }))
                    },
                    isFinished: true,
                    winner: battle.winner
                };
            }

            // TURNO DEL USUARIO
            if (turno === 'usuario') {
                // Buscar objetivo por alias o id
                let objetivo = equipo2.find(p => (p.alias === target || String(p.id) === String(target)) && p.hp > 0);
                if (!objetivo) {
                    return { error: 'Objetivo inválido o KO. Debes seleccionar un enemigo vivo del equipo contrario.' };
                }
                let danio = attackType === 'especial' ? user.ataque_especial : user.ataque_normal;
                const { danioReal, absorbido } = aplicarDanio(objetivo, danio, false, nivelUsuario);
                resultado.acciones.push({
                    atacante: user.alias,
                    defensor: objetivo.alias,
                    tipoAtaque: attackType,
                    danio: danioReal,
                    absorbido,
                    hpDefensor: objetivo.hp,
                    nivel: nivelUsuario
                });
                battle.turnoActual = 'ia';
            }
            // TURNO DE LA IA
            else if (turno === 'ia') {
                // IA ataca al primer personaje vivo del equipo1
                let ia = equipo2.find(p => p.hp > 0);
                let objetivo = equipo1.find(p => p.hp > 0);
                const nivelIA = ia.nivel || 1;
                if (!ia || !objetivo) {
                    battle.isFinished = true;
                    battle.winner = objetivo ? battle.equipo1.nombre : battle.equipo2.nombre;
                    battle.loser = objetivo ? battle.equipo2.nombre : battle.equipo1.nombre;
                    battle.endTime = new Date();
                    await battle.save();
                    return {
                        estado: {
                            equipo1: equipo1.map(p => ({ alias: p.alias, hp: p.hp, nivel: p.nivel || 1 })),
                            equipo2: equipo2.map(p => ({ alias: p.alias, hp: p.hp, nivel: p.nivel || 1 }))
                        },
                        isFinished: true,
                        winner: battle.winner
                    };
                }
                let iaUsaEspecial = Math.random() < 0.3;
                let danio = iaUsaEspecial ? ia.ataque_especial : ia.ataque_normal;
                const { danioReal, absorbido } = aplicarDanio(objetivo, danio, useShield, nivelIA);
                resultado.acciones.push({
                    atacante: ia.alias,
                    defensor: objetivo.alias,
                    tipoAtaque: iaUsaEspecial ? 'especial' : 'normal',
                    danio: danioReal,
                    absorbido,
                    hpDefensor: objetivo.hp,
                    nivel: nivelIA
                });
                battle.turnoActual = 'usuario';
            }

            // Guardar round
            battle.rounds.push({ round: (battle.rounds.length + 1), acciones: resultado.acciones });

            // Verificar fin de batalla después del turno
            const equipo1VivoDespues = equipo1.some(p => p.hp > 0);
            const equipo2VivoDespues = equipo2.some(p => p.hp > 0);
            if (!equipo1VivoDespues || !equipo2VivoDespues) {
                battle.isFinished = true;
                battle.winner = equipo1VivoDespues ? battle.equipo1.nombre : battle.equipo2.nombre;
                battle.loser = equipo1VivoDespues ? battle.equipo2.nombre : battle.equipo1.nombre;
                battle.endTime = new Date();
            }
            await battle.save();
            return {
                ...resultado,
                estado: {
                    equipo1: equipo1.map(p => ({ alias: p.alias, hp: p.hp, escudoUsado: p.escudoUsado, nivel: p.nivel || 1 })),
                    equipo2: equipo2.map(p => ({ alias: p.alias, hp: p.hp, escudoUsado: p.escudoUsado, nivel: p.nivel || 1 }))
                },
                isFinished: battle.isFinished,
                winner: battle.isFinished ? battle.winner : null
            };
        }
    }

    async simulateFullBattle(battleId) {
        throw new Error('Lógica de batalla no implementada');
    }

    /**
     * Crea una nueva batalla entre equipos sin simular automáticamente
     */
    async createTeamBattle(equipo1Id, equipo2Id, userId, equipo1Level = 1, equipo2Level = 1) {
        const characters = await characterRepository.getCharacters();
        const allTeams = await (await import('../repositories/teamRepository.js')).default.getTeams();
        
        const equipo1 = allTeams.find(t => t.id === equipo1Id);
        const equipo2 = allTeams.find(t => t.id === equipo2Id);
        
        if (!equipo1 || !equipo2) {
            throw new Error('Uno o ambos equipos no existen');
        }
        
        if (!Array.isArray(equipo1.miembros) || !Array.isArray(equipo2.miembros) || 
            equipo1.miembros.length !== 3 || equipo2.miembros.length !== 3) {
            throw new Error('Ambos equipos deben tener exactamente 3 miembros');
        }

        // Verificar que todos los personajes existan
        for (const id of [...equipo1.miembros, ...equipo2.miembros]) {
            if (!characters.find(p => p.id === id)) {
                throw new Error(`El personaje con ID ${id} no existe`);
            }
        }

        // Crear estados iniciales de los personajes con niveles aplicados
        const characterStates = [];
        
        // Agregar personajes del equipo1con nivel aplicado
        for (const charId of equipo1.miembros) {
            const char = characters.find(c => c.id === charId);
            const charWithLevel = new Character(
                char.id,
                char.nombre,
                char.alias,
                char.tipo,
                char.ciudad,
                char.equipo,
                char.stats,
                equipo1Level
            );
            characterStates.push({
                id: char.id,
                nombre: char.nombre,
                alias: char.alias,
                tipo: char.tipo,
                currentHealth: charWithLevel.stats.health,
                maxHealth: charWithLevel.stats.health,
                isAlive: true,
                teamId: equipo1Id,
                level: equipo1Level
            });
        }
        
        // Agregar personajes del equipo2con nivel aplicado
        for (const charId of equipo2.miembros) {
            const char = characters.find(c => c.id === charId);
            const charWithLevel = new Character(
                char.id,
                char.nombre,
                char.alias,
                char.tipo,
                char.ciudad,
                char.equipo,
                char.stats,
                equipo2Level
            );
            characterStates.push({
                id: char.id,
                nombre: char.nombre,
                alias: char.alias,
                tipo: char.tipo,
                currentHealth: charWithLevel.stats.health,
                maxHealth: charWithLevel.stats.health,
                isAlive: true,
                teamId: equipo2Id,
                level: equipo2Level
            });
        }

        const battleDoc = new Battle({
            userId,
            type: '3v3',
            equipo1: {
                id: equipo1Id,
                nombre: equipo1.nombre,
                miembros: equipo1.miembros
            },
            equipo2: {
                id: equipo2Id,
                nombre: equipo2.nombre,
                miembros: equipo2.miembros
            },
            rounds: [],
            currentRound: 0,
            isFinished: false,
            battleStatus: 'active',
            currentCharacterStates: characterStates,
            currentTurn: 1,
            currentTeamTurn: 1,
            remainingActions: 3, // Cada equipo tiene 3 acciones por turno
            startTime: new Date(),
            alreadyAttacked: [] // Inicializar la lista de atacantes
        });

        await battleDoc.save();
        return battleDoc;
    }

    /**
     * Ejecuta una acción de pelea en una batalla existente
     */
    async executeBattleAction(battleId, userId, { attackerId, targetId, attackType }) {
        const battle = await Battle.findOne({ _id: battleId, userId });
        if (!battle) {
            throw new Error('Batalla no encontrada');
        }

        if (battle.isFinished || battle.battleStatus !== 'active') {
            throw new Error('La batalla ya ha terminado o no está activa');
        }

        // Validar que el atacante pertenezca a uno de los equipos
        const attackerState = battle.currentCharacterStates.find(c => c.id === attackerId);
        if (!attackerState) {
            throw new Error('El atacante no existe en esta batalla');
        }

        if (!attackerState.isAlive) {
            throw new Error('El atacante está derrotado y no puede atacar');
        }

        // Validar que el objetivo pertenezca al equipo contrario
        const targetState = battle.currentCharacterStates.find(c => c.id === targetId);
        if (!targetState) {
            throw new Error('El objetivo no existe en esta batalla');
        }

        if (!targetState.isAlive) {
            throw new Error('El objetivo ya está derrotado');
        }

        if (attackerState.teamId === targetState.teamId) {
            throw new Error('No puedes atacar a un miembro de tu propio equipo');
        }

        // Validar que sea el turno del equipo del atacante
        const attackerTeamId = attackerState.teamId;
        const expectedTeamId = battle.equipo1.id === attackerTeamId ? battle.equipo1.id : battle.equipo2.id;
        
        if (battle.currentTeamTurn === 1 && expectedTeamId !== battle.equipo1.id) {
            throw new Error('No es el turno del equipo del atacante');
        }
        if (battle.currentTeamTurn === 2 && expectedTeamId !== battle.equipo2.id) {
            throw new Error('No es el turno del equipo del atacante');
        }

        // Validar que el equipo tenga acciones restantes
        if (battle.remainingActions <= 0) {
            throw new Error('El equipo ya no tiene acciones restantes en este turno');
        }

        // Limitar a un ataque por personaje por turno
        if (battle.alreadyAttacked.includes(attackerId)) {
            throw new Error('Este personaje ya ha atacado en este turno');
        }

        // Obtener datos completos de los personajes
        const characters = await characterRepository.getCharacters();
        const attackerData = characters.find(c => c.id === attackerId);
        const targetData = characters.find(c => c.id === targetId);

        if (!attackerData || !targetData) {
            throw new Error('Error al obtener datos de los personajes');
        }

        // Crear instancias de personajes con estado actual
        const attacker = new Character(
            attackerData.id,
            attackerData.nombre,
            attackerData.alias,
            attackerData.tipo,
            attackerData.ciudad,
            attackerData.equipo,
            { ...attackerData.stats, health: attackerState.currentHealth }
        );

        const target = new Character(
            targetData.id,
            targetData.nombre,
            targetData.alias,
            targetData.tipo,
            targetData.ciudad,
            targetData.equipo,
            { ...targetData.stats, health: targetState.currentHealth }
        );

        // Ejecutar el ataque
        const attackResult = this.executeAttack(attacker, target, attackType);

        // Actualizar estados de los personajes
        attackerState.currentHealth = attacker.stats.health;
        attackerState.isAlive = attacker.isAlive();
        targetState.currentHealth = target.stats.health;
        targetState.isAlive = target.isAlive();

        // Crear el objeto de ataque para el log
        const attackLog = {
            attacker: attacker.alias,
            defender: target.alias,
            attackName: attackResult.attackName,
            attackDescription: attackResult.attackDescription,
            damage: attackResult.actualDamage,
            critical: attackResult.critical,
            miss: attackResult.miss,
            defenderHealth: target.stats.health,
            baseDamage: Math.round(attackResult.baseDamage),
            finalDamage: Math.round(attackResult.finalDamage),
            attackType: attackType
        };

        // Agregar el ataque al round actual o crear uno nuevo
        if (battle.rounds.length === 0) {
            // Crear nuevo round
            battle.rounds.push({
                round: battle.rounds.length + 1,
                attacks: [attackLog]
            });
            battle.currentRound = battle.rounds.length;
        } else {
            // Agregar al round actual
            battle.rounds[battle.rounds.length - 1].attacks.push(attackLog);
        }

        // Agregar el atacante a la lista de los que ya atacaron
        battle.alreadyAttacked.push(attackerId);

        // Reducir acciones restantes
        battle.remainingActions--;

        // Cambiar turno solo si se agotaron las acciones
        if (battle.remainingActions <= 0) {
            battle.currentTeamTurn = battle.currentTeamTurn === 1 ? 2 : 1;
            battle.currentTurn++;
            // Limpiar lista de atacantes del turno
            battle.alreadyAttacked = [];
            // Calcular acciones restantes para el siguiente equipo
            const nextTeamId = battle.currentTeamTurn === 1 ? battle.equipo1.id : battle.equipo2.id;
            const nextTeamAliveCount = battle.currentCharacterStates.filter(c => 
                c.teamId === nextTeamId && c.isAlive
            ).length;
            battle.remainingActions = Math.max(1, nextTeamAliveCount); // Mínimo 1 acción
        }

        // Verificar si la batalla ha terminado
        const team1Alive = battle.currentCharacterStates.filter(c => c.teamId === battle.equipo1.id && c.isAlive).length;
        const team2Alive = battle.currentCharacterStates.filter(c => c.teamId === battle.equipo2.id && c.isAlive).length;

        if (team1Alive === 0 || team2Alive === 0) {
            battle.isFinished = true;
            battle.battleStatus = 'finished';
            battle.endTime = new Date();
            
            if (team1Alive === 0 && team2Alive === 0) {
                battle.winner = 'Empate';
                battle.loser = 'Empate';
            } else if (team1Alive === 0) {
                battle.winner = battle.equipo2.nombre;
                battle.loser = battle.equipo1.nombre;
            } else {
                battle.winner = battle.equipo1.nombre;
                battle.loser = battle.equipo2.nombre;
            }
        }

        await battle.save();

        return {
            attackResult,
            battleState: {
                currentTurn: battle.currentTurn,
                currentTeamTurn: battle.currentTeamTurn,
                characterStates: battle.currentCharacterStates,
                isFinished: battle.isFinished,
                winner: battle.winner,
                loser: battle.loser
            },
            attackLog
        };
    }

    /**
     * Ejecuta un ataque entre dos personajes
     */
    executeAttack(attacker, target, attackType) {
        let attack;
        let baseDamage;
        let attackName;
        let attackDescription;

        if (attackType === 'especial') {
            // Usar ataque especial
            const specialAttacks = attacker.specialAttacks;
            attack = specialAttacks[Math.floor(Math.random() * specialAttacks.length)];
            baseDamage = attacker.stats.attack * attack.damage;
            attackName = attack.name;
            attackDescription = attack.description;
        } else {
            // Usar ataque normal
            attack = attacker.getRandomAttack();
            baseDamage = attack.baseDamage * attack.damage;
            attackName = attack.name;
            attackDescription = attack.description;
        }

        // Calcular probabilidades
        const miss = Math.random() < 0.1; // 10% de probabilidad de fallar
        const critical = Math.random() < 0.15; // 15% de probabilidad de crítico

        let finalDamage = 0;
        let actualDamage = 0;

        if (!miss) {
            finalDamage = critical ? baseDamage * 2 : baseDamage;
            actualDamage = target.takeDamage(finalDamage);
        }

        return {
            attackName,
            attackDescription,
            baseDamage,
            finalDamage,
            actualDamage,
            critical,
            miss
        };
    }

    /**
     * Obtiene el estado actual de una batalla
     */
    async getBattleState(battleId, userId) {
        const battle = await Battle.findOne({ _id: battleId, userId });
        if (!battle) {
            throw new Error('Batalla no encontrada');
        }

        return {
            id: battle._id,
            type: battle.type,
            equipo1: battle.equipo1,
            equipo2: battle.equipo2,
            currentTurn: battle.currentTurn,
            currentTeamTurn: battle.currentTeamTurn,
            remainingActions: battle.remainingActions,
            currentRound: battle.currentRound,
            characterStates: battle.currentCharacterStates,
            rounds: battle.rounds,
            isFinished: battle.isFinished,
            battleStatus: battle.battleStatus,
            winner: battle.winner,
            loser: battle.loser,
            startTime: battle.startTime,
            endTime: battle.endTime
        };
    }
}

// Función auxiliar para asegurar ataque válido
function ataqueSeguro(ataque, baseDamage) {
    if (!ataque || typeof ataque !== 'object') {
        return { name: 'Ataque Básico', damage: 1, description: 'Ataque por defecto', baseDamage };
    }
    return {
        ...ataque,
        baseDamage: (typeof ataque.baseDamage === 'number' && !isNaN(ataque.baseDamage)) ? ataque.baseDamage : baseDamage
    };
}

export default new BattleService(); 