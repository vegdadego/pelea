class Character {
    constructor(id, nombre, alias, tipo, ciudad, equipo, stats = {}, attacks = undefined, level = 1) {
        this.id = id;
        this.nombre = nombre;
        this.alias = alias;
        this.tipo = tipo; // 'heroe' o 'villano'
        this.ciudad = ciudad;
        this.equipo = equipo;
        this.level = Math.max(1, Math.min(5, level)); // Nivel entre 1 y 5
        // Estadísticas base
        const baseStats = {
            health: stats.health || 100,
            maxHealth: stats.maxHealth || 100,
            attack: stats.attack || 50,
            defense: stats.defense || 30,
            speed: stats.speed || 40,
            ...stats
        };
        // Usar ataques del JSON si existen, si no usar los especiales por alias
        if (Array.isArray(attacks) && attacks.length > 0) {
            this.attacks = attacks;
        } else {
            this.attacks = this.getSpecialAttacks();
        }
        this.specialAttacks = this.attacks;
        this.finalAttackUsed = false;
        this.shieldUsed = false;
        this.stats = this.applyLevelBonuses(baseStats);
    }

    applyLevelBonuses(baseStats) {
        // +20% por cada nivel sobre el base (nivel 1 = 1.0, nivel 2 = 1.2, ..., nivel 5 = 1.8)
        const levelMultiplier = 1 + (this.level - 1) * 0.2;
        return {
            health: Math.round(baseStats.health * levelMultiplier),
            maxHealth: Math.round(baseStats.maxHealth * levelMultiplier),
            attack: Math.round(baseStats.attack * levelMultiplier),
            defense: Math.round(baseStats.defense * levelMultiplier),
            speed: Math.round(baseStats.speed * levelMultiplier)
        };
    }

    getSpecialAttacks() {
        const attacks = {
            'Spider-Man': [
                { name: '🕷️ Lanzamiento de Telaraña', damage: 1.2, description: 'Lanza una telaraña que reduce la velocidad del oponente' },
                { name: '🕸️ Red de Telaraña', damage: 1.5, description: 'Crea una red que atrapa al enemigo' },
                { name: '🦸 Sentido Arácnido', damage: 1.8, description: 'Usa sus sentidos arácnidos para un ataque preciso' }
            ],
            'Iron Man': [
                { name: '⚡ Rayo Repulsor', damage: 1.3, description: 'Dispara un rayo de energía desde su pecho' },
                { name: '🚀 Misil Guiado', damage: 1.6, description: 'Lanza un misil que sigue al objetivo' },
                { name: '🛡️ Escudo de Energía', damage: 1.4, description: 'Crea un escudo que refleja el daño' }
            ],
            'Batman': [
                { name: '🦇 Batarang', damage: 1.2, description: 'Lanza un batarang con precisión mortal' },
                { name: '💥 Granada de Humo', damage: 1.3, description: 'Crea una cortina de humo para confundir' },
                { name: '🥋 Artes Marciales', damage: 1.7, description: 'Combina técnicas de combate cuerpo a cuerpo' }
            ],
            'Superman': [
                { name: '👁️ Rayos X', damage: 1.4, description: 'Usa su visión de rayos X para atacar' },
                { name: '💨 Aliento Helado', damage: 1.5, description: 'Congela al oponente con su aliento' },
                { name: '💪 Puñetazo Súper', damage: 2.0, description: 'Un puñetazo con toda su fuerza kryptoniana' }
            ],
            'Wonder Woman': [
                { name: '🛡️ Escudo de Atenea', damage: 1.3, description: 'Usa su escudo para bloquear y contraatacar' },
                { name: '⚔️ Espada de la Verdad', damage: 1.6, description: 'Ataca con su espada mágica' },
                { name: '💫 Lazo de la Verdad', damage: 1.4, description: 'Enlaza al oponente con su lazo mágico' }
            ],
            'Flash': [
                { name: '⚡ Velocidad de la Luz', damage: 1.5, description: 'Ataca a velocidad supersónica' },
                { name: '🌪️ Tornado de Velocidad', damage: 1.8, description: 'Crea un tornado girando a alta velocidad' },
                { name: '💨 Viento de Velocidad', damage: 1.3, description: 'Genera vientos fuertes con su velocidad' }
            ],
            'Thor': [
                { name: '⚡ Rayo de Thor', damage: 1.6, description: 'Invoca un rayo del cielo' },
                { name: '🔨 Martillo Mjolnir', damage: 1.8, description: 'Lanza su martillo con fuerza divina' },
                { name: '🌩️ Tormenta de Truenos', damage: 2.0, description: 'Crea una tormenta eléctrica devastadora' }
            ],
            'Hulk': [
                { name: '💚 Ira Increíble', damage: 1.7, description: 'Se enfurece y aumenta su fuerza' },
                { name: '👊 Puñetazo Hulk', damage: 1.9, description: 'Un puñetazo con toda su fuerza' },
                { name: '💥 Destrucción Total', damage: 2.2, description: 'Destruye todo a su paso' }
            ],
            'Black Widow': [
                { name: '🔫 Pistolas Duales', damage: 1.2, description: 'Dispara con ambas pistolas' },
                { name: '⚡ Bracaletes Eléctricos', damage: 1.4, description: 'Descarga electricidad desde sus brazaletes' },
                { name: '🥋 Combate Cercano', damage: 1.5, description: 'Usa técnicas de combate cuerpo a cuerpo' }
            ],
            'Captain America': [
                { name: '🛡️ Escudo de Vibranium', damage: 1.3, description: 'Lanza su escudo como proyectil' },
                { name: '💪 Fuerza Supersoldado', damage: 1.5, description: 'Usa su fuerza mejorada' },
                { name: '⚔️ Técnica de Combate', damage: 1.4, description: 'Combina escudo y combate cuerpo a cuerpo' }
            ]
        };
        
        return attacks[this.alias] || [
            { name: '👊 Puñetazo Básico', damage: 1.0, description: 'Un puñetazo estándar' },
            { name: '🦵 Patada', damage: 1.1, description: 'Una patada poderosa' },
            { name: '💥 Ataque Especial', damage: 1.3, description: 'Un ataque especial del personaje' }
        ];
    }

    getRandomAttack() {
        const attack = this.specialAttacks[Math.floor(Math.random() * this.specialAttacks.length)];
        return {
            ...attack,
            baseDamage: this.stats.attack
        };
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.stats.defense);
        this.stats.health = Math.max(0, this.stats.health - actualDamage);
        return actualDamage;
    }

    heal(amount) {
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
    }

    isAlive() {
        return this.stats.health > 0;
    }

    resetHealth() {
        this.stats.health = this.stats.maxHealth;
    }
}

export default Character; 