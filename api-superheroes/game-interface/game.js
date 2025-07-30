/**
 * Superhéroes Battle - Lógica del Juego con Autenticación y Batallas 3v3
 * Interactúa con la API: https://pelea.onrender.com/api
 */

class SuperheroesBattle {
    constructor() {
        this.API_BASE_URL = 'https://pelea.onrender.com/api';
        this.authToken = localStorage.getItem('authToken') || '';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.currentBattleId = '';
        this.selectedCharacter = null;
        this.selectedEnemy = null;
        this.selectedTeam = [];
        this.selectedEnemyTeam = [];
        this.availableCharacters = [];
        this.currentBattleState = null;
        this.isPlayerTurn = true;
        this.battleMode = '1v1'; // '1v1' o '3v3'
        this.battleRounds = []; // Array para almacenar los rounds
        this.isAutoPlaying = false; // Control para auto play
        this.battleStats = {}; // Estadísticas de la batalla
        this.currentTurn = 'player'; // 'player' o 'enemy'

        // Manual selection properties
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.isManualSelectionEnabled = false;

        // Elementos del DOM
        this.elements = {
            // Pantallas
            authScreen: document.getElementById('authScreen'),
            startScreen: document.getElementById('startScreen'),
            selectionScreen1v1: document.getElementById('selectionScreen1v1'),
            selectionScreen3v3: document.getElementById('selectionScreen3v3'),
            battleScreen: document.getElementById('battleScreen'),
            
            // Elementos de autenticación
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm'),
            loginFormElement: document.getElementById('loginFormElement'),
            registerFormElement: document.getElementById('registerFormElement'),
            messageContainer: document.getElementById('messageContainer'),
            userName: document.getElementById('userName'),
            logoutBtn: document.getElementById('logoutBtn'),
            
            // Elementos del juego
            startBtn1v1: document.getElementById('startBtn1v1'),
            startBtn3v3: document.getElementById('startBtn3v3'),
            startBattleBtn1v1: document.getElementById('startBattleBtn1v1'),
            startBattleBtn3v3: document.getElementById('startBattleBtn3v3'),
            clearSelection1v1: document.getElementById('clearSelection1v1'),
            clearSelection3v3: document.getElementById('clearSelection3v3'),
            charactersGrid1v1: document.getElementById('charactersGrid1v1'),
            charactersGrid3v3: document.getElementById('charactersGrid3v3'),
            selectedCharacter1v1: document.getElementById('selectedCharacter1v1'),
            selectedEnemy1v1: document.getElementById('selectedEnemy1v1'),
            selectedTeam: document.getElementById('selectedTeam'),
            selectedEnemyTeam: document.getElementById('selectedEnemyTeam'),
            playerTeam: document.getElementById('playerTeam'),
            enemyTeam: document.getElementById('enemyTeam'),
            currentTurnInfo: document.getElementById('currentTurnInfo'),
            switchTurnBtn: document.getElementById('switchTurnBtn'),
            attackBtn: document.getElementById('attackBtn'),
            battleLog: document.getElementById('battleLog'),
            turnIndicator: document.getElementById('turnIndicator'),
            movesGrid: document.getElementById('movesGrid'),
            simulateBattleBtn: document.getElementById('simulateBattleBtn'),
            backToSelectionBtn: document.getElementById('backToSelectionBtn'),
            nextRoundBtn: document.getElementById('nextRoundBtn'),
            autoPlayBtn: document.getElementById('autoPlayBtn'),
            newBattleBtn: document.getElementById('newBattleBtn'),
            backToMenuBtn: document.getElementById('backToMenuBtn'),
            battleResult: document.getElementById('battleResult'),
            battleStats: document.getElementById('battleStats'),
            roundsLog: document.getElementById('roundsLog')
        };

        // Manual selection elements
        this.manualSelectionElements = {
            selectedAttacker: document.getElementById('selectedAttacker'),
            selectedTarget: document.getElementById('selectedTarget')
        };

        // Verificar elementos críticos
        console.log('🔍 Verificando elementos del DOM...');
        const criticalElements = [
            'startBattleBtn1v1', 'startBattleBtn3v3', 
            'selectedCharacter1v1', 'selectedEnemy1v1',
            'selectedTeam', 'selectedEnemyTeam'
        ];
        
        criticalElements.forEach(elementName => {
            if (!this.elements[elementName]) {
                console.error(`❌ Elemento crítico no encontrado: ${elementName}`);
            } else {
                console.log(`✅ Elemento encontrado: ${elementName}`);
            }
        });

        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Event listeners de autenticación
        this.elements.loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.registerFormElement.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('showRegister').addEventListener('click', (e) => this.switchForm(e, 'register'));
        document.getElementById('showLogin').addEventListener('click', (e) => this.switchForm(e, 'login'));
        this.elements.logoutBtn.addEventListener('click', () => this.logout());

        // Event listeners del juego
        this.elements.startBtn1v1.addEventListener('click', () => {
            console.log('🎮 Botón 1v1 clickeado');
            this.startGame('1v1');
        });
        this.elements.startBtn3v3.addEventListener('click', () => {
            console.log('🎮 Botón 3v3 clickeado');
            this.startGame('3v3');
        });
        this.elements.startBattleBtn1v1.addEventListener('click', () => {
            console.log('⚔️ Botón Iniciar Batalla 1v1 clickeado');
            this.startBattle('1v1');
        });
        this.elements.startBattleBtn3v3.addEventListener('click', () => {
            console.log('⚔️ Botón Iniciar Batalla 3v3 clickeado');
            this.startBattle('3v3');
        });
        this.elements.clearSelection1v1.addEventListener('click', () => this.clearSelection1v1());
        this.elements.clearSelection3v3.addEventListener('click', () => this.clearSelection3v3());
        this.elements.attackBtn.addEventListener('click', () => this.performAttack());
        this.elements.simulateBattleBtn.addEventListener('click', () => this.simulateFullBattle());
        this.elements.backToSelectionBtn.addEventListener('click', () => this.backToSelection());
        this.elements.nextRoundBtn.addEventListener('click', () => this.nextRound());
        this.elements.autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
        this.elements.switchTurnBtn.addEventListener('click', () => this.switchTurn());
        this.elements.newBattleBtn.addEventListener('click', () => this.newBattle());
        this.elements.backToMenuBtn.addEventListener('click', () => this.backToMenu());

        // Event listeners para movimientos
        document.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMove(e.target));
        });

        // Event listeners para selección manual de atacante y objetivo
        this.initializeManualSelectionListeners();
    }

    // Inicializar event listeners para selección manual
    initializeManualSelectionListeners() {
        // Los event listeners se agregarán dinámicamente cuando se rendericen los personajes
        console.log('🎯 Inicializando event listeners para selección manual');
    }

    // Verificar estado de autenticación
    checkAuthStatus() {
        if (this.authToken && this.currentUser) {
            this.showScreen('start');
            this.updateUserInfo();
        } else {
            this.showScreen('auth');
        }
    }

    // Cambiar entre formularios de login y registro
    switchForm(e, formType) {
        e.preventDefault();
        if (formType === 'register') {
            this.elements.loginForm.classList.remove('active');
            this.elements.registerForm.classList.add('active');
        } else {
            this.elements.registerForm.classList.remove('active');
            this.elements.loginForm.classList.add('active');
        }
        this.hideMessage();
    }

    // Manejar login
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const user = formData.get('user');
        const password = formData.get('password');

        try {
            this.showLoading(true);
            const response = await this.apiCall('/auth/login', 'POST', { user, password });
            
            this.authToken = response.token;
            this.currentUser = response.user;
            
            // Guardar en localStorage
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.showMessage('¡Inicio de sesión exitoso!', 'success');
            setTimeout(() => {
                this.showScreen('start');
                this.updateUserInfo();
            }, 1500);
            
        } catch (error) {
            this.showMessage(error.message || 'Error al iniciar sesión', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Manejar registro
    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const user = formData.get('user');
        const password = formData.get('password');
        const passwordConfirm = formData.get('passwordConfirm');
        const nombre = formData.get('nombre');

        // Validaciones
        if (password !== passwordConfirm) {
            this.showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            this.showLoading(true);
            await this.apiCall('/auth/register', 'POST', { user, password, nombre });
            
            this.showMessage('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
            setTimeout(() => {
                this.switchForm({ preventDefault: () => {} }, 'login');
            }, 1500);
            
        } catch (error) {
            this.showMessage(error.message || 'Error al registrar usuario', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Cerrar sesión
    logout() {
        this.authToken = '';
        this.currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.showScreen('auth');
        this.resetGame();
    }

    // Actualizar información del usuario
    updateUserInfo() {
        if (this.currentUser) {
            this.elements.userName.textContent = this.currentUser.nombre || this.currentUser.user;
        }
    }

    // Mostrar/ocultar loading
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.toggle('hidden', !show);
        }
    }

    // Mostrar mensaje
    showMessage(message, type = 'info') {
        this.elements.messageContainer.textContent = message;
        this.elements.messageContainer.className = `message-container show ${type}`;
    }

    // Ocultar mensaje
    hideMessage() {
        this.elements.messageContainer.classList.remove('show');
    }

    // Función para hacer llamadas a la API
    async apiCall(endpoint, method = 'GET', body = null) {
        try {
            const url = `${this.API_BASE_URL}${endpoint}`;
            console.log(`API Call: ${method} ${url}`);
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Solo enviar token si existe y no es un endpoint público
            if (this.authToken && !endpoint.includes('/auth')) {
                options.headers['Authorization'] = `Bearer ${this.authToken}`;
                console.log('Token enviado:', this.authToken.substring(0, 20) + '...');
            } else {
                console.log('Sin token de autenticación');
            }

            if (body) {
                options.body = JSON.stringify(body);
                console.log('Body enviado:', body);
            }

            console.log('Opciones de fetch:', options);
            const response = await fetch(url, options);
            console.log('Respuesta recibida:', response.status, response.statusText);
            
            const data = await response.text();
            console.log('Datos recibidos:', data);

            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = JSON.parse(data);
                    if (errorData.error && Array.isArray(errorData.error)) {
                        // Si es un array de errores, mostrar el primer error
                        errorMessage = errorData.error[0].msg || `Error: ${errorData.error[0].param}`;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    } else {
                        errorMessage = `HTTP ${response.status}: ${data}`;
                    }
                } catch (parseError) {
                    errorMessage = `HTTP ${response.status}: ${data}`;
                }
                throw new Error(errorMessage);
            }

            return JSON.parse(data);
        } catch (error) {
            console.error('Error en API call:', error);
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

    // Función para mostrar mensajes en la pantalla actual
    showGameMessage(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Si estamos en la pantalla de batalla, usar el log
        if (this.elements.battleScreen.style.display !== 'none') {
            this.addLogEntry(message, type);
        } else {
            // Para otras pantallas, mostrar un mensaje temporal
            this.showMessage(message, type);
        }
    }

    // Función para iniciar el juego
    async startGame(mode) {
        this.battleMode = mode;
        
        try {
            if (mode === '1v1') {
                this.elements.startBtn1v1.disabled = true;
                this.elements.startBtn1v1.textContent = '🔄 Conectando...';
            } else {
                this.elements.startBtn3v3.disabled = true;
                this.elements.startBtn3v3.textContent = '🔄 Conectando...';
            }

            // Cargar personajes solo si no están cargados
            if (!this.availableCharacters || this.availableCharacters.length === 0) {
                console.log(`Cargando personajes para modo ${mode}...`);
                await this.loadCharacters();
            } else {
                console.log(`Personajes ya cargados (${this.availableCharacters.length}), saltando carga...`);
            }
            
            // Limpiar selecciones previas
            if (mode === '1v1') {
                this.selectedCharacter = null;
                this.selectedEnemy = null;
                this.clearSelection1v1();
            } else {
                this.selectedTeam = [];
                this.selectedEnemyTeam = [];
                this.clearSelection3v3();
            }
            
            // Mostrar pantalla de selección específica y ocultar la otra
            if (mode === '1v1') {
                this.showScreen('selection1v1');
                // Asegurar que la pantalla 3v3 esté oculta
                if (this.elements.selectionScreen3v3) {
                    this.elements.selectionScreen3v3.style.display = 'none';
                }
            } else {
                this.showScreen('selection3v3');
                // Asegurar que la pantalla 1v1 esté oculta
                if (this.elements.selectionScreen1v1) {
                    this.elements.selectionScreen1v1.style.display = 'none';
                }
            }
            
            // Renderizar personajes
            this.renderCharacters();
            
            // Inicializar estado de botones
            this.updateBattleButtonState();
            
            console.log(`✅ Pantalla de selección ${mode} cargada exitosamente`);
            console.log(`🔒 Pantalla de selección ${mode === '1v1' ? '3v3' : '1v1'} oculta`);
            
            // Verificar estado de visibilidad después del cambio
            this.checkScreenVisibility();
            
        } catch (error) {
            console.error('Error en startGame:', error);
            this.showGameMessage(`Error al cargar el juego: ${error.message}`, 'error');
            
            // Restaurar botones en caso de error
            if (mode === '1v1') {
                this.elements.startBtn1v1.disabled = false;
                this.elements.startBtn1v1.textContent = '⚔️ Batalla 1v1';
            } else {
                this.elements.startBtn3v3.disabled = false;
                this.elements.startBtn3v3.textContent = '⚔️⚔️⚔️ Batalla 3v3';
            }
        }
    }

    // Cargar personajes disponibles
    async loadCharacters() {
        try {
            console.log('Haciendo llamada a /personajes/public...');
            const characters = await this.apiCall('/personajes/public');
            console.log('Personajes recibidos:', characters);
            
            if (!characters || !Array.isArray(characters)) {
                throw new Error('Formato de respuesta inválido');
            }
            
            this.availableCharacters = characters;
            this.renderCharacters();
            console.log(`Cargados ${characters.length} personajes`);
        } catch (error) {
            console.error('Error en loadCharacters:', error);
            throw new Error(`No se pudieron cargar los personajes: ${error.message}`);
        }
    }

    // Renderizar personajes en la grilla
    renderCharacters() {
        console.log('Renderizando personajes...');
        
        // Renderizar para 1v1
        this.elements.charactersGrid1v1.innerHTML = '';
        this.availableCharacters.forEach(character => {
            const card = this.createCharacterCard(character, '1v1');
            this.elements.charactersGrid1v1.appendChild(card);
        });

        // Renderizar para 3v3
        this.elements.charactersGrid3v3.innerHTML = '';
        this.availableCharacters.forEach(character => {
            const card = this.createCharacterCard(character, '3v3');
            this.elements.charactersGrid3v3.appendChild(card);
        });
        
        console.log(`Personajes renderizados: ${this.availableCharacters.length} para cada modo`);
    }

    // Crear tarjeta de personaje
    createCharacterCard(character, mode) {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        // Determinar el color del tipo de personaje
        const typeColors = {
            'heroe': '#4299e1',
            'villano': '#f56565',
            'antiheroe': '#ed8936',
            'neutral': '#718096'
        };
        
        const typeColor = typeColors[character.tipo?.toLowerCase()] || '#4299e1';
        
        card.innerHTML = `
            <div class="character-header">
                <h3>${character.alias || character.nombre}</h3>
                <div class="character-type" style="background: linear-gradient(135deg, ${typeColor}, ${typeColor}dd);">
                    ${character.tipo?.toUpperCase() || 'HEROE'}
                </div>
            </div>
            <div class="character-info">
                <p class="character-name"><strong>${character.nombre}</strong></p>
                <p class="character-description">${character.descripcion || 'Un valiente luchador en busca de la victoria.'}</p>
            </div>
            <div class="character-stats">
                <div class="stat">
                    <span class="stat-icon">❤️</span>
                    <span class="stat-value">${character.stats.health}</span>
                    <span class="stat-label">HP</span>
                </div>
                <div class="stat">
                    <span class="stat-icon">⚔️</span>
                    <span class="stat-value">${character.stats.attack}</span>
                    <span class="stat-label">ATK</span>
                </div>
                <div class="stat">
                    <span class="stat-icon">🛡️</span>
                    <span class="stat-value">${character.stats.defense}</span>
                    <span class="stat-label">DEF</span>
                </div>
                <div class="stat">
                    <span class="stat-icon">⚡</span>
                    <span class="stat-value">${character.stats.speed}</span>
                    <span class="stat-label">SPD</span>
                </div>
            </div>
            <div class="character-power">
                <div class="power-bar">
                    <div class="power-fill" style="width: ${(character.stats.attack + character.stats.defense + character.stats.speed) / 3}%"></div>
                </div>
                <span class="power-text">Poder: ${Math.round((character.stats.attack + character.stats.defense + character.stats.speed) / 3)}</span>
            </div>
        `;
        
        if (mode === '1v1') {
            card.addEventListener('click', () => this.selectCharacter1v1(character, card));
        } else {
            card.addEventListener('click', () => this.addToTeam3v3(character, card));
        }
        
        return card;
    }

    // Seleccionar personaje 1v1 (jugador o enemigo)
    selectCharacter1v1(character, card) {
        // Verificar si el personaje ya está seleccionado
        if (this.selectedCharacter && this.selectedCharacter.id === character.id) {
            this.showGameMessage('❌ Este personaje ya está seleccionado para tu equipo', 'error');
            return;
        }
        
        if (this.selectedEnemy && this.selectedEnemy.id === character.id) {
            this.showGameMessage('❌ Este personaje ya está seleccionado para el equipo enemigo', 'error');
            return;
        }

        // Determinar si es para jugador o enemigo basado en qué slot está vacío
        if (!this.selectedCharacter) {
            this.selectedCharacter = character;
            this.updateCharacterDisplay1v1('player', character);
            this.showGameMessage(`🎯 ${character.alias || character.nombre} seleccionado para tu equipo`, 'info');
        } else if (!this.selectedEnemy) {
            this.selectedEnemy = character;
            this.updateCharacterDisplay1v1('enemy', character);
            this.showGameMessage(`👹 ${character.alias || character.nombre} seleccionado para el equipo enemigo`, 'info');
        } else {
            this.showGameMessage('❌ Ambos personajes ya están seleccionados', 'error');
            return;
        }

        // Verificar y actualizar estado de botones
        this.updateBattleButtonState();
    }

    // Actualizar visualización de personaje 1v1
    updateCharacterDisplay1v1(team, character) {
        const slot = team === 'player' ? 
            this.elements.selectedCharacter1v1.querySelector('.character-slot') :
            this.elements.selectedEnemy1v1.querySelector('.character-slot');
        
        slot.className = 'character-slot filled';
        slot.innerHTML = `
            <div class="character-info">
                <h4>${character.alias || character.nombre}</h4>
                <div class="stats">
                    ❤️${character.stats.health} ⚔️${character.stats.attack} 🛡️${character.stats.defense}
                </div>
            </div>
        `;
        
        slot.addEventListener('click', () => this.removeCharacter1v1(team));
    }

    // Remover personaje 1v1
    removeCharacter1v1(team) {
        if (team === 'player') {
            this.selectedCharacter = null;
            this.elements.selectedCharacter1v1.querySelector('.character-slot').className = 'character-slot empty';
            this.elements.selectedCharacter1v1.querySelector('.character-slot').textContent = 'Selecciona tu personaje';
        } else {
            this.selectedEnemy = null;
            this.elements.selectedEnemy1v1.querySelector('.character-slot').className = 'character-slot empty';
            this.elements.selectedEnemy1v1.querySelector('.character-slot').textContent = 'Selecciona el enemigo';
        }
        
        // Verificar y actualizar estado de botones
        this.updateBattleButtonState();
        this.showGameMessage(`❌ Personaje removido del equipo ${team === 'player' ? 'jugador' : 'enemigo'}`, 'info');
    }

    // Agregar personaje al equipo 3v3 (jugador o enemigo)
    addToTeam3v3(character, card) {
        // Verificar si el personaje ya está en algún equipo
        const inPlayerTeam = this.selectedTeam.find(c => c.id === character.id);
        const inEnemyTeam = this.selectedEnemyTeam.find(c => c.id === character.id);
        
        if (inPlayerTeam) {
            this.showGameMessage('❌ Este personaje ya está en tu equipo', 'error');
            return;
        }
        
        if (inEnemyTeam) {
            this.showGameMessage('❌ Este personaje ya está en el equipo enemigo', 'error');
            return;
        }

        // Determinar a qué equipo agregar basado en cuál tiene espacio
        if (this.selectedTeam.length < 3) {
            this.selectedTeam.push(character);
            this.updateTeamDisplay('player');
            this.showGameMessage(`✅ ${character.alias || character.nombre} agregado a tu equipo (${this.selectedTeam.length}/3)`, 'info');
        } else if (this.selectedEnemyTeam.length < 3) {
            this.selectedEnemyTeam.push(character);
            this.updateTeamDisplay('enemy');
            this.showGameMessage(`👹 ${character.alias || character.nombre} agregado al equipo enemigo (${this.selectedEnemyTeam.length}/3)`, 'info');
        } else {
            this.showGameMessage('❌ Ambos equipos están completos', 'error');
            return;
        }

        // Verificar y actualizar estado de botones
        this.updateBattleButtonState();
    }

    // Verificar y actualizar estado de botones de batalla
    updateBattleButtonState() {
        // Para 1v1
        if (this.selectedCharacter && this.selectedEnemy) {
            this.elements.startBattleBtn1v1.disabled = false;
            this.elements.startBattleBtn1v1.textContent = '⚔️ Iniciar Batalla 1v1';
        } else {
            this.elements.startBattleBtn1v1.disabled = true;
            this.elements.startBattleBtn1v1.textContent = '⚔️ Iniciar Batalla 1v1';
        }

        // Para 3v3
        if (this.selectedTeam.length === 3 && this.selectedEnemyTeam.length === 3) {
            this.elements.startBattleBtn3v3.disabled = false;
            this.elements.startBattleBtn3v3.textContent = '⚔️⚔️⚔️ Iniciar Batalla 3v3';
        } else {
            this.elements.startBattleBtn3v3.disabled = true;
            this.elements.startBattleBtn3v3.textContent = '⚔️⚔️⚔️ Iniciar Batalla 3v3';
        }
    }

    // Actualizar visualización del equipo
    // Actualizar visualización del equipo
    updateTeamDisplay(team) {
        const container = team === 'player' ? this.elements.selectedTeam : this.elements.selectedEnemyTeam;
        const teamArray = team === 'player' ? this.selectedTeam : this.selectedEnemyTeam;
        const teamName = team === 'player' ? 'Tu Equipo' : 'Equipo Enemigo';
        
        container.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const slot = document.createElement('div');
            slot.className = 'team-slot empty';
            slot.textContent = `Slot ${i + 1}`;
            
            if (teamArray[i]) {
                const character = teamArray[i];
                slot.className = 'team-slot filled';
                slot.innerHTML = `
                    <div class="character-info">
                        <h4>${character.alias || character.nombre}</h4>
                        <div class="stats">
                            ❤️${character.stats.health} ⚔️${character.stats.attack} 🛡️${character.stats.defense}
                        </div>
                    </div>
                `;
                slot.addEventListener('click', () => this.removeFromTeam(team, i));
            }
            
            container.appendChild(slot);
        }
        
        // Actualizar contador en el título
        const title = team === 'player' ? 
            document.querySelector('#selectionScreen3v3 .team-section h3') :
            document.querySelector('#selectionScreen3v3 .team-section:nth-child(2) h3');
        title.textContent = `${team === 'player' ? '🎯 Tu Equipo' : '👹 Equipo Enemigo'} (${teamArray.length}/3)`;
    }

    // Remover personaje del equipo
    removeFromTeam(team, index) {
        const teamArray = team === 'player' ? this.selectedTeam : this.selectedEnemyTeam;
        const removedCharacter = teamArray[index];
        
        teamArray.splice(index, 1);
        this.updateTeamDisplay(team);
        
        // Verificar y actualizar estado de botones
        this.updateBattleButtonState();
        this.showGameMessage(`❌ ${removedCharacter.alias || removedCharacter.nombre} removido del ${team === 'player' ? 'tu equipo' : 'equipo enemigo'}`, 'info');
    }

    // Limpiar selección 1v1
    clearSelection1v1() {
        this.selectedCharacter = null;
        this.selectedEnemy = null;
        
        this.elements.selectedCharacter1v1.querySelector('.character-slot').className = 'character-slot empty';
        this.elements.selectedCharacter1v1.querySelector('.character-slot').textContent = 'Selecciona tu personaje';
        
        this.elements.selectedEnemy1v1.querySelector('.character-slot').className = 'character-slot empty';
        this.elements.selectedEnemy1v1.querySelector('.character-slot').textContent = 'Selecciona el enemigo';
        
        // Verificar y actualizar estado de botones
        this.updateBattleButtonState();
        this.showGameMessage('🔄 Selección 1v1 limpiada', 'info');
    }

    // Limpiar selección 3v3
    clearSelection3v3() {
        this.selectedTeam = [];
        this.selectedEnemyTeam = [];
        
        this.updateTeamDisplay('player');
        this.updateTeamDisplay('enemy');
        
        // Verificar y actualizar estado de botones
        this.updateBattleButtonState();
        this.showGameMessage('🔄 Selección 3v3 limpiada', 'info');
    }

    // Iniciar batalla
    async startBattle(mode) {
        console.log('=== INICIANDO BATALLA ===');
        console.log('Modo:', mode);
        console.log('Personajes seleccionados 1v1:', {
            player: this.selectedCharacter,
            enemy: this.selectedEnemy
        });
        console.log('Equipos seleccionados 3v3:', {
            playerTeam: this.selectedTeam,
            enemyTeam: this.selectedEnemyTeam
        });

        // Resetear selección manual al iniciar nueva batalla
        this.disableManualSelection();

        if (mode === '1v1' && (!this.selectedCharacter || !this.selectedEnemy)) {
            console.log('❌ Validación 1v1 falló');
            this.showGameMessage('❌ Debes seleccionar ambos personajes (jugador y enemigo)', 'error');
            return;
        }

        if (mode === '3v3' && (this.selectedTeam.length !== 3 || this.selectedEnemyTeam.length !== 3)) {
            console.log('❌ Validación 3v3 falló');
            this.showGameMessage('❌ Debes seleccionar exactamente 3 personajes para cada equipo', 'error');
            return;
        }

        console.log('✅ Validaciones pasadas, iniciando batalla...');

        try {
            if (mode === '1v1') {
                console.log('Configurando botón 1v1...');
                this.elements.startBattleBtn1v1.disabled = true;
                this.elements.startBattleBtn1v1.textContent = '🔄 Iniciando batalla...';
            } else {
                console.log('Configurando botón 3v3...');
                this.elements.startBattleBtn3v3.disabled = true;
                this.elements.startBattleBtn3v3.textContent = '🔄 Iniciando batalla...';
            }

            let battleData;
            if (mode === '1v1') {
                console.log('Personaje seleccionado:', this.selectedCharacter);
                console.log('Enemigo seleccionado:', this.selectedEnemy);
                
                const battlePayload = {
                    char1Id: parseInt(this.selectedCharacter.id),
                    char2Id: parseInt(this.selectedEnemy.id)
                };
                console.log('Creando batalla 1v1 con:', battlePayload);
                console.log('Tipos de datos - char1Id:', typeof battlePayload.char1Id, 'char2Id:', typeof battlePayload.char2Id);
                
                battleData = await this.apiCall('/battles/1v1', 'POST', battlePayload);
                console.log('Respuesta de batalla 1v1:', battleData);
            } else {
                // Para 3v3, primero crear los equipos y luego iniciar la batalla
                console.log('Creando equipos para batalla 3v3...');
                
                // Crear equipo del jugador
                const team1Payload = {
                    nombre: `Equipo Jugador ${Date.now()}`,
                    miembros: this.selectedTeam.map(c => parseInt(c.id))
                };
                const team1Response = await this.apiCall('/equipos', 'POST', team1Payload);
                console.log('Equipo 1 creado:', team1Response);
                
                // Crear equipo enemigo
                const team2Payload = {
                    nombre: `Equipo Enemigo ${Date.now()}`,
                    miembros: this.selectedEnemyTeam.map(c => parseInt(c.id))
                };
                const team2Response = await this.apiCall('/equipos', 'POST', team2Payload);
                console.log('Equipo 2 creado:', team2Response);
                
                // Iniciar batalla con los IDs de los equipos
                const battlePayload = {
                    equipo1Id: team1Response.id,
                    equipo2Id: team2Response.id
                };
                console.log('Iniciando batalla 3v3 con:', battlePayload);
                
                battleData = await this.apiCall('/battles/team-vs-team', 'POST', battlePayload);
                console.log('Respuesta de batalla 3v3:', battleData);
            }

            console.log('Battle ID obtenido:', battleData.id || battleData.battleId);
            this.currentBattleId = battleData.id || battleData.battleId;
            
            console.log('Mostrando pantalla de batalla...');
            this.showScreen('battle');
            this.showGameMessage(`⚔️ ¡Batalla ${mode} iniciada!`, 'info');
            
            console.log('Cargando estado de batalla...');
            await this.loadBattleState();

        } catch (error) {
            console.error('Error en startBattle:', error);
            this.showGameMessage(`Error al iniciar batalla: ${error.message}`, 'error');
            
            if (mode === '1v1') {
                this.elements.startBattleBtn1v1.disabled = false;
                this.elements.startBattleBtn1v1.textContent = '⚔️ Iniciar Batalla 1v1';
            } else {
                this.elements.startBattleBtn3v3.disabled = false;
                this.elements.startBattleBtn3v3.textContent = '⚔️⚔️⚔️ Iniciar Batalla 3v3';
            }
        }
    }

    // Obtener ID de enemigo aleatorio (1v1)
    getRandomEnemyId() {
        const enemies = this.availableCharacters.filter(char => char.id !== this.selectedCharacter.id);
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        return randomEnemy.id;
    }

    // Obtener equipo enemigo aleatorio (3v3)
    getRandomEnemyTeam() {
        const availableEnemies = this.availableCharacters.filter(char => 
            !this.selectedTeam.find(selected => selected.id === char.id)
        );
        
        const enemyTeam = [];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * availableEnemies.length);
            enemyTeam.push(availableEnemies[randomIndex].id);
            availableEnemies.splice(randomIndex, 1);
        }
        
        return enemyTeam;
    }

    // Cargar estado de la batalla
    async loadBattleState() {
        try {
            console.log('🔄 Cargando estado de batalla para ID:', this.currentBattleId);
            const response = await this.apiCall(`/battles/${this.currentBattleId}/state`);
            console.log('🔍 Respuesta completa del servidor:', response);
            console.log('🔍 Estado de batalla recibido:', response.battleState);
            this.currentBattleState = response.battleState;
            
            // Resetear selección manual al cargar nuevo estado
            this.disableManualSelection();
            
            console.log('🎨 Actualizando UI de batalla...');
            this.updateBattleUI(response.battleState);
            this.updateTurnInfo(); // Inicializar información del turno
            console.log('✅ Estado de batalla cargado y UI actualizada');
        } catch (error) {
            console.error('Error en loadBattleState:', error);
            this.showGameMessage(`Error al cargar estado de batalla: ${error.message}`, 'error');
        }
    }

    // Actualizar interfaz de batalla
    updateBattleUI(battleState) {
        console.log('🎨 Actualizando UI con estado:', battleState);
        console.log('🎮 Modo de batalla actual:', this.battleMode);
        
        if (this.battleMode === '1v1') {
            console.log('⚔️ Actualizando UI para batalla 1v1');
            this.update1v1BattleUI(battleState);
        } else {
            console.log('⚔️⚔️⚔️ Actualizando UI para batalla 3v3');
            this.update3v3BattleUI(battleState);
        }
    }

    // Helper para obtener datos combinados de personaje (catálogo + batalla)
    getMergedCharacterData(id, charStates) {
        console.log(`🔍 Buscando personaje con ID ${id} en availableCharacters y charStates`);
        const base = this.availableCharacters.find(c => c.id === id) || {};
        const battle = (charStates || []).find(c => c.id === id) || {};
        const merged = { ...base, ...battle };
        console.log(`📊 Datos del personaje ${id}:`, { base, battle, merged });
        return merged;
    }

    // Actualizar UI para batalla 1v1
    update1v1BattleUI(battleState) {
        console.log('🔄 Actualizando UI 1v1 con battleState:', battleState);
        const charStates = battleState.characterStates || battleState.currentCharacterStates || [];
        console.log('📊 Character states:', charStates);
        
        const hero1Id = (battleState.hero1 || battleState.char1)?.id;
        const hero2Id = (battleState.hero2 || battleState.char2)?.id;
        console.log('🎯 Hero IDs:', { hero1Id, hero2Id });
        
        const hero1 = this.getMergedCharacterData(hero1Id, charStates);
        const hero2 = this.getMergedCharacterData(hero2Id, charStates);
        console.log('👥 Heroes merged data:', { hero1, hero2 });

        this.elements.playerTeam.innerHTML = `
            <div class="team-member ${hero1.isAlive === false ? 'dead' : 'active'}">
                <h4>${hero1.alias || hero1.nombre}</h4>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${(hero1.currentHealth || hero1.hp || hero1.health) / (hero1.maxHp || hero1.maxHealth || 100) * 100}%"></div>
                </div>
                <div class="health-text">${hero1.currentHealth || hero1.hp || hero1.health} / ${hero1.maxHp || hero1.maxHealth || 100} HP</div>
                <div class="status">${hero1.isAlive === false ? 'Estado: Muerto' : 'Estado: Normal'}</div>
            </div>
        `;

        this.elements.enemyTeam.innerHTML = `
            <div class="team-member ${hero2.isAlive === false ? 'dead' : ''}">
                <h4>${hero2.alias || hero2.nombre}</h4>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${(hero2.currentHealth || hero2.hp || hero2.health) / (hero2.maxHp || hero2.maxHealth || 100) * 100}%"></div>
                </div>
                <div class="health-text">${hero2.currentHealth || hero2.hp || hero2.health} / ${hero2.maxHp || hero2.maxHealth || 100} HP</div>
                <div class="status">${hero2.isAlive === false ? 'Estado: Muerto' : 'Estado: Normal'}</div>
            </div>
        `;

        const isPlayerTurn = battleState.turnoActual === 'jugador' || battleState.currentTurn === 'player';
        this.elements.turnIndicator.textContent = isPlayerTurn ? 'Tu turno' : 'Turno del enemigo';
        this.elements.attackBtn.disabled = !isPlayerTurn;
        this.enableManualSelection();
        console.log('✅ UI 1v1 actualizada');
    }

    // Helper function para convertir IDs de personajes a objetos completos
    getCharacterById(characterId) {
        if (!this.availableCharacters || !Array.isArray(this.availableCharacters)) {
            console.warn('⚠️ availableCharacters no está disponible o no es un array');
            return null;
        }
        return this.availableCharacters.find(char => char.id === characterId);
    }

    // Helper function para convertir array de IDs a array de objetos de personajes
    getCharactersFromIds(characterIds) {
        if (!Array.isArray(characterIds)) {
            console.warn('⚠️ characterIds no es un array:', characterIds);
            return [];
        }
        
        if (!this.availableCharacters || !Array.isArray(this.availableCharacters)) {
            console.error('❌ availableCharacters no está disponible para buscar personajes');
            return [];
        }
        
        return characterIds.map(id => {
            const character = this.getCharacterById(id);
            if (!character) {
                console.warn(`⚠️ Personaje con ID ${id} no encontrado en el cache`);
                return null;
            }
            return character;
        }).filter(char => char !== null);
    }



    // Actualizar UI para batalla 3v3
    update3v3BattleUI(battleState) {
        console.log('🔄 Actualizando UI 3v3 con battleState:', battleState);
        const charStates = battleState.characterStates || battleState.currentCharacterStates || [];
        console.log('📊 Character states:', charStates);
        
        const team1Ids = battleState.equipo1?.miembros || battleState.team1 || battleState.heroes1 || [];
        const team2Ids = battleState.equipo2?.miembros || battleState.team2 || battleState.heroes2 || [];
        console.log('🎯 Team IDs:', { team1Ids, team2Ids });
        
        const team1 = team1Ids.map(id => this.getMergedCharacterData(id, charStates));
        const team2 = team2Ids.map(id => this.getMergedCharacterData(id, charStates));
        console.log('👥 Teams merged data:', { team1, team2 });

        this.elements.playerTeam.innerHTML = team1.map(hero => {
            const currentHp = hero.currentHealth || hero.hp || hero.health || 100;
            const maxHp = hero.maxHp || hero.maxHealth || 100;
            const isAlive = hero.isAlive !== false && currentHp > 0;
            return `
                <div class="team-member ${isAlive ? 'active' : 'dead'}">
                    <h4>${hero.alias || hero.nombre}</h4>
                    <div class="health-bar">
                        <div class="health-fill" style="width: ${(currentHp / maxHp) * 100}%"></div>
                    </div>
                    <div class="health-text">${currentHp} / ${maxHp} HP</div>
                    <div class="status">${isAlive ? 'Estado: Normal' : 'Estado: Muerto'}</div>
                </div>
            `;
        }).join('');

        this.elements.enemyTeam.innerHTML = team2.map(hero => {
            const currentHp = hero.currentHealth || hero.hp || hero.health || 100;
            const maxHp = hero.maxHp || hero.maxHealth || 100;
            const isAlive = hero.isAlive !== false && currentHp > 0;
            return `
                <div class="team-member ${isAlive ? '' : 'dead'}">
                    <h4>${hero.alias || hero.nombre}</h4>
                    <div class="health-bar">
                        <div class="health-fill" style="width: ${(currentHp / maxHp) * 100}%"></div>
                    </div>
                    <div class="health-text">${currentHp} / ${maxHp} HP</div>
                    <div class="status">${isAlive ? 'Estado: Normal' : 'Estado: Muerto'}</div>
                </div>
            `;
        }).join('');

        const isPlayerTurn = battleState.turnoActual === 'jugador' || battleState.currentTurn === 'player';
        this.elements.turnIndicator.textContent = isPlayerTurn ? 'Tu turno' : 'Turno del enemigo';
        this.elements.attackBtn.disabled = !isPlayerTurn;
        this.enableManualSelection();
        console.log('✅ UI 3v3 actualizada');
    }

    // Habilitar selección manual de atacante y objetivo
    enableManualSelection() {
        this.isManualSelectionEnabled = true;
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.updateManualSelectionDisplay();
        this.addManualSelectionListeners();
    }

    // Deshabilitar selección manual
    disableManualSelection() {
        this.isManualSelectionEnabled = false;
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.updateManualSelectionDisplay();
        this.removeManualSelectionListeners();
    }

    // Actualizar display de selección manual
    updateManualSelectionDisplay() {
        if (this.manualSelectionElements.selectedAttacker) {
            this.manualSelectionElements.selectedAttacker.textContent = 
                this.selectedAttacker ? this.selectedAttacker.alias || this.selectedAttacker.nombre : 'No seleccionado';
        }
        if (this.manualSelectionElements.selectedTarget) {
            this.manualSelectionElements.selectedTarget.textContent = 
                this.selectedTarget ? this.selectedTarget.alias || this.selectedTarget.nombre : 'No seleccionado';
        }
    }

    // Agregar event listeners para selección manual
    addManualSelectionListeners() {
        // Limpiar listeners anteriores
        this.removeManualSelectionListeners();

        if (this.battleMode === '1v1') {
            // Para 1v1, agregar listeners a los personajes únicos
            const playerMember = this.elements.playerTeam.querySelector('.team-member');
            const enemyMember = this.elements.enemyTeam.querySelector('.team-member');
            
            if (playerMember) {
                playerMember.classList.add('selectable');
                playerMember.addEventListener('click', () => this.selectAttacker(0));
            }
            
            if (enemyMember) {
                enemyMember.classList.add('selectable');
                enemyMember.addEventListener('click', () => this.selectTarget(0));
            }
        } else {
            // Para 3v3, agregar listeners a todos los miembros del equipo
            const playerMembers = this.elements.playerTeam.querySelectorAll('.team-member');
            playerMembers.forEach((member, index) => {
                member.classList.add('selectable');
                member.addEventListener('click', () => this.selectAttacker(index));
            });

            const enemyMembers = this.elements.enemyTeam.querySelectorAll('.team-member');
            enemyMembers.forEach((member, index) => {
                member.classList.add('selectable');
                member.addEventListener('click', () => this.selectTarget(index));
            });
        }
    }

    // Remover event listeners de selección manual
    removeManualSelectionListeners() {
        const allMembers = document.querySelectorAll('.team-member');
        allMembers.forEach(member => {
            member.classList.remove('selectable', 'selected-attacker', 'selected-target');
            // Clonar y reemplazar para remover todos los event listeners
            const newMember = member.cloneNode(true);
            member.parentNode.replaceChild(newMember, member);
        });
    }

    // Seleccionar atacante
    selectAttacker(index) {
        if (!this.isManualSelectionEnabled) return;

        let attackerId, attacker;

        if (this.battleMode === '1v1') {
            // Para 1v1, usar el personaje del jugador
            const hero1 = this.currentBattleState.hero1 || this.currentBattleState.char1;
            attackerId = hero1.id;
            attacker = hero1;
        } else {
            // Para 3v3, usar el índice del array de miembros
            const team1Ids = this.currentBattleState.equipo1?.miembros || [];
            attackerId = team1Ids[index];
            attacker = this.getCharacterById(attackerId);
        }

        if (!attacker) {
            console.error(`❌ No se pudo encontrar el atacante con ID ${attackerId}`);
            return;
        }

        // Verificar que el personaje esté vivo
        const currentHp = attacker.hp || attacker.health || 100;
        if (currentHp <= 0) {
            this.addLogEntry('❌ No puedes seleccionar un personaje muerto como atacante', 'error');
            return;
        }

        this.selectedAttacker = attacker;
        this.updateManualSelectionDisplay();
        this.updateSelectionVisuals();
        
        console.log(`🎯 Atacante seleccionado: ${attacker.alias || attacker.nombre}`);
        this.addLogEntry(`🎯 Atacante seleccionado: ${attacker.alias || attacker.nombre}`, 'info');
    }

    // Seleccionar objetivo
    selectTarget(index) {
        if (!this.isManualSelectionEnabled) return;

        let targetId, target;

        if (this.battleMode === '1v1') {
            // Para 1v1, usar el personaje enemigo
            const hero2 = this.currentBattleState.hero2 || this.currentBattleState.char2;
            targetId = hero2.id;
            target = hero2;
        } else {
            // Para 3v3, usar el índice del array de miembros
            const team2Ids = this.currentBattleState.equipo2?.miembros || [];
            targetId = team2Ids[index];
            target = this.getCharacterById(targetId);
        }

        if (!target) {
            console.error(`❌ No se pudo encontrar el objetivo con ID ${targetId}`);
            return;
        }

        // Verificar que el personaje esté vivo
        const currentHp = target.hp || target.health || 100;
        if (currentHp <= 0) {
            this.addLogEntry('❌ No puedes seleccionar un personaje muerto como objetivo', 'error');
            return;
        }

        this.selectedTarget = target;
        this.updateManualSelectionDisplay();
        this.updateSelectionVisuals();
        
        console.log(`🎯 Objetivo seleccionado: ${target.alias || target.nombre}`);
        this.addLogEntry(`🎯 Objetivo seleccionado: ${target.alias || target.nombre}`, 'info');
    }

    // Actualizar visuales de selección
    updateSelectionVisuals() {
        // Limpiar selecciones anteriores
        document.querySelectorAll('.team-member').forEach(member => {
            member.classList.remove('selected-attacker', 'selected-target');
        });

        if (this.battleMode === '1v1') {
            // Para 1v1, marcar directamente los personajes únicos
            if (this.selectedAttacker) {
                const playerMember = this.elements.playerTeam.querySelector('.team-member');
                if (playerMember) {
                    playerMember.classList.add('selected-attacker');
                }
            }
            
            if (this.selectedTarget) {
                const enemyMember = this.elements.enemyTeam.querySelector('.team-member');
                if (enemyMember) {
                    enemyMember.classList.add('selected-target');
                }
            }
        } else {
            // Para 3v3, usar el sistema de índices
            // Marcar atacante seleccionado
            if (this.selectedAttacker) {
                const team1Ids = this.currentBattleState.equipo1?.miembros || [];
                const attackerIndex = team1Ids.indexOf(this.selectedAttacker.id);
                if (attackerIndex !== -1) {
                    const playerMembers = this.elements.playerTeam.querySelectorAll('.team-member');
                    if (playerMembers[attackerIndex]) {
                        playerMembers[attackerIndex].classList.add('selected-attacker');
                    }
                }
            }

            // Marcar objetivo seleccionado
            if (this.selectedTarget) {
                const team2Ids = this.currentBattleState.equipo2?.miembros || [];
                const targetIndex = team2Ids.indexOf(this.selectedTarget.id);
                if (targetIndex !== -1) {
                    const enemyMembers = this.elements.enemyTeam.querySelectorAll('.team-member');
                    if (enemyMembers[targetIndex]) {
                        enemyMembers[targetIndex].classList.add('selected-target');
                    }
                }
            }
        }
    }

    // Seleccionar movimiento
    selectMove(button) {
        document.querySelectorAll('.move-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    }

    // Función para extraer HP de los mensajes de texto del backend
    parseHpFromMessage(message) {
        console.log('🔍 Parseando mensaje:', message);
        
        if (!message || typeof message !== 'string') {
            console.log('❌ Mensaje inválido o vacío');
            return null;
        }
        
        // Regex para capturar el nombre del personaje y HP del formato del backend
        // El formato es: "[Attacker] usó [Attack] (type). [Description] Causó [Damage] de daño ([Mitigation] mitigado). [Target] tiene [HP] HP restante."
        // Necesitamos extraer la última parte: "[Target] tiene [HP] HP restante."
        
        // Primero intentar con regex específico para nombres con espacios
        const hpMatch = message.match(/([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)\s+tiene\s+(\d+)\s+HP\s+restante/);
        
        if (hpMatch) {
            const characterName = hpMatch[1].trim();
            const currentHp = parseInt(hpMatch[2]);
            
            // Validar que el nombre no esté vacío y el HP sea un número válido
            if (characterName && !isNaN(currentHp) && currentHp >= 0) {
                console.log(`✅ Extraído: "${characterName}" tiene ${currentHp} HP`);
                return {
                    characterName: characterName,
                    currentHp: currentHp
                };
            } else {
                console.log('❌ Datos extraídos inválidos:', { characterName, currentHp });
            }
        }
        
        console.log('🔍 Intentando regex alternativo...');
        
        // Regex alternativo más simple
        const altMatch = message.match(/(.+?)\s+tiene\s+(\d+)\s+HP\s+restante/);
        if (altMatch) {
            const characterName = altMatch[1].trim();
            const currentHp = parseInt(altMatch[2]);
            
            // Validar que el nombre no esté vacío y el HP sea un número válido
            if (characterName && !isNaN(currentHp) && currentHp >= 0) {
                console.log(`✅ Extraído (regex alternativo): "${characterName}" tiene ${currentHp} HP`);
                return {
                    characterName: characterName,
                    currentHp: currentHp
                };
            } else {
                console.log('❌ Datos extraídos inválidos (regex alternativo):', { characterName, currentHp });
            }
        }
        
        console.log('❌ No se pudo extraer HP del mensaje con ningún regex');
        return null;
    }

    // Función para actualizar la vida de un personaje en la UI
    updateCharacterHealth(characterName, newHp) {
        console.log(`🎯 Intentando actualizar vida de: ${characterName} a ${newHp} HP`);
        
        // Buscar el personaje en ambos equipos
        const playerMembers = this.elements.playerTeam.querySelectorAll('.team-member');
        const enemyMembers = this.elements.enemyTeam.querySelectorAll('.team-member');
        
        console.log(`🔍 Buscando en ${playerMembers.length} miembros del equipo jugador`);
        console.log(`🔍 Buscando en ${enemyMembers.length} miembros del equipo enemigo`);
        
        // Debug: Mostrar todos los nombres disponibles
        console.log('🔍 Nombres disponibles en la UI:');
        [...playerMembers, ...enemyMembers].forEach((member, index) => {
            const nameElement = member.querySelector('h4');
            if (nameElement) {
                console.log(`  ${index + 1}: "${nameElement.textContent.trim()}"`);
            }
        });
        
        const allMembers = [...playerMembers, ...enemyMembers];
        
        // Primero, intentar encontrar el personaje por nombre exacto en la UI
        for (const member of allMembers) {
            const nameElement = member.querySelector('h4');
            if (nameElement) {
                const memberName = nameElement.textContent.trim();
                console.log(`🔍 Comparando: "${memberName}" con "${characterName}"`);
                
                // Coincidencia exacta
                if (memberName === characterName) {
                    console.log(`✅ Coincidencia exacta encontrada: ${characterName}`);
                    this.updateHealthBar(member, characterName, newHp);
                    return;
                }
            }
        }
        
        // Si no hay coincidencia exacta, buscar en el cache de personajes
        console.log('🔍 Buscando en cache de personajes...');
        if (this.availableCharacters && Array.isArray(this.availableCharacters)) {
            const character = this.availableCharacters.find(char => 
                char.nombre === characterName || 
                char.alias === characterName
            );
            
            if (character) {
                console.log(`✅ Encontrado en cache: ${character.nombre} (alias: ${character.alias})`);
                
                // Buscar en la UI usando el alias o nombre del cache
                const searchNames = [character.alias, character.nombre].filter(Boolean);
                
                for (const searchName of searchNames) {
                    for (const member of allMembers) {
                        const nameElement = member.querySelector('h4');
                        if (nameElement) {
                            const memberName = nameElement.textContent.trim();
                            if (memberName === searchName) {
                                console.log(`✅ Encontrado en UI usando ${searchName}: ${characterName}`);
                                this.updateHealthBar(member, characterName, newHp);
                                return;
                            }
                        }
                    }
                }
            }
        }
        
        // Último recurso: búsqueda parcial
        console.log('🔍 Intentando búsqueda parcial...');
        for (const member of allMembers) {
            const nameElement = member.querySelector('h4');
            if (nameElement) {
                const memberName = nameElement.textContent.trim();
                
                // Búsqueda parcial (case-insensitive)
                if (memberName.toLowerCase() === characterName.toLowerCase() ||
                    memberName.toLowerCase().includes(characterName.toLowerCase()) ||
                    characterName.toLowerCase().includes(memberName.toLowerCase())) {
                    console.log(`✅ Coincidencia parcial encontrada: "${memberName}" con "${characterName}"`);
                    this.updateHealthBar(member, characterName, newHp);
                    return;
                }
            }
        }
        
        console.log(`❌ No se encontró el personaje: ${characterName}`);
    }
    
    // Función auxiliar para actualizar la barra de vida
    updateHealthBar(member, characterName, newHp) {
        const healthBar = member.querySelector('.health-fill');
        const healthText = member.querySelector('.health-text');
        
        if (healthBar && healthText) {
            // Extraer HP máximo del texto actual
            const currentText = healthText.textContent;
            const maxHpMatch = currentText.match(/\d+\s*\/\s*(\d+)/);
            const maxHp = maxHpMatch ? parseInt(maxHpMatch[1]) : 100;
            
            console.log(`📊 Actualizando barra de vida: ${newHp}/${maxHp} HP`);
            
            // Actualizar barra de vida
            const healthPercentage = Math.max(0, (newHp / maxHp) * 100);
            healthBar.style.width = `${healthPercentage}%`;
            
            // Actualizar texto de HP
            healthText.textContent = `${newHp} / ${maxHp} HP`;
            
            // Actualizar estado si está muerto
            const statusElement = member.querySelector('.status');
            if (statusElement) {
                if (newHp <= 0) {
                    member.classList.add('dead');
                    member.classList.remove('active');
                    statusElement.textContent = 'Estado: Muerto';
                    console.log(`💀 ${characterName} marcado como muerto`);
                } else {
                    member.classList.remove('dead');
                    if (member.parentElement === this.elements.playerTeam) {
                        member.classList.add('active');
                    }
                    statusElement.textContent = 'Estado: Normal';
                    console.log(`❤️ ${characterName} marcado como vivo`);
                }
            }
            
            console.log(`✅ Actualizada vida de ${characterName}: ${newHp}/${maxHp} HP`);
        } else {
            console.log(`❌ No se encontraron elementos de vida para ${characterName}`);
        }
    }

    async performAttack(moveType = 'normal') {
        // Deshabilitar selección manual mientras se procesa el ataque
        this.isManualSelectionEnabled = false;
        this.elements.attackBtn.disabled = true;
        this.elements.attackBtn.textContent = '🔄 Atacando...';

        console.log('Realizando ataque con movimiento:', moveType);
        console.log('Atacante seleccionado:', this.selectedAttacker.alias || this.selectedAttacker.nombre);
        console.log('Objetivo seleccionado:', this.selectedTarget.alias || this.selectedTarget.nombre);
        console.log('Estado de batalla actual:', this.currentBattleState);
        console.log('Battle ID actual:', this.currentBattleId);
        console.log('Modo de batalla:', this.battleMode);
        
        // Usar los personajes seleccionados manualmente
        let attackerId, targetId;
        
        if (this.battleMode === '1v1') {
            // Para 1v1, usar los personajes seleccionados
            attackerId = this.selectedAttacker.id;
            targetId = this.selectedTarget.id;
        } else {
            // Para 3v3, usar los personajes seleccionados manualmente
            attackerId = this.selectedAttacker.id;
            targetId = this.selectedTarget.id;
            
            console.log('🎯 Usando selección manual:');
            console.log('  - Atacante ID:', attackerId, 'Nombre:', this.selectedAttacker.alias || this.selectedAttacker.nombre);
            console.log('  - Objetivo ID:', targetId, 'Nombre:', this.selectedTarget.alias || this.selectedTarget.nombre);
        }
        
        // Preparar payload para el endpoint de acción
        const actionPayload = {
            battleId: this.currentBattleId,
            attackerId: attackerId,
            attackType: moveType,
            targetId: targetId
        };
        
        // Verificar que todos los campos requeridos estén presentes
        console.log('🔍 Verificando payload de acción:');
        console.log('  - battleId:', this.currentBattleId, '(tipo:', typeof this.currentBattleId, ')');
        console.log('  - attackerId:', attackerId, '(tipo:', typeof attackerId, ')');
        console.log('  - attackType:', moveType, '(tipo:', typeof moveType, ')');
        console.log('  - targetId:', targetId, '(tipo:', typeof targetId, ')');
        
        // Validar que ningún campo sea undefined o null
        if (!this.currentBattleId) {
            throw new Error('battleId es undefined o null');
        }
        if (!attackerId) {
            throw new Error('attackerId es undefined o null');
        }
        if (!moveType) {
            throw new Error('attackType es undefined o null');
        }
        if (!targetId) {
            throw new Error('targetId es undefined or null');
        }
        
        console.log('✅ Payload de acción válido:', actionPayload);

        try {
            console.log('🚀 Ejecutando ataque...');
            const attackData = await this.apiCall('/battles/action', 'POST', actionPayload);
            console.log('📊 Datos de ataque recibidos:', attackData);

            // Mostrar información del round
            this.displayRoundInfo(attackData);

            // Actualizar el estado de la batalla con los datos del backend
            if (attackData.battleState) {
                console.log('🔄 Actualizando estado de la batalla con datos del backend...');
                this.currentBattleState = attackData.battleState;
                
                // Actualizar la UI con el estado actualizado
                if (this.currentBattleState.type === '1v1') {
                    this.update1v1BattleUI(this.currentBattleState);
                } else {
                    this.update3v3BattleUI(this.currentBattleState);
                }
                
                console.log('✅ UI actualizada con el estado del backend');
            } else {
                console.log('⚠️ No se recibió battleState del backend, usando parsing de mensajes...');
                
                // Fallback: Parsear y actualizar vida de los personajes desde los mensajes
                console.log('🔍 Procesando mensaje del jugador:', attackData.turnoJugador);
                if (attackData.turnoJugador) {
                    const jugadorHp = this.parseHpFromMessage(attackData.turnoJugador);
                    console.log('📊 Datos extraídos del jugador:', jugadorHp);
                    if (jugadorHp) {
                        console.log(`🎯 Actualizando vida del jugador: ${jugadorHp.characterName} -> ${jugadorHp.currentHp} HP`);
                        this.updateCharacterHealth(jugadorHp.characterName, jugadorHp.currentHp);
                    } else {
                        console.log('❌ No se pudieron extraer datos del jugador del mensaje');
                    }
                } else {
                    console.log('⚠️ No hay mensaje del jugador en la respuesta');
                }

                console.log('🔍 Procesando mensaje del enemigo:', attackData.turnoEnemigo);
                if (attackData.turnoEnemigo) {
                    const enemigoHp = this.parseHpFromMessage(attackData.turnoEnemigo);
                    console.log('📊 Datos extraídos del enemigo:', enemigoHp);
                    if (enemigoHp) {
                        console.log(`🎯 Actualizando vida del enemigo: ${enemigoHp.characterName} -> ${enemigoHp.currentHp} HP`);
                        this.updateCharacterHealth(enemigoHp.characterName, enemigoHp.currentHp);
                    } else {
                        console.log('❌ No se pudieron extraer datos del enemigo del mensaje');
                    }
                } else {
                    console.log('⚠️ No hay mensaje del enemigo en la respuesta');
                }
            }

            // Verificar si la batalla terminó
            if (attackData.estadoCombate === 'Finalizado') {
                console.log('🏁 Batalla finalizada!');
                this.handleBattleEnd(attackData.ganador);
            }

            // Limpiar selecciones después del ataque
            this.selectedAttacker = null;
            this.selectedTarget = null;
            this.updateSelectionUI();

        } catch (error) {
            console.error('❌ Error en performAttack:', error);
            this.showMessage(`Error al ejecutar ataque: ${error.message}`, 'error');
        } finally {
            // Re-habilitar selección manual
            this.isManualSelectionEnabled = true;
            this.elements.attackBtn.disabled = false;
            this.elements.attackBtn.textContent = '⚔️ Realizar Ataque';
            console.log('✅ Selección manual re-habilitada');
        }
    }

    // Guardar datos del round
    saveRoundData(roundData) {
        this.battleRounds.push({
            round: this.battleRounds.length + 1,
            data: roundData,
            timestamp: new Date().toLocaleTimeString()
        });
    }

    // Mostrar información del round
    displayRoundInfo(roundData) {
        // Mostrar mensaje del turno del jugador
        if (roundData.turnoJugador) {
            this.addLogEntry(`⚔️ ${roundData.turnoJugador}`, 'attack');
        }
        
        // Mostrar mensaje del turno del enemigo
        if (roundData.turnoEnemigo) {
            this.addLogEntry(`👹 ${roundData.turnoEnemigo}`, 'attack');
        }
        
        // Mostrar estado del combate
        if (roundData.estadoCombate) {
            this.addLogEntry(`📊 Estado: ${roundData.estadoCombate}`, 'info');
        }
        
        // Mostrar ganador si la batalla terminó
        if (roundData.ganador) {
            this.addLogEntry(`🏆 ¡Ganador: ${roundData.ganador}!`, 'info');
        }
        
        // Mostrar siguiente turno
        if (roundData.siguienteTurno) {
            this.addLogEntry(`🔄 Siguiente turno: ${roundData.siguienteTurno}`, 'info');
        }
        
        // Mantener compatibilidad con el formato anterior si existe
        if (roundData.roundLog) {
            this.addLogEntry(`📜 Round ${this.battleRounds.length}: ${roundData.roundLog}`, 'info');
        }
        
        if (roundData.attacker && roundData.defender) {
            this.addLogEntry(`⚔️ ${roundData.attacker} ataca a ${roundData.defender}`, 'attack');
        }
        
        if (roundData.damage) {
            const criticalText = roundData.critical ? ' (¡CRÍTICO!)' : '';
            this.addLogEntry(`💥 Daño: ${roundData.damage}${criticalText}`, 'damage');
        }
        
        if (roundData.defenderHealth !== undefined) {
            this.addLogEntry(`❤️ ${roundData.defender} HP restante: ${roundData.defenderHealth}`, 'info');
        }
    }

    // Simular batalla completa
    async simulateFullBattle() {
        try {
            this.elements.simulateBattleBtn.disabled = true;
            this.elements.simulateBattleBtn.textContent = '🔄 Simulando...';
            
            this.addLogEntry('🏁 Iniciando simulación completa de batalla...', 'info');
            
            const simulationData = await this.apiCall(`/battles/${this.currentBattleId}/simulate`, 'POST');
            
            console.log('Simulación completa:', simulationData);
            
            // Guardar todos los rounds de la simulación
            if (simulationData.rounds) {
                this.battleRounds = simulationData.rounds.map((round, index) => ({
                    round: index + 1,
                    data: round,
                    timestamp: new Date().toLocaleTimeString()
                }));
            }
            
            // Guardar estadísticas
            this.battleStats = simulationData.stats || {};
            
            this.addLogEntry('✅ Simulación completada', 'success');
            
            setTimeout(() => {
                this.showBattleRecap(simulationData);
            }, 1000);
            
        } catch (error) {
            console.error('Error en simulación:', error);
            this.addLogEntry(`Error en simulación: ${error.message}`, 'error');
        } finally {
            this.elements.simulateBattleBtn.disabled = false;
            this.elements.simulateBattleBtn.textContent = '🏁 Simular Batalla Completa';
        }
    }

    // Siguiente round
    async nextRound() {
        try {
            this.elements.nextRoundBtn.disabled = true;
            this.elements.nextRoundBtn.textContent = '🔄 Procesando...';
            
            const roundData = await this.apiCall(`/battles/${this.currentBattleId}/round`, 'POST');
            
            this.saveRoundData(roundData);
            this.displayRoundInfo(roundData);
            
            await this.loadBattleState();
            
            if (roundData.isFinished) {
                setTimeout(() => {
                    this.showBattleRecap(roundData);
                }, 2000);
            }
            
        } catch (error) {
            console.error('Error en nextRound:', error);
            this.addLogEntry(`Error en siguiente round: ${error.message}`, 'error');
        } finally {
            this.elements.nextRoundBtn.disabled = false;
            this.elements.nextRoundBtn.textContent = '⏭️ Siguiente Round';
        }
    }

    // Toggle auto play
    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;
        
        if (this.isAutoPlaying) {
            this.elements.autoPlayBtn.textContent = '⏸️ Pausar Auto Play';
            this.elements.autoPlayBtn.classList.add('btn-warning');
            this.addLogEntry('▶️ Auto Play iniciado', 'info');
            this.performAttack(); // Iniciar el primer ataque
        } else {
            this.elements.autoPlayBtn.textContent = '▶️ Auto Play';
            this.elements.autoPlayBtn.classList.remove('btn-warning');
            this.addLogEntry('⏸️ Auto Play pausado', 'info');
        }
    }

    // Cambiar turno manualmente
    switchTurn() {
        this.currentTurn = this.currentTurn === 'player' ? 'enemy' : 'player';
        this.updateTurnInfo();
        this.addLogEntry(`🔄 Turno cambiado a: ${this.currentTurn === 'player' ? 'Jugador' : 'Enemigo'}`, 'info');
    }

    // Actualizar información del turno
    updateTurnInfo() {
        const turnText = this.currentTurn === 'player' ? '🎯 Tu Turno' : '👹 Turno Enemigo';
        const turnDescription = this.currentTurn === 'player' ? 
            'Selecciona un movimiento y ataca' : 
            'El enemigo realizará su ataque';
        
        this.elements.currentTurnInfo.innerHTML = `
            <h5>${turnText}</h5>
            <p>${turnDescription}</p>
        `;
        
        this.elements.turnIndicator.textContent = turnText;
        
        // Habilitar/deshabilitar controles según el turno
        const isPlayerTurn = this.currentTurn === 'player';
        this.elements.attackBtn.disabled = !isPlayerTurn;
        document.querySelectorAll('.move-btn').forEach(btn => {
            btn.disabled = !isPlayerTurn;
        });
    }

    // Mostrar recapitulación de batalla
    showBattleRecap(battleData) {
        this.showScreen('recap');
        
        // Determinar resultado
        const isVictory = battleData.winner === 'player' || battleData.winner === 'team1';
        const resultText = isVictory ? '🏆 ¡VICTORIA!' : '💀 Derrota';
        const resultClass = isVictory ? 'victory' : 'defeat';
        
        this.elements.battleResult.textContent = resultText;
        this.elements.battleResult.className = `battle-result ${resultClass}`;
        
        // Mostrar estadísticas
        this.displayBattleStats(battleData);
        
        // Mostrar rounds
        this.displayBattleRounds();
    }

    // Mostrar estadísticas de batalla
    displayBattleStats(battleData) {
        const stats = battleData.stats || this.battleStats || {};
        
        this.elements.battleStats.innerHTML = `
            <div class="stat-card">
                <h4>📊 Rounds Totales</h4>
                <div class="stat-value">${this.battleRounds.length}</div>
                <div class="stat-label">Rounds jugados</div>
            </div>
            <div class="stat-card">
                <h4>⚔️ Daño Total</h4>
                <div class="stat-value">${stats.totalDamage || 0}</div>
                <div class="stat-label">Daño causado</div>
            </div>
            <div class="stat-card">
                <h4>🎯 Críticos</h4>
                <div class="stat-value">${stats.criticalHits || 0}</div>
                <div class="stat-label">Golpes críticos</div>
            </div>
            <div class="stat-card">
                <h4>⏱️ Duración</h4>
                <div class="stat-value">${stats.duration || 'N/A'}</div>
                <div class="stat-label">Tiempo de batalla</div>
            </div>
        `;
    }

    // Mostrar rounds de batalla
    displayBattleRounds() {
        this.elements.roundsLog.innerHTML = '';
        
        this.battleRounds.forEach(round => {
            const roundEntry = document.createElement('div');
            roundEntry.className = 'round-entry';
            
            const roundData = round.data;
            let roundContent = `<h4>Round ${round.round}</h4>`;
            
            if (roundData.attacker && roundData.defender) {
                roundContent += `<div class="round-details">${roundData.attacker} ataca a ${roundData.defender}</div>`;
            }
            
            if (roundData.damage) {
                const criticalClass = roundData.critical ? 'critical' : '';
                roundContent += `<div class="damage-info ${criticalClass}">Daño: ${roundData.damage}${roundData.critical ? ' (¡CRÍTICO!)' : ''}</div>`;
            }
            
            if (roundData.defenderHealth !== undefined) {
                roundContent += `<div class="round-details">HP restante: ${roundData.defenderHealth}</div>`;
            }
            
            roundEntry.innerHTML = roundContent;
            this.elements.roundsLog.appendChild(roundEntry);
        });
    }

    // Volver a selección
    backToSelection() {
        this.showScreen(this.battleMode === '1v1' ? 'selection1v1' : 'selection3v3');
    }

    // Nueva batalla
    newBattle() {
        this.resetGame();
        this.showScreen(this.battleMode === '1v1' ? 'selection1v1' : 'selection3v3');
    }

    // Volver al menú
    backToMenu() {
        this.resetGame();
        this.showScreen('start');
    }

    // Mostrar pantalla específica
    showScreen(screenName) {
        console.log(`🖥️ Cambiando a pantalla: ${screenName}`);
        
        const screens = ['auth', 'start', 'selection1v1', 'selection3v3', 'battle', 'recap'];
        screens.forEach(screen => {
            const element = this.elements[`${screen}Screen`] || document.getElementById(`${screen}Screen`);
            if (element) {
                if (screen === screenName) {
                    element.style.display = 'block';
                    console.log(`✅ Mostrando pantalla: ${screen}`);
                } else {
                    element.style.display = 'none';
                    console.log(`🚫 Ocultando pantalla: ${screen}`);
                }
            } else {
                console.warn(`⚠️ Elemento de pantalla no encontrado: ${screen}Screen`);
            }
        });
        
        // Verificación adicional para pantallas de selección
        if (screenName === 'selection1v1') {
            console.log('🔍 Verificando que pantalla 3v3 esté oculta...');
            if (this.elements.selectionScreen3v3) {
                this.elements.selectionScreen3v3.style.display = 'none';
                console.log('✅ Pantalla 3v3 oculta confirmada');
            }
        } else if (screenName === 'selection3v3') {
            console.log('🔍 Verificando que pantalla 1v1 esté oculta...');
            if (this.elements.selectionScreen1v1) {
                this.elements.selectionScreen1v1.style.display = 'none';
                console.log('✅ Pantalla 1v1 oculta confirmada');
            }
        }
        
        // Limpiar mensajes al cambiar de pantalla
        this.hideMessage();
    }

    // Resetear juego
    resetGame() {
        this.selectedCharacter = null;
        this.selectedEnemy = null;
        this.selectedTeam = [];
        this.selectedEnemyTeam = [];
        this.currentBattleId = '';
        this.currentBattleState = null;
        this.isPlayerTurn = true;
        this.battleMode = '1v1';
        this.battleRounds = [];
        this.isAutoPlaying = false;
        this.battleStats = {};
        this.currentTurn = 'player';
        
        // Resetear botones
        this.elements.startBtn1v1.disabled = false;
        this.elements.startBtn1v1.textContent = '⚔️ Batalla 1v1';
        this.elements.startBtn3v3.disabled = false;
        this.elements.startBtn3v3.textContent = '⚔️⚔️⚔️ Batalla 3v3';
        this.elements.startBattleBtn1v1.disabled = true;
        this.elements.startBattleBtn1v1.textContent = '⚔️ Iniciar Batalla 1v1';
        this.elements.startBattleBtn3v3.disabled = true;
        this.elements.startBattleBtn3v3.textContent = '⚔️⚔️⚔️ Iniciar Batalla 3v3';
        this.elements.attackBtn.disabled = false;
        this.elements.attackBtn.textContent = '⚔️ Realizar Ataque';
        this.elements.autoPlayBtn.textContent = '▶️ Auto Play';
        this.elements.autoPlayBtn.classList.remove('btn-warning');
        
        // Limpiar contenido
        this.elements.battleLog.innerHTML = '';
        this.elements.charactersGrid1v1.innerHTML = '';
        this.elements.charactersGrid3v3.innerHTML = '';
        this.elements.playerTeam.innerHTML = '';
        this.elements.enemyTeam.innerHTML = '';
        this.elements.battleStats.innerHTML = '';
        this.elements.roundsLog.innerHTML = '';
        
        // Limpiar selecciones
        document.querySelectorAll('.move-btn').forEach(btn => btn.classList.remove('selected'));
        this.updateTeamDisplay();
    }

    // Obtener estadísticas del juego
    getGameStats() {
        return {
            battleMode: this.battleMode,
            selectedCharacter: this.selectedCharacter,
            selectedTeam: this.selectedTeam,
            currentBattle: this.currentBattleState,
            isPlayerTurn: this.isPlayerTurn
        };
    }

    // Verificar estado de visibilidad de pantallas (para debugging)
    checkScreenVisibility() {
        const screens = ['auth', 'start', 'selection1v1', 'selection3v3', 'battle', 'recap'];
        const visibility = {};
        
        screens.forEach(screen => {
            const element = this.elements[`${screen}Screen`] || document.getElementById(`${screen}Screen`);
            if (element) {
                visibility[screen] = element.style.display !== 'none';
            } else {
                visibility[screen] = 'element not found';
            }
        });
        
        console.log('📊 Estado de visibilidad de pantallas:', visibility);
        return visibility;
    }

    // Función para manejar el final de la batalla
    handleBattleEnd(winner) {
        console.log(`🏁 Batalla finalizada! Ganador: ${winner}`);
        
        // Mostrar mensaje de victoria/derrota
        const message = winner === 'jugador' ? 
            '🎉 ¡Victoria! Has ganado la batalla!' : 
            '💀 Derrota. El enemigo ha ganado la batalla.';
        
        this.showMessage(message, winner === 'jugador' ? 'success' : 'error');
        
        // Deshabilitar botones de ataque
        this.elements.attackBtn.disabled = true;
        this.elements.attackBtn.textContent = '🏁 Batalla Terminada';
        
        // Agregar entrada al log
        this.addLogEntry(message, winner === 'jugador' ? 'success' : 'error');
        
        // Opcional: Mostrar resumen de la batalla después de un delay
        setTimeout(() => {
            this.showBattleRecap(winner);
        }, 2000);
    }

    // Función para mostrar resumen de la batalla
    showBattleRecap(winner) {
        const recapDiv = document.createElement('div');
        recapDiv.className = 'battle-recap';
        recapDiv.innerHTML = `
            <div class="recap-content">
                <h3>🏁 Resumen de la Batalla</h3>
                <p><strong>Ganador:</strong> ${winner === 'jugador' ? 'Jugador' : 'Enemigo'}</p>
                <p><strong>Estado:</strong> Finalizada</p>
                <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
            </div>
        `;
        
        document.body.appendChild(recapDiv);
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando juego...');
    try {
        window.gameInstance = new SuperheroesBattle();
        console.log('✅ Juego inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar el juego:', error);
    }
}); 