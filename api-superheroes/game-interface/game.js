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
            
            this.showScreen(mode === '1v1' ? 'selection1v1' : 'selection3v3');
            this.showGameMessage(`🎮 ${mode === '1v1' ? 'Selecciona tu personaje y el enemigo.' : 'Selecciona tu equipo de 3 personajes y el equipo enemigo.'}`, 'info');

        } catch (error) {
            console.error('Error en startGame:', error);
            this.showGameMessage(`Error al cargar personajes: ${error.message}`, 'error');
            
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
        card.innerHTML = `
            <h3>${character.alias || character.nombre}</h3>
            <p><strong>${character.nombre}</strong></p>
            <p>Tipo: ${character.tipo}</p>
            <div class="character-stats">
                <div class="stat">
                    <span>❤️ HP:</span> ${character.stats.health}
                </div>
                <div class="stat">
                    <span>⚔️ ATK:</span> ${character.stats.attack}
                </div>
                <div class="stat">
                    <span>🛡️ DEF:</span> ${character.stats.defense}
                </div>
                <div class="stat">
                    <span>⚡ SPD:</span> ${character.stats.speed}
                </div>
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

        // Habilitar botón de inicio si ambos están seleccionados
        if (this.selectedCharacter && this.selectedEnemy) {
            this.elements.startBattleBtn1v1.disabled = false;
        }
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
        
        this.elements.startBattleBtn1v1.disabled = true;
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

        // Habilitar botón de inicio si ambos equipos están completos
        if (this.selectedTeam.length === 3 && this.selectedEnemyTeam.length === 3) {
            this.elements.startBattleBtn3v3.disabled = false;
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
        
        this.elements.startBattleBtn3v3.disabled = true;
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
        
        this.elements.startBattleBtn1v1.disabled = true;
        this.showGameMessage('🔄 Selección 1v1 limpiada', 'info');
    }

    // Limpiar selección 3v3
    clearSelection3v3() {
        this.selectedTeam = [];
        this.selectedEnemyTeam = [];
        
        this.updateTeamDisplay('player');
        this.updateTeamDisplay('enemy');
        
        this.elements.startBattleBtn3v3.disabled = true;
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
                // Para 3v3, usar directamente /battles/action con los equipos
                const actionPayload = {
                    attackerId: parseInt(this.selectedTeam[0].id),
                    attackType: "normal",
                    targetId: parseInt(this.selectedEnemyTeam[0].id),
                    team1Ids: this.selectedTeam.map(c => parseInt(c.id)),
                    team2Ids: this.selectedEnemyTeam.map(c => parseInt(c.id))
                };
                console.log('Iniciando batalla 3v3 con:', actionPayload);
                
                battleData = await this.apiCall('/battles/action', 'POST', actionPayload);
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
            const battleState = await this.apiCall(`/battles/${this.currentBattleId}`);
            this.currentBattleState = battleState;
            this.updateBattleUI(battleState);
            this.updateTurnInfo(); // Inicializar información del turno
        } catch (error) {
            console.error('Error en loadBattleState:', error);
            this.showGameMessage(`Error al cargar estado de batalla: ${error.message}`, 'error');
        }
    }

    // Actualizar interfaz de batalla
    updateBattleUI(battleState) {
        console.log('Actualizando UI con estado:', battleState);
        
        if (this.battleMode === '1v1') {
            this.update1v1BattleUI(battleState);
        } else {
            this.update3v3BattleUI(battleState);
        }
    }

    // Actualizar UI para batalla 1v1
    update1v1BattleUI(battleState) {
        const hero1 = battleState.hero1 || battleState.char1;
        const hero2 = battleState.hero2 || battleState.char2;

        this.elements.playerTeam.innerHTML = `
            <div class="team-member active">
                <h4>${hero1.alias || hero1.nombre}</h4>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${(hero1.hp || hero1.health) / (hero1.maxHp || hero1.maxHealth) * 100}%"></div>
                </div>
                <div class="health-text">${hero1.hp || hero1.health} / ${hero1.maxHp || hero1.maxHealth} HP</div>
                <div class="status">Estado: Normal</div>
            </div>
        `;

        this.elements.enemyTeam.innerHTML = `
            <div class="team-member">
                <h4>${hero2.alias || hero2.nombre}</h4>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${(hero2.hp || hero2.health) / (hero2.maxHp || hero2.maxHealth) * 100}%"></div>
                </div>
                <div class="health-text">${hero2.hp || hero2.health} / ${hero2.maxHp || hero2.maxHealth} HP</div>
                <div class="status">Estado: Normal</div>
            </div>
        `;

        // Determinar turno
        const isPlayerTurn = battleState.turnoActual === 'jugador' || battleState.currentTurn === 'player';
        this.elements.turnIndicator.textContent = isPlayerTurn ? 'Tu turno' : 'Turno del enemigo';
        this.elements.attackBtn.disabled = !isPlayerTurn;
    }

    // Actualizar UI para batalla 3v3
    update3v3BattleUI(battleState) {
        const team1 = battleState.team1 || battleState.heroes1 || [];
        const team2 = battleState.team2 || battleState.heroes2 || [];

        // Renderizar equipo del jugador
        this.elements.playerTeam.innerHTML = team1.map(hero => `
            <div class="team-member ${hero.hp > 0 ? 'active' : 'dead'}">
                <h4>${hero.alias || hero.nombre}</h4>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${hero.hp / hero.maxHp * 100}%"></div>
                </div>
                <div class="health-text">${hero.hp} / ${hero.maxHp} HP</div>
                <div class="status">${hero.hp > 0 ? 'Estado: Normal' : 'Estado: Muerto'}</div>
            </div>
        `).join('');

        // Renderizar equipo enemigo
        this.elements.enemyTeam.innerHTML = team2.map(hero => `
            <div class="team-member ${hero.hp > 0 ? '' : 'dead'}">
                <h4>${hero.alias || hero.nombre}</h4>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${hero.hp / hero.maxHp * 100}%"></div>
                </div>
                <div class="health-text">${hero.hp} / ${hero.maxHp} HP</div>
                <div class="status">${hero.hp > 0 ? 'Estado: Normal' : 'Estado: Muerto'}</div>
            </div>
        `).join('');

        // Determinar turno
        const isPlayerTurn = battleState.turnoActual === 'jugador' || battleState.currentTurn === 'player';
        this.elements.turnIndicator.textContent = isPlayerTurn ? 'Tu turno' : 'Turno del enemigo';
        this.elements.attackBtn.disabled = !isPlayerTurn;
    }

    // Seleccionar movimiento
    selectMove(button) {
        document.querySelectorAll('.move-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    }

    // Realizar ataque
    async performAttack() {
        const selectedMove = document.querySelector('.move-btn.selected');
        if (!selectedMove) {
            this.addLogEntry('❌ Debes seleccionar un movimiento', 'error');
            return;
        }

        const moveType = selectedMove.dataset.move;
        
        try {
            this.elements.attackBtn.disabled = true;
            this.elements.attackBtn.textContent = '🔄 Atacando...';

            console.log('Realizando ataque con movimiento:', moveType);
            
            // Preparar payload para el endpoint de acción
            const actionPayload = {
                battleId: this.currentBattleId,
                attackerId: this.currentBattleState.hero1?.id || this.currentBattleState.team1?.[0]?.id,
                attackType: moveType,
                targetId: this.currentBattleState.hero2?.id || this.currentBattleState.team2?.[0]?.id
            };
            
            console.log('Payload de acción:', actionPayload);
            const attackData = await this.apiCall('/battles/action', 'POST', actionPayload);

            console.log('Resultado del ataque:', attackData);
            
            // Guardar información del round
            this.saveRoundData(attackData);
            
            // Mostrar información del round en el log
            this.displayRoundInfo(attackData);

            await this.loadBattleState();

            // Verificar si la batalla terminó
            if (attackData.isFinished) {
                this.addLogEntry(`🏆 Batalla terminada!`, 'info');
                setTimeout(() => {
                    this.showBattleRecap(attackData);
                }, 2000);
            } else if (this.isAutoPlaying) {
                // Continuar auto play
                setTimeout(() => this.performAttack(), 1000);
            }

        } catch (error) {
            console.error('Error en performAttack:', error);
            this.addLogEntry(`Error al realizar ataque: ${error.message}`, 'error');
        } finally {
            this.elements.attackBtn.disabled = false;
            this.elements.attackBtn.textContent = '⚔️ Realizar Ataque';
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
                }
            }
        });
        
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