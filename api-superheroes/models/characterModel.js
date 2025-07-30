import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  nombre: { type: String, required: true },
  alias: { type: String, required: true },
  tipo: { type: String, required: true }, // 'heroe' o 'villano'
  ciudad: { type: String },
  equipo: { type: String },
  level: { type: Number, default: 1 },
  stats: {
    health: { type: Number, default: 100 },
    maxHealth: { type: Number, default: 100 },
    attack: { type: Number, default: 50 },
    defense: { type: Number, default: 30 },
    speed: { type: Number, default: 40 },
    specialAttack: { type: Number },
    specialDefense: { type: Number }
  },
  ataques: {
    normal: { type: String },
    especial: { type: String },
    ultimate: { type: String }
  },
  attacks: [
    {
      name: String,
      damage: Number,
      description: String,
      baseDamage: Number
    }
  ]
}, { timestamps: true });

const Character = mongoose.model('Character', characterSchema);
export default Character; 