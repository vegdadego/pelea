import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // id incremental
  nombre: { type: String, required: true },
  miembros: [{ type: Number, required: true }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
export default Team; 