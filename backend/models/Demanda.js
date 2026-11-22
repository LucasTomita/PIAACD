const mongoose = require('mongoose');

const demandaSchema = new mongoose.Schema(
  {
    caso: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, enum: ['mao', 'braco', 'perna', 'pe'] },
    material: { type: String, required: true, enum: ['PLA', 'PETG', 'ABS', 'TPU'] },
    volume: { type: Number, min: 0 },
    cidade: { type: String, required: true, trim: true },
    urgencia: { type: String, required: true, enum: ['baixa', 'media', 'alta'] },

    // "aberta" = esperando uma instituição | "aceita" = alguém já pegou
    status: { type: String, enum: ['aberta', 'aceita'], default: 'aberta' },

    solicitante: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    aceitaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instituicao' },
    aceitaEm: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Demanda', demandaSchema);
