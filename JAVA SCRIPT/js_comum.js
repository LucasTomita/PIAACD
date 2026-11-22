// Coisas que todas as telas usam.
// Se o site e a API estiverem em outro endereço, troque a API_URL.
const API_URL = 'http://localhost:3000';

function pegarToken() {
  return localStorage.getItem('token');
}

// Chame no começo das telas que exigem login
function exigirLogin() {
  if (!pegarToken()) {
    window.location.href = 'tela_login.html';
  }
}

function sair() {
  localStorage.clear();
  window.location.href = 'tela_login.html';
}

// fetch que já manda o token junto
async function chamarApi(caminho, opcoes = {}) {
  const resposta = await fetch(API_URL + caminho, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + pegarToken(),
      ...(opcoes.headers || {})
    }
  });

  const dados = await resposta.json();

  // Token vencido ou inválido: volta para o login
  if (resposta.status === 401) {
    sair();
  }

  return { ok: resposta.ok, dados };
}

// Mostra uma mensagem de erro ou sucesso embaixo do formulário
function mostrarMensagem(elemento, texto, ok) {
  elemento.textContent = texto;
  elemento.style.color = ok ? '#16a34a' : '#dc3545';
}
