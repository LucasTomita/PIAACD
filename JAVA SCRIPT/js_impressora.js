exigirLogin();

const form = document.getElementById('formCapacidade');
const msg = document.getElementById('mensagem');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  msg.textContent = '';

  const materiais = Array.from(document.querySelectorAll('input[name="materiais"]:checked')).map(
    (caixa) => caixa.value
  );

  const dados = {
    instituicao: document.getElementById('instituicao').value,
    impressora: document.getElementById('impressora').value,
    horas: document.getElementById('horas').value,
    materiais,
    cidade: document.getElementById('cidade').value,
    contato: document.getElementById('contato').value
  };

  try {
    const { ok, dados: resposta } = await chamarApi('/instituicoes', {
      method: 'POST',
      body: JSON.stringify(dados)
    });

    if (ok) {
      mostrarMensagem(msg, 'Impressora registrada! Indo para o painel...', true);
      setTimeout(() => {
        window.location.href = 'tela_painel.html';
      }, 1000);
    } else {
      mostrarMensagem(msg, resposta.message || 'Erro ao registrar.', false);
    }
  } catch (error) {
    console.error(error);
    mostrarMensagem(msg, 'Erro ao conectar com o servidor.', false);
  }
});
