// Admin Interface JavaScript
class AdminInterface {
    constructor() {
        this.apiBaseUrl = 'https://pelea.onrender.com/api';
        this.token = localStorage.getItem('adminToken');
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboardStats();
    }

    checkAuth() {
        if (!this.token) {
            this.showMessage('No hay token de autenticación. Redirigiendo al login...', 'error');
            setTimeout(() => this.redirectToLogin(), 2000);
            return;
        }

        // Verificar si el usuario es admin
        this.getCurrentUser().then(user => {
            if (user && user.user === 'vegdadego') {
                this.currentUser = user;
                document.getElementById('admin-username').textContent = user.user;
                console.log('✅ Autenticación exitosa como admin');
            } else {
                this.showMessage('Acceso denegado. Solo administradores pueden acceder a esta interfaz.', 'error');
                setTimeout(() => this.redirectToLogin(), 2000);
            }
        }).catch(error => {
            console.error('Error verificando autenticación:', error);
            this.showMessage('Error de autenticación. Verificando credenciales...', 'error');
            setTimeout(() => this.redirectToLogin(), 2000);
        });
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    switchSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Load section data
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                this.loadDashboardStats();
                break;
            case 'characters':
                this.loadAllCharacters();
                break;
            case 'teams':
                this.loadAllTeams();
                break;
            case 'battles':
                this.loadAllBattles();
                break;
            case 'users':
                this.loadAllUsers();
                break;
        }
    }

    async loadDashboardStats() {
        try {
            this.showLoading();
            
            const [characters, teams, battles, users] = await Promise.all([
                this.apiCall('/personajes'),
                this.apiCall('/equipos'),
                this.apiCall('/batallas'),
                this.apiCall('/usuarios')
            ]);

            document.getElementById('total-characters').textContent = characters.length || 0;
            document.getElementById('total-teams').textContent = teams.length || 0;
            document.getElementById('active-battles').textContent = battles.filter(b => !b.isFinished).length || 0;
            document.getElementById('total-users').textContent = users.length || 0;

        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            this.showMessage('Error cargando estadísticas del dashboard', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadAllCharacters() {
        try {
            this.showLoading();
            const characters = await this.apiCall('/personajes');
            this.displayCharacters(characters);
        } catch (error) {
            console.error('Error loading characters:', error);
            this.showMessage('Error cargando personajes', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayCharacters(characters) {
        const grid = document.getElementById('characters-grid');
        grid.innerHTML = '';

        characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.innerHTML = `
                <h3>${character.nombre} (${character.alias})</h3>
                <div class="character-stats">
                    <div class="stat-item">
                        <span class="stat-label">Tipo:</span>
                        <span class="stat-value">${character.tipo}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ciudad:</span>
                        <span class="stat-value">${character.ciudad}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ataque:</span>
                        <span class="stat-value">${character.stats.attack}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Defensa:</span>
                        <span class="stat-value">${character.stats.defense}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Velocidad:</span>
                        <span class="stat-value">${character.stats.speed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Salud:</span>
                        <span class="stat-value">${character.stats.health}/${character.stats.maxHealth}</span>
                    </div>
                </div>
                ${character.ataques ? `
                <div class="character-attacks">
                    <h4>Ataques:</h4>
                    <div class="attacks-list">
                        <div class="stat-item">
                            <span class="stat-label">Normal:</span>
                            <span class="stat-value">${character.ataques.normal}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Especial:</span>
                            <span class="stat-value">${character.ataques.especial}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Ultimate:</span>
                            <span class="stat-value">${character.ataques.ultimate}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
            `;
            grid.appendChild(card);
        });
    }

    async loadAllTeams() {
        try {
            this.showLoading();
            const teams = await this.apiCall('/equipos');
            this.displayTeams(teams);
        } catch (error) {
            console.error('Error loading teams:', error);
            this.showMessage('Error cargando equipos', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayTeams(teams) {
        const grid = document.getElementById('teams-grid');
        grid.innerHTML = '';

        teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.innerHTML = `
                <h3>${team.nombre}</h3>
                <div class="team-info">
                    <div class="stat-item">
                        <span class="stat-label">ID:</span>
                        <span class="stat-value">${team.id}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Miembros:</span>
                        <span class="stat-value">${team.miembros.length}</span>
                    </div>
                </div>
                <div class="team-members">
                    <h4>Miembros:</h4>
                    <ul>
                        ${team.miembros.map(member => `
                            <li>${member.nombre || `ID: ${member.id}`} (${member.alias || 'Sin alias'})</li>
                        `).join('')}
                    </ul>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    async loadAllBattles() {
        try {
            this.showLoading();
            const battles = await this.apiCall('/batallas');
            this.displayBattles(battles);
        } catch (error) {
            console.error('Error loading battles:', error);
            this.showMessage('Error cargando batallas', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayBattles(battles) {
        const list = document.getElementById('battles-list');
        list.innerHTML = '';

        if (battles.length === 0) {
            list.innerHTML = '<p>No hay batallas registradas.</p>';
            return;
        }

        battles.forEach(battle => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div>
                    <strong>Batalla ${battle.id || battle._id}</strong>
                    <br>
                    <small>Estado: ${battle.isFinished ? 'Finalizada' : 'Activa'}</small>
                </div>
                <div>
                    ${battle.winner ? `<span class="winner">Ganador: ${battle.winner}</span>` : ''}
                    <button class="btn-secondary" onclick="viewBattleDetails('${battle.id || battle._id}')">
                        Ver Detalles
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    async loadAllUsers() {
        try {
            this.showLoading();
            const users = await this.apiCall('/usuarios');
            this.displayUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showMessage('Error cargando usuarios', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayUsers(users) {
        const list = document.getElementById('users-list');
        list.innerHTML = '';

        users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div>
                    <strong>${user.user}</strong>
                    <br>
                    <small>Email: ${user.email || 'N/A'}</small>
                </div>
                <div>
                    <span class="user-role">${user.user === 'vegdadego' ? 'Admin' : 'Usuario'}</span>
                    <button class="btn-secondary" onclick="viewUserDetails('${user._id}')">
                        Ver Detalles
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    // Admin Actions
    async clearAllTeams() {
        if (!confirm('¿Estás seguro de que quieres eliminar TODOS los equipos? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            this.showLoading();
            const response = await this.apiCall('/equipos/clear', 'DELETE');
            this.showMessage(`Se eliminaron ${response.deletedCount} equipos exitosamente`, 'success');
            this.loadDashboardStats();
            this.loadAllTeams();
        } catch (error) {
            console.error('Error clearing teams:', error);
            this.showMessage('Error eliminando equipos', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async showCharacterStats() {
        try {
            this.showLoading();
            const characters = await this.apiCall('/personajes');
            
            const stats = {
                heroes: characters.filter(c => c.tipo === 'heroe').length,
                villains: characters.filter(c => c.tipo === 'villano').length,
                total: characters.length
            };

            this.showModal(`
                <h3>Estadísticas de Personajes</h3>
                <div class="stats-summary">
                    <div class="stat-item">
                        <span class="stat-label">Total:</span>
                        <span class="stat-value">${stats.total}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Héroes:</span>
                        <span class="stat-value">${stats.heroes}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Villanos:</span>
                        <span class="stat-value">${stats.villains}</span>
                    </div>
                </div>
            `);
        } catch (error) {
            console.error('Error loading character stats:', error);
            this.showMessage('Error cargando estadísticas', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async exportData() {
        try {
            this.showLoading();
            const [characters, teams, battles, users] = await Promise.all([
                this.apiCall('/personajes'),
                this.apiCall('/equipos'),
                this.apiCall('/batallas'),
                this.apiCall('/usuarios')
            ]);

            const data = {
                characters,
                teams,
                battles,
                users,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `digimon-battle-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showMessage('Datos exportados exitosamente', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showMessage('Error exportando datos', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async showSystemLogs() {
        this.showModal(`
            <h3>Logs del Sistema</h3>
            <div class="logs-content">
                <p>Funcionalidad de logs en desarrollo...</p>
                <p>Aquí se mostrarían los logs del sistema, errores, y actividad de usuarios.</p>
            </div>
        `);
    }

    async createAdminUser() {
        try {
            this.showLoading();
            const response = await fetch(`${this.apiBaseUrl}/auth/create-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    user: 'vegdadego',
                    password: 'admin123',
                    nombre: 'Administrador',
                    email: 'admin@digimon.com'
                })
            });
            
            this.hideLoading();
            
            if (response.ok) {
                this.showMessage('✅ Usuario admin creado exitosamente', 'success');
            } else {
                const error = await response.json();
                this.showMessage('Error creando admin: ' + error.error, 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showMessage('Error creando admin: ' + error.message, 'error');
        }
    }

    // Utility Methods
    async apiCall(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async getCurrentUser() {
        try {
            return await this.apiCall('/usuarios/me');
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    showModal(content) {
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        document.querySelector('.admin-content').insertBefore(messageDiv, document.querySelector('.admin-content').firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    logout() {
        localStorage.removeItem('adminToken');
        this.redirectToLogin();
    }

    redirectToLogin() {
        window.location.href = '/game-interface/index.html';
    }
}

// Global functions for onclick handlers
function clearAllTeams() {
    adminInterface.clearAllTeams();
}

function showCharacterStats() {
    adminInterface.showCharacterStats();
}

function exportData() {
    adminInterface.exportData();
}

function showSystemLogs() {
    adminInterface.showSystemLogs();
}

function createAdminUser() {
    adminInterface.createAdminUser();
}

function loadAllCharacters() {
    adminInterface.loadAllCharacters();
}

function loadAllTeams() {
    adminInterface.loadAllTeams();
}

function loadAllBattles() {
    adminInterface.loadAllBattles();
}

function loadAllUsers() {
    adminInterface.loadAllUsers();
}

function viewBattleDetails(battleId) {
    adminInterface.showModal(`
        <h3>Detalles de Batalla ${battleId}</h3>
        <p>Funcionalidad en desarrollo...</p>
    `);
}

function viewUserDetails(userId) {
    adminInterface.showModal(`
        <h3>Detalles de Usuario</h3>
        <p>Funcionalidad en desarrollo...</p>
    `);
}

// Initialize admin interface
const adminInterface = new AdminInterface(); 