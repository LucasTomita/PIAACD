exigirLogin();

const form = document.getElementById('formDemanda');
const msg = document.getElementById('mensagem');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  msg.textContent = '';

  const dados = {
    caso: document.getElementById('caso').value,
    tipo: document.querySelector('input[name="tipo"]:checked').value,
    material: document.querySelector('input[name="material"]:checked').value,
    volume: document.getElementById('volume').value,
    cidade: document.getElementById('cidade').value,
    urgencia: document.querySelector('input[name="urgencia"]:checked').value
  };

  try {
    const { ok, dados: resposta } = await chamarApi('/demandas', {
      method: 'POST',
      body: JSON.stringify(dados)
    });

    if (ok) {
      mostrarMensagem(msg, 'Demanda publicada! Indo para o painel...', true);
      setTimeout(() => {
        window.location.href = 'tela_painel.html';
      }, 1000);
    } else {
      mostrarMensagem(msg, resposta.message || 'Erro ao publicar a demanda.', false);
    }
  } catch (error) {
    console.error(error);
    mostrarMensagem(msg, 'Erro ao conectar com o servidor.', false);
  }
});
