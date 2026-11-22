const express = require('express');
const mongoose = require('mongoose');
const Demanda = require('../models/Demanda');
const Instituicao = require('../models/Instituicao');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

// Troca os ids pelos dados de quem pediu e de quem aceitou
function comPessoas(consulta) {
  return consulta
    .populate('solicitante', 'nome')
    .populate('aceitaPor', 'instituicao cidade contato');
}

// CRIAR PEDIDO
router.post('/', autenticar, async (req, res) => {
  try {
    const { caso, tipo, material, volume, cidade, urgencia } = req.body;

    if (!caso || !tipo || !material || !cidade || !urgencia) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    const demanda = await Demanda.create({
      caso,
      tipo,
      material,
      volume: volume === '' ? undefined : volume,
      cidade,
      urgencia,
      solicitante: req.usuario.id
    });

    res.status(201).json(demanda);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dados inválidos no pedido.' });
    }
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// LISTAR OS PEDIDOS (o painel usa esta rota). Filtro opcional: /demandas?status=aberta
router.get('/', autenticar, async (req, res) => {
  try {
    const filtro = {};
    if (req.query.status === 'aberta' || req.query.status === 'aceita') {
      filtro.status = req.query.status;
    }

    const demandas = await comPessoas(Demanda.find(filtro).sort({ createdAt: -1 }));
    res.json(demandas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// A INSTITUIÇÃO ACEITA UM PEDIDO
router.patch('/:id/aceitar', autenticar, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // Só quem cadastrou uma instituição/impressora pode aceitar
    const instituicao = await Instituicao.findOne({ usuario: req.usuario.id });
    if (!instituicao) {
      return res.status(403).json({ message: 'Cadastre sua impressora/instituição para aceitar pedidos.' });
    }

    const demanda = await Demanda.findById(req.params.id);
    if (!demanda) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // A impressora precisa trabalhar com o material pedido
    if (!instituicao.materiais.includes(demanda.material)) {
      return res.status(400).json({ message: `Sua impressora não está cadastrada com o material ${demanda.material}.` });
    }

    // Só muda se o pedido ainda estiver aberto (evita duas instituições aceitarem o mesmo)
    const atualizada = await Demanda.findOneAndUpdate(
      { _id: demanda._id, status: 'aberta' },
      { status: 'aceita', aceitaPor: instituicao._id, aceitaEm: new Date() },
      { new: true }
    );

    if (!atualizada) {
      return res.status(409).json({ message: 'Esse pedido já foi aceito por outra instituição.' });
    }

    res.json(await comPessoas(Demanda.findById(atualizada._id)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

module.exports = router;
