import Character from '../models/characterModel.js';
import Team from '../models/teamModel.js';
import Battle from '../models/battleModel.js';

class BattleService {
    async createBattle(char1Id, char2Id, userId) {
        const characters = await Character.find({ id: { $in: [parseInt(char1Id), parseInt(char2Id)] } });
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
        const equipo1 = await Team.findOne({ id: equipo1Id });
        const equipo2 = await Team.findOne({ id: equipo2Id });
        if (!equipo1 || !equipo2) throw new Error('Uno o ambos equipos no existen');
        if (!Array.isArray(equipo1.miembros) || !Array.isArray(equipo2.miembros) || equipo1.miembros.length !== 3 || equipo2.miembros.length !== 3) {
            throw new Error('Ambos equipos deben tener exactamente 3 miembros');
        }
        const personajes = await Character.find({ id: { $in: [...equipo1.miembros, ...equipo2.miembros] } });
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
        const equipo1 = await Team.findOne({ id: equipo1Id });
        const equipo2 = await Team.findOne({ id: equipo2Id });
        if (!equipo1 || !equipo2) throw new Error('Uno o ambos equipos no existen');
        if (!Array.isArray(equipo1.miembros) || !Array.isArray(equipo2.miembros) || equipo1.miembros.length !== 3 || equipo2.miembros.length !== 3) throw new Error('Ambos equipos deben tener exactamente 3 miembros');
        // Crear estados iniciales de los personajes con stats completos
        const personajes = await Character.find({ id: { $in: [...equipo1.miembros, ...equipo2.miembros] } });
        const characterStates = [];
        for (const charId of [...equipo1.miembros, ...equipo2.miembros]) {
            const char = personajes.find(c => c.id === charId);
            // Determinar el ID numérico del equipo al que pertenece el personaje
            const teamId = equipo1.miembros.includes(charId) ? equipo1.id : equipo2.id;
            characterStates.push({
                id: char.id,
                nombre: char.nombre,
                alias: char.alias,
                currentHealth: char.stats.health,
                maxHealth: char.stats.health,
                attack: char.stats.attack,
                defense: char.stats.defense,
                specialAttack: char.stats.specialAttack || char.stats.attack,
                specialDefense: char.stats.specialDefense || char.stats.defense,
                isAlive: true,
                teamId: teamId,
                attacks: char.attacks || []
            });
        }
        // Inicializar batalla con el primer personaje de cada equipo como activo
        const battleDoc = new Battle({
            userId,
            type: '3v3',
            equipo1: { id: equipo1Id, nombre: equipo1.nombre, miembros: equipo1.miembros },
            equipo2: { id: equipo2Id, nombre: equipo2.nombre, miembros: equipo2.miembros },
            currentCharacterStates: characterStates,
            activeIndex1: 0,
            activeIndex2: 0,
            active1: equipo1.miembros[0],
            active2: equipo2.miembros[0],
            turnoActual: 'jugador',
            isFinished: false,
            winner: '',
            logs: [],
            currentRound: 1,
            startTime: new Date(),
            battleStatus: 'active'
        });
        await battleDoc.save();
        return battleDoc;
    }

    /**
     * Ejecuta una acción de pelea en una batalla existente
     */
    async executeBattleAction(battleId, userId, { attackerId, attackType, targetId }) {
        const battle = await Battle.findById(battleId);
        if (!battle || battle.isFinished) throw new Error('Batalla no encontrada o ya finalizada');
        if (battle.turnoActual !== 'jugador') throw new Error('No es el turno del jugador');
        
        // Obtener el personaje atacante seleccionado manualmente
        const attackerChar = battle.currentCharacterStates.find(c => c.id === Number(attackerId) && c.isAlive);
        if (!attackerChar) throw new Error('El atacante seleccionado no existe o está derrotado');
        
        // Verificar que el atacante pertenece al equipo del jugador (equipo1)
        if (attackerChar.teamId !== battle.equipo1.id) throw new Error('Solo puedes atacar con personajes de tu equipo');
        
        // Permitir seleccionar objetivo
        let targetCharId = targetId ? Number(targetId) : battle.active2;
        const targetChar = battle.currentCharacterStates.find(c => c.id === targetCharId && c.isAlive);
        if (!targetChar) throw new Error('El objetivo seleccionado no existe o está derrotado');
        
        // Verificar que el objetivo pertenece al equipo enemigo (equipo2)
        if (targetChar.teamId !== battle.equipo2.id) throw new Error('Solo puedes atacar a personajes del equipo enemigo');
        // --- ATAQUE DEL JUGADOR ---
        let ataqueJugador, mitigacionJugador, hpRestanteEnemigo, mensajeJugador, nombreAtaque = 'Ataque Básico', descAtaque = '';
        // Selección de ataque según tipo
        let ataqueIdx = 0;
        if (attackType === 'normal') ataqueIdx = 0;
        else if (attackType === 'especial') ataqueIdx = 1;
        else if (attackType === 'ultimate') ataqueIdx = 2;
        const ataque = attackerChar.attacks && attackerChar.attacks[ataqueIdx] ? attackerChar.attacks[ataqueIdx] : { name: 'Ataque Básico', damage: 1, description: '' };
        nombreAtaque = ataque.name || 'Ataque Básico';
        descAtaque = ataque.description || '';
        // Multiplicador de daño - VENTAJA PARA EL JUGADOR
        let multiplicador = ataque.damage || 1;
        // El jugador tiene un multiplicador adicional de 1.3x para hacer más daño
        multiplicador = multiplicador * 1.3;
        
        if (attackType === 'normal') {
            let dañoBase = attackerChar.attack * multiplicador;
            ataqueJugador = Math.max(1, Math.round(dañoBase - targetChar.defense));
            mitigacionJugador = targetChar.defense;
        } else if (attackType === 'especial') {
            let dañoBase = (attackerChar.specialAttack || attackerChar.attack) * multiplicador;
            ataqueJugador = Math.max(1, Math.round(dañoBase - (targetChar.specialDefense || targetChar.defense)));
            mitigacionJugador = targetChar.specialDefense || targetChar.defense;
        } else if (attackType === 'ultimate') {
            if (attackerChar.ultimateUsed) throw new Error('La ultimate solo puede usarse una vez por combate');
            let dañoBase = (attackerChar.specialAttack || attackerChar.attack) * 1.5 * multiplicador;
            ataqueJugador = Math.max(1, Math.round(dañoBase - (targetChar.specialDefense || targetChar.defense)));
            mitigacionJugador = targetChar.specialDefense || targetChar.defense;
            attackerChar.ultimateUsed = true;
        }
        targetChar.currentHealth = Math.max(0, targetChar.currentHealth - ataqueJugador);
        hpRestanteEnemigo = targetChar.currentHealth;
        mensajeJugador = `${attackerChar.nombre} usó ${nombreAtaque} (${attackType}). ${descAtaque ? descAtaque + ' ' : ''}Causó ${ataqueJugador} de daño (${mitigacionJugador} mitigado). ${targetChar.nombre} tiene ${hpRestanteEnemigo} HP restante.`;
        // Si el objetivo muere
        let objetivoDerrotado = false;
        if (targetChar.currentHealth <= 0) {
            targetChar.isAlive = false;
            objetivoDerrotado = true;
            // Si el objetivo era el activo enemigo, cambiar al siguiente
            if (targetChar.id === battle.active2) {
                const equipo2 = battle.equipo2.miembros;
                const siguiente = battle.currentCharacterStates.find(c => c.teamId === battle.equipo2.id && c.isAlive);
                if (siguiente) {
                    battle.active2 = siguiente.id;
                    battle.activeIndex2 = equipo2.indexOf(siguiente.id);
                } else {
                    battle.isFinished = true;
                    battle.winner = 'jugador';
                }
            }
            // Si el objetivo era reserva, solo se marca como derrotado (no cambia el activo)
        }
        // --- RESPUESTA DEL ENEMIGO (si sigue vivo) ---
        let mensajeEnemigo = '';
        if (!battle.isFinished) {
            const atacanteEnemigo = battle.currentCharacterStates.find(c => c.id === battle.active2 && c.isAlive);
            const objetivoJugador = battle.currentCharacterStates.find(c => c.id === battle.active1 && c.isAlive);
            // Decidir si usa ultimate
            let tipoAtaqueEnemigoIdx = 0;
            let tipoAtaqueEnemigo = 'normal';
            if (!atacanteEnemigo.ultimateUsed && atacanteEnemigo.currentHealth / atacanteEnemigo.maxHealth <= 0.2) {
                tipoAtaqueEnemigoIdx = 2;
                tipoAtaqueEnemigo = 'ultimate';
                atacanteEnemigo.ultimateUsed = true;
            } else {
                tipoAtaqueEnemigoIdx = Math.floor(Math.random() * 2); // 0 o 1
                tipoAtaqueEnemigo = tipoAtaqueEnemigoIdx === 0 ? 'normal' : 'especial';
            }
            const ataqueEnemigoObj = atacanteEnemigo.attacks && atacanteEnemigo.attacks[tipoAtaqueEnemigoIdx] ? atacanteEnemigo.attacks[tipoAtaqueEnemigoIdx] : { name: 'Ataque Básico', damage: 1, description: '' };
            let nombreAtaqueEnemigo = ataqueEnemigoObj.name || 'Ataque Básico';
            let descAtaqueEnemigo = ataqueEnemigoObj.description || '';
            let multiplicadorEnemigo = ataqueEnemigoObj.damage || 1;
            // El enemigo tiene un multiplicador reducido de 0.8x para hacer menos daño
            multiplicadorEnemigo = multiplicadorEnemigo * 0.8;
            
            let ataqueEnemigo, mitigacionEnemigo, hpRestanteJugador;
            if (tipoAtaqueEnemigo === 'normal') {
                let dañoBaseEnemigo = atacanteEnemigo.attack * multiplicadorEnemigo;
                ataqueEnemigo = Math.max(1, Math.round(dañoBaseEnemigo - objetivoJugador.defense));
                mitigacionEnemigo = objetivoJugador.defense;
            } else if (tipoAtaqueEnemigo === 'especial') {
                let dañoBaseEnemigo = (atacanteEnemigo.specialAttack || atacanteEnemigo.attack) * multiplicadorEnemigo;
                ataqueEnemigo = Math.max(1, Math.round(dañoBaseEnemigo - (objetivoJugador.specialDefense || objetivoJugador.defense)));
                mitigacionEnemigo = objetivoJugador.specialDefense || objetivoJugador.defense;
            } else if (tipoAtaqueEnemigo === 'ultimate') {
                let dañoBaseEnemigo = (atacanteEnemigo.specialAttack || atacanteEnemigo.attack) * 1.5 * multiplicadorEnemigo;
                ataqueEnemigo = Math.max(1, Math.round(dañoBaseEnemigo - (objetivoJugador.specialDefense || objetivoJugador.defense)));
                mitigacionEnemigo = objetivoJugador.specialDefense || objetivoJugador.defense;
            }
            objetivoJugador.currentHealth = Math.max(0, objetivoJugador.currentHealth - ataqueEnemigo);
            hpRestanteJugador = objetivoJugador.currentHealth;
            mensajeEnemigo = `${atacanteEnemigo.nombre} usó ${nombreAtaqueEnemigo} (${tipoAtaqueEnemigo}). ${descAtaqueEnemigo ? descAtaqueEnemigo + ' ' : ''}Causó ${ataqueEnemigo} de daño (${mitigacionEnemigo} mitigado). ${objetivoJugador.nombre} tiene ${hpRestanteJugador} HP restante.`;
            // Si el jugador muere, cambiar al siguiente
            if (objetivoJugador.currentHealth <= 0) {
                objetivoJugador.isAlive = false;
                // Buscar siguiente personaje vivo
                const equipo1 = battle.equipo1.miembros;
                const siguienteJ = battle.currentCharacterStates.find(c => c.teamId === battle.equipo1.id && c.isAlive);
                if (siguienteJ) {
                    battle.active1 = siguienteJ.id;
                    battle.activeIndex1 = equipo1.indexOf(siguienteJ.id);
                } else {
                    battle.isFinished = true;
                    battle.winner = 'enemigo';
                }
            }
        }
        // Actualizar turno
        battle.turnoActual = battle.isFinished ? null : 'jugador';
        // Guardar logs
        battle.logs.push(mensajeJugador);
        if (mensajeEnemigo) battle.logs.push(mensajeEnemigo);
        await battle.save();
        return {
            turnoJugador: mensajeJugador,
            turnoEnemigo: mensajeEnemigo,
            estadoCombate: battle.isFinished ? 'Finalizado' : 'En curso',
            siguienteTurno: battle.isFinished ? null : 'jugador',
            ganador: battle.isFinished ? battle.winner : null
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
            endTime: battle.endTime,
            // Agregar campos de personajes activos para 3v3
            active1: battle.active1,
            active2: battle.active2,
            activeIndex1: battle.activeIndex1,
            activeIndex2: battle.activeIndex2,
            turnoActual: battle.turnoActual
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