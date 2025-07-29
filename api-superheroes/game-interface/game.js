/**
 * Superhéroes Battle - Lógica del Juego
 * Interactúa con la API: https://pelea.onrender.com/api
 */

class SuperheroesBattle {
    constructor() {
        this.API_BASE_URL = 'https://pelea.onrender.com/api';
        this.authToken = '';
        this.currentBattleId = '';
        this.selectedCharacter = null;
        this.availableCharacters = [];
        this.currentBattleState = null;
        this.isPlayerTurn = true;

        // Elementos del DOM
        this.elements = {
            startScreen: document.getElementById('startScreen'),
            selectionScreen: document.getElementById('selectionScreen'),
            battleScreen: document.getElementById('battleScreen'),
            startBtn: document.getElementById('startBtn'),
            startBattleBtn: document.getElementById('startBattleBtn'),
            charactersGrid: document.getElementById('charactersGrid'),
            attackBtn: document.getElementById('attackBtn'),
            battleLog: document.getElementById('battleLog'),
            turnIndicator: document.getElementById('turnIndicator'),
            playerName: document.getElementById('playerName'),
            enemyName: document.getElementById('enemyName'),
            playerHealth: document.getElementById('playerHealth'),
            enemyHealth: document.getElementById('enemyHealth'),
            playerHealthText: document.getElementById('playerHealthText'),
            enemyHealthText: document.getElementById('enemyHealthText'),
            movesGrid: document.getElementById('movesGrid')
        };

        this.initializeEventListeners();
        this.addLogEntry('🎮 Juego iniciado. Presiona "Comenzar Juego" para empezar.', 'info');
    }

    // Inicializar event listeners
    initializeEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.startBattleBtn.addEventListener('click', () => this.startBattle());
        this.elements.attackBtn.addEventListener('click', () => this.performAttack());

        // Event listeners para movimientos
        document.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMove(e.target));
        });
    }

    // Función para hacer llamadas a la API
    async apiCall(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Solo enviar token si existe y no es un endpoint público
            if (this.authToken && !endpoint.includes('/public')) {
                options.headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.API_BASE_URL}${endpoint}`, options);
            const data = await response.text();

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${data}`);
            }

            return JSON.parse(data);
        } catch (error) {
            console.error('Error en API call:', error);
            this.addLogEntry(`Error: ${error.message}`, 'error');
            throw error;
        }
    }

    // Función para agregar entradas al log
    addLogEntry(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.elements.battleLog.appendChild(logEntry);
        this.elements.battleLog.scrollTop = this.elements.battleLog.scrollHeight;
    }

    // Función para iniciar el juego
    async startGame() {
        try {
            this.elements.startBtn.disabled = true;
            this.elements.startBtn.textContent = '🔄 Conectando...';

            // Cargar personajes directamente (sin autenticación)
            await this.loadCharacters();
            
            // Mostrar pantalla de selección
            this.showScreen('selection');
            
            this.addLogEntry('✅ Conectado exitosamente a la API', 'info');
        } catch (error) {
            this.addLogEntry(`Error al iniciar: ${error.message}`, 'error');
            this.elements.startBtn.disabled = false;
            this.elements.startBtn.textContent = '🚀 Comenzar Juego';
        }
    }

    // Función para cargar personajes
    async loadCharacters() {
        try {
            this.addLogEntry('🔄 Cargando personajes desde la API...', 'info');
            
            const characters = await this.apiCall('/personajes/public');
            
            if (!characters || characters.length === 0) {
                throw new Error('No se encontraron personajes en la API');
            }
            
            this.availableCharacters = characters;
            
            // Limpiar grid
            this.elements.charactersGrid.innerHTML = '';
            
            // Crear tarjetas de personajes
            characters.forEach(character => {
                const card = this.createCharacterCard(character);
                this.elements.charactersGrid.appendChild(card);
            });
            
            this.addLogEntry(`✅ Cargados ${characters.length} personajes exitosamente`, 'info');
        } catch (error) {
            this.addLogEntry(`❌ Error cargando personajes: ${error.message}`, 'error');
            this.elements.charactersGrid.innerHTML = `
                <div class="loading">
                    <p>❌ Error cargando personajes</p>
                    <p>Detalles: ${error.message}</p>
                    <button onclick="window.game.loadCharacters()" class="btn">🔄 Reintentar</button>
                </div>
            `;
        }
    }

    // Crear tarjeta de personaje
    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <h3>${character.alias}</h3>
            <p><strong>${character.nombre}</strong></p>
            <p>Tipo: ${character.tipo}</p>
            <div class="character-stats">
                <div class="stat">❤️ ${character.stats.health} HP</div>
                <div class="stat">⚔️ ${character.stats.attack} ATK</div>
                <div class="stat">🛡️ ${character.stats.defense} DEF</div>
                <div class="stat">⚡ ${character.stats.speed} SPD</div>
            </div>
        `;
        
        card.addEventListener('click', () => this.selectCharacter(character, card));
        return card;
    }

    // Función para seleccionar personaje
    selectCharacter(character, card) {
        // Remover selección anterior
        document.querySelectorAll('.character-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Seleccionar nueva tarjeta
        card.classList.add('selected');
        
        this.selectedCharacter = character;
        this.elements.startBattleBtn.disabled = false;
        
        this.addLogEntry(`✅ Seleccionado: ${character.alias}`, 'info');
    }

    // Función para iniciar batalla
    async startBattle() {
        if (!this.selectedCharacter) {
            this.addLogEntry('❌ Debes seleccionar un personaje', 'error');
            return;
        }

        try {
            this.elements.startBattleBtn.disabled = true;
            this.elements.startBattleBtn.textContent = '🔄 Creando batalla...';

            // Crear batalla 1v1 con personaje seleccionado
            const battleData = await this.apiCall('/battles/1v1', 'POST', {
                char1Id: this.selectedCharacter.id,
                char2Id: this.getRandomEnemyId()
            });

            if (battleData.battleId) {
                this.currentBattleId = battleData.battleId;
                this.addLogEntry(`⚔️ Batalla creada: ${battleData.battleId}`, 'info');
                
                // Mostrar pantalla de batalla
                this.showScreen('battle');
                
                // Cargar estado inicial de la batalla
                await this.loadBattleState();
            }
        } catch (error) {
            this.addLogEntry(`Error creando batalla: ${error.message}`, 'error');
            this.elements.startBattleBtn.disabled = false;
            this.elements.startBattleBtn.textContent = '⚔️ Iniciar Batalla';
        }
    }

    // Función para obtener ID de enemigo aleatorio
    getRandomEnemyId() {
        const enemyCharacters = this.availableCharacters.filter(char => char.id !== this.selectedCharacter.id);
        const randomEnemy = enemyCharacters[Math.floor(Math.random() * enemyCharacters.length)];
        return randomEnemy ? randomEnemy.id : 1;
    }

    // Función para cargar estado de batalla
    async loadBattleState() {
        try {
            const battleState = await this.apiCall(`/battles/${this.currentBattleId}/state`);
            this.currentBattleState = battleState;
            
            this.updateBattleUI(battleState);
            this.addLogEntry('📊 Estado de batalla actualizado', 'info');
        } catch (error) {
            this.addLogEntry(`Error cargando estado: ${error.message}`, 'error');
        }
    }

    // Función para actualizar UI de batalla
    updateBattleUI(battleState) {
        // Actualizar personajes
        if (battleState.char1) {
            this.elements.playerName.textContent = battleState.char1.alias || 'Tu Personaje';
            this.updateHealthBar('player', battleState.char1.hp, battleState.char1.maxHp);
        }
        
        if (battleState.char2) {
            this.elements.enemyName.textContent = battleState.char2.alias || 'Enemigo';
            this.updateHealthBar('enemy', battleState.char2.hp, battleState.char2.maxHp);
        }

        // Actualizar indicador de turno
        if (battleState.turnoActual === 'jugador') {
            this.elements.turnIndicator.textContent = 'Tu turno';
            this.elements.attackBtn.disabled = false;
            this.isPlayerTurn = true;
        } else {
            this.elements.turnIndicator.textContent = 'Turno del enemigo';
            this.elements.attackBtn.disabled = true;
            this.isPlayerTurn = false;
        }

        // Verificar si la batalla terminó
        if (battleState.isFinished) {
            this.elements.attackBtn.disabled = true;
            this.elements.attackBtn.textContent = '🏆 Batalla Terminada';
            this.addLogEntry(`🏆 Batalla terminada! Ganador: ${battleState.winner || 'Desconocido'}`, 'info');
        }
    }

    // Función para actualizar barra de salud
    updateHealthBar(character, currentHealth, maxHealth) {
        const healthBar = document.getElementById(`${character}Health`);
        const healthText = document.getElementById(`${character}HealthText`);
        const percentage = (currentHealth / maxHealth) * 100;
        
        healthBar.style.width = `${percentage}%`;
        healthText.textContent = `${currentHealth} / ${maxHealth} HP`;
        
        // Agregar clases para efectos visuales
        healthBar.classList.remove('low', 'critical');
        if (percentage < 30) {
            healthBar.classList.add('low');
        }
        if (percentage < 10) {
            healthBar.classList.add('critical');
        }
    }

    // Función para seleccionar movimiento
    selectMove(button) {
        document.querySelectorAll('.move-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
    }

    // Función para realizar ataque
    async performAttack() {
        if (!this.currentBattleId) {
            this.addLogEntry('❌ No hay batalla activa', 'error');
            return;
        }

        if (!this.isPlayerTurn) {
            this.addLogEntry('❌ No es tu turno', 'error');
            return;
        }

        try {
            this.elements.attackBtn.disabled = true;
            this.elements.attackBtn.textContent = '🔄 Atacando...';

            // Obtener movimiento seleccionado
            const selectedMove = document.querySelector('.move-btn.selected') || 
                               document.querySelector('.move-btn[data-move="normal"]');
            const moveType = selectedMove.dataset.move;

            // Realizar ataque
            const attackData = await this.apiCall('/battles/action', 'POST', {
                battleId: this.currentBattleId,
                attackerId: this.selectedCharacter.id,
                attackType: moveType
            });

            // Mostrar resultado del ataque
            if (attackData.attackLog) {
                const log = attackData.attackLog;
                this.addLogEntry(`⚔️ ${log.attacker} usó ${log.attackName}`, 'attack');
                this.addLogEntry(`💥 Daño: ${log.damage} | HP restante: ${log.defenderHealth}`, 'damage');
            }

            // Actualizar estado de batalla
            await this.loadBattleState();

            // Verificar si la batalla terminó
            if (this.currentBattleState && this.currentBattleState.isFinished) {
                this.elements.attackBtn.textContent = '🏆 Batalla Terminada';
                this.addLogEntry(`🎉 ${this.currentBattleState.winner} es el ganador!`, 'info');
            } else {
                this.elements.attackBtn.textContent = '⚔️ Realizar Ataque';
                this.elements.attackBtn.disabled = false;
            }

        } catch (error) {
            this.addLogEntry(`Error en ataque: ${error.message}`, 'error');
            this.elements.attackBtn.textContent = '⚔️ Realizar Ataque';
            this.elements.attackBtn.disabled = false;
        }
    }

    // Función para mostrar pantallas
    showScreen(screenName) {
        // Ocultar todas las pantallas
        this.elements.startScreen.style.display = 'none';
        this.elements.selectionScreen.style.display = 'none';
        this.elements.battleScreen.style.display = 'none';

        // Mostrar pantalla específica
        switch (screenName) {
            case 'selection':
                this.elements.selectionScreen.style.display = 'block';
                this.elements.selectionScreen.classList.add('fade-in');
                break;
            case 'battle':
                this.elements.battleScreen.style.display = 'block';
                this.elements.battleScreen.classList.add('fade-in');
                break;
        }
    }

    // Función para reiniciar juego
    resetGame() {
        this.currentBattleId = '';
        this.selectedCharacter = null;
        this.currentBattleState = null;
        this.isPlayerTurn = true;

        // Limpiar log
        this.elements.battleLog.innerHTML = '';

        // Mostrar pantalla de inicio
        this.showScreen('start');
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.textContent = '🚀 Comenzar Juego';

        this.addLogEntry('🔄 Juego reiniciado', 'info');
    }

    // Función para obtener estadísticas del juego
    getGameStats() {
        return {
            charactersLoaded: this.availableCharacters.length,
            battleActive: !!this.currentBattleId,
            selectedCharacter: this.selectedCharacter?.alias || 'Ninguno',
            isPlayerTurn: this.isPlayerTurn
        };
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SuperheroesBattle();
});

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperheroesBattle;
} 