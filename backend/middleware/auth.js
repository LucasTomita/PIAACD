const jwt = require('jsonwebtoken');

// Confere se a pessoa mandou um token válido (ou seja, fez login)
function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Faça login para continuar.' });
  }

  try {
    // Guarda { id, role } no req para as rotas usarem depois
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
  }
}

module.exports = { autenticar };
