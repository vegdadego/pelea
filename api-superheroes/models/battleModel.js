import mongoose from 'mongoose';

const attackSchema = new mongoose.Schema({
    attacker: String,
    defender: String,
    attackName: String,
    attackDescription: String,
    damage: Number,
    critical: Boolean,
    miss: Boolean,
    defenderHealth: Number,
    baseDamage: Number,
    finalDamage: Number,
    isFinalAttack: Boolean,
    defenderUsedShield: Boolean,
    attackType: { type: String, enum: ['normal', 'especial'], default: 'normal' }
}, { _id: false });

const roundSchema = new mongoose.Schema({
    round: Number,
    attacks: [attackSchema]
}, { _id: false });

<<<<<<< HEAD
// Esquema para el estado actual de un personaje en batalla
=======
>>>>>>> c1b25f76b8ef104b0d97f1bf2c0347865902df18
const characterStateSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    alias: String,
    tipo: String,
<<<<<<< HEAD
    currentHealth: Number,
    maxHealth: Number,
    isAlive: Boolean,
    teamId: Number // ID del equipo al que pertenece
=======
    hp: Number,
    maxHp: Number,
    ataque_normal: Number,
    ataque_especial: Number,
    escudo: Number,
    escudoUsado: { type: Boolean, default: false }
}, { _id: false });

const teamStateSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    miembros: [characterStateSchema]
>>>>>>> c1b25f76b8ef104b0d97f1bf2c0347865902df18
}, { _id: false });

const battleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: String, // '1v1' o '3v3'
    char1: characterStateSchema,
    char2: characterStateSchema,
    equipo1: teamStateSchema,
    equipo2: teamStateSchema,
    rounds: [roundSchema],
    currentRound: Number,
    winner: String,
    loser: String,
    isFinished: Boolean,
    startTime: Date,
    endTime: Date,
<<<<<<< HEAD
    // Flags para ataque final y escudo
    userFinalAttackUsed: { type: Boolean, default: false },
    userShieldUsed: { type: Boolean, default: false },
    opponentFinalAttackUsed: { type: Boolean, default: false },
    opponentShieldUsed: { type: Boolean, default: false },
    // Estado actual de los personajes en batalla
    currentCharacterStates: [characterStateSchema],
    // Turno actual (para batallas por turnos)
    currentTurn: { type: Number, default: 1 },
    // Equipo que tiene el turno actual (1 o 2)
    currentTeamTurn: { type: Number, default: 1 },
    // Acciones restantes del equipo actual en este turno
    remainingActions: { type: Number, default: 3 },
    // IDs de personajes que ya atacaron en el turno actual
    alreadyAttacked: { type: [Number], default: [] },
    // Estado de la batalla: 'active', 'finished', 'paused'
    battleStatus: { type: String, enum: ['active', 'finished', 'paused'], default: 'active' }
=======
    turnoActual: { type: String, default: 'usuario' }
>>>>>>> c1b25f76b8ef104b0d97f1bf2c0347865902df18
}, {
    timestamps: true
});

const Battle = mongoose.model('Battle', battleSchema);
export default Battle; 