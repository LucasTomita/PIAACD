const mongoose = require('mongoose');

// Dados da instituição que tem impressora 3D.
// Cada usuário (conta) pode ter uma instituição cadastrada.
const instituicaoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    instituicao: { type: String, required: true, trim: true },
    impressora: { type: String, required: true, trim: true },
    horas: { type: Number, required: true, min: 0 },
    materiais: [{ type: String, enum: ['PLA', 'PETG', 'ABS', 'TPU'] }],
    cidade: { type: String, required: true, trim: true },
    contato: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Instituicao', instituicaoSchema);
