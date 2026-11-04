const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true }, // guardada já criptografada (hash)
    role: { type: String, default: 'usuario' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
