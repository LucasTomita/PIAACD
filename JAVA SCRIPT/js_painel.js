exigirLogin();

const lista = document.getElementById('lista');
const aviso = document.getElementById('aviso');

const NOMES_TIPO = { mao: 'Mão', braco: 'Braço', perna: 'Perna', pe: 'Pé' };
const NOMES_URGENCIA = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };

let filtroAtual = '';
let minhaInstituicao = null; // fica preenchida se a pessoa cadastrou uma impressora

// Cria um elemento de texto (textContent evita rodar HTML digitado pelos usuários)
function criar(tag, texto, classe) {
  const el = document.createElement(tag);
  el.textContent = texto;
  if (classe) el.className = classe;
  return el;
}

function montarCard(demanda) {
  const card = document.createElement('div');
  card.className = 'pedido';

  card.appendChild(criar('h3', demanda.caso));
  card.appendChild(criar('span', NOMES_URGENCIA[demanda.urgencia] + ' urgência', 'urgencia ' + demanda.urgencia));

  const detalhes = [
    'Prótese: ' + NOMES_TIPO[demanda.tipo],
    'Material: ' + demanda.material,
    'Volume: ' + (demanda.volume ? demanda.volume + ' g' : 'não informado'),
    'Cidade: ' + demanda.cidade,
    'Pedido por: ' + (demanda.solicitante ? demanda.solicitante.nome : 'desconhecido')
  ];
  detalhes.forEach((texto) => card.appendChild(criar('p', texto)));

  if (demanda.status === 'aceita') {
    // Mostra qual instituição pegou o pedido
    const quem = demanda.aceitaPor
      ? demanda.aceitaPor.instituicao + ' (' + demanda.aceitaPor.cidade + ')'
      : 'uma instituição';
    card.appendChild(criar('p', 'Aceito por ' + quem, 'aceito'));
  } else {
    card.appendChild(criar('p', 'Aguardando uma instituição', 'aguardando'));

    // Só quem cadastrou impressora vê o botão de aceitar
    if (minhaInstituicao) {
      const botao = criar('button', 'Aceitar pedido', 'btn-aceitar');
      botao.addEventListener('click', () => aceitar(demanda._id));
      card.appendChild(botao);
    }
  }

  return card;
}

async function carregar() {
  aviso.textContent = '';
  lista.innerHTML = '';

  try {
    const caminho = filtroAtual ? '/demandas?status=' + filtroAtual : '/demandas';
    const { ok, dados } = await chamarApi(caminho);

    if (!ok) {
      aviso.textContent = dados.message || 'Erro ao carregar os pedidos.';
      return;
    }

    if (dados.length === 0) {
      aviso.textContent = 'Nenhum pedido por aqui ainda.';
      return;
    }

    dados.forEach((demanda) => lista.appendChild(montarCard(demanda)));
  } catch (err) {
    console.error(err);
    aviso.textContent = 'Erro ao conectar com o servidor.';
  }
}

async function aceitar(id) {
  const { ok, dados } = await chamarApi('/demandas/' + id + '/aceitar', { method: 'PATCH' });

  if (!ok) {
    alert(dados.message || 'Não foi possível aceitar o pedido.');
  }

  carregar();
}

document.querySelectorAll('.filtro').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('.filtro').forEach((b) => b.classList.remove('ativo'));
    botao.classList.add('ativo');
    filtroAtual = botao.dataset.status;
    carregar();
  });
});

// Primeiro descobre se a pessoa tem impressora cadastrada, depois mostra os pedidos
async function iniciar() {
  try {
    const { ok, dados } = await chamarApi('/instituicoes/minha');
    if (ok) minhaInstituicao = dados;
  } catch (err) {
    console.error(err);
  }
  carregar();
}

iniciar();
