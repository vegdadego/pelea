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

// Esquema para el estado actual de un personaje en batalla
const characterStateSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    alias: String,
    currentHealth: Number,
    maxHealth: Number,
    attack: Number,
    defense: Number,
    specialAttack: Number,
    specialDefense: Number,
    isAlive: Boolean,
    teamId: Number,
    attacks: [Object] // Array de ataques del personaje
}, { _id: false });

const teamStateSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    miembros: [Number] // IDs de personajes
}, { _id: false });

const battleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: String, // '3v3'
    equipo1: teamStateSchema,
    equipo2: teamStateSchema,
    currentCharacterStates: { type: [characterStateSchema], default: [] },
    activeIndex1: { type: Number, default: 0 },
    activeIndex2: { type: Number, default: 0 },
    active1: Number,
    active2: Number,
    turnoActual: { type: String, enum: ['jugador', 'enemigo'], default: 'jugador' },
    isFinished: { type: Boolean, default: false },
    winner: String,
    logs: { type: [String], default: [] },
    currentRound: Number,
    startTime: Date,
    endTime: Date,
    battleStatus: { type: String, enum: ['active', 'finished', 'paused'], default: 'active' }
}, { timestamps: true });

const Battle = mongoose.model('Battle', battleSchema);
export default Battle; 