const express = require('express');
const Instituicao = require('../models/Instituicao');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

const MATERIAIS = ['PLA', 'PETG', 'ABS', 'TPU'];

// CADASTRAR (ou atualizar) a instituição/impressora de quem está logado
router.post('/', autenticar, async (req, res) => {
  try {
    const { instituicao, impressora, horas, materiais, cidade, contato } = req.body;

    const materiaisValidos = (materiais || []).filter((m) => MATERIAIS.includes(m));

    if (!instituicao || !impressora || horas === undefined || !cidade || !contato) {
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }
    if (materiaisValidos.length === 0) {
      return res.status(400).json({ message: 'Escolha pelo menos um material.' });
    }

    // Se a pessoa já tinha cadastrado, atualiza; se não, cria
    const salva = await Instituicao.findOneAndUpdate(
      { usuario: req.usuario.id },
      { instituicao, impressora, horas, materiais: materiaisValidos, cidade, contato },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(salva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// A instituição de quem está logado (o painel usa para saber se mostra o botão "Aceitar")
router.get('/minha', autenticar, async (req, res) => {
  try {
    const minha = await Instituicao.findOne({ usuario: req.usuario.id });
    if (!minha) {
      return res.status(404).json({ message: 'Nenhuma instituição cadastrada.' });
    }
    res.json(minha);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

module.exports = router;
