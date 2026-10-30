const jogosDisponiveis = {
  'mare-de-papel': {
    nome: 'Maré de Papel', categoria: 'Aventura', plataformas: 'PC · Mac', nota: '4,8', preco: 'R$ 24,90',
    descricao: 'Um mundo dobrado à mão, cheio de caminhos para descobrir. Navegue por paisagens de papel e encontre histórias escondidas pelo caminho.', imagem: 'assets/capa-mare.svg', alt: 'Um barco de papel navegando sob a lua',
  },
  'neon-na-veia': {
    nome: 'Neon na Veia', categoria: 'Ação', plataformas: 'PC · Linux', nota: '4,9', preco: 'R$ 32,00',
    descricao: 'Corra, enfrente ondas de inimigos e tente mais uma vez. Uma experiência arcade de ritmo acelerado feita para testar seus reflexos.', imagem: 'assets/capa-neon.svg', alt: 'Um raio sobre uma arena geométrica neon',
  },
  'jardim-de-outro-mundo': {
    nome: 'Jardim de Outro Mundo', categoria: 'Relax', plataformas: 'PC · Switch', nota: '4,7', preco: 'R$ 18,50',
    descricao: 'Plante memórias, cultive um refúgio e colha estrelas. Um convite para desacelerar e cuidar de um jardim fantástico.', imagem: 'assets/capa-jardim.svg', alt: 'Uma flor fantástica em um jardim noturno',
  },
  'depois-das-seis': {
    nome: 'Depois das Seis', categoria: 'Puzzle', plataformas: 'PC · Mac', nota: '4,6', preco: 'R$ 21,90',
    descricao: 'Pequenos enigmas para transformar o fim do dia. Observe os detalhes, conecte as pistas e descubra o que acontece depois das seis.', imagem: 'assets/capa-seis.svg', alt: 'Um relógio marcando seis horas',
  },
  'a-ultima-aurora': {
    nome: 'A Última Aurora', categoria: 'Aventura', plataformas: 'PC · Mac', nota: 'Em breve', preco: 'A divulgar', lancamento: 'Previsto para 30 de outubro de 2026',
    descricao: 'Explore um mundo no crepúsculo e descubra o que resta depois da última luz.', imagem: 'assets/capa-ultima-aurora.svg', alt: 'Última luz do sol entre montanhas escuras',
  },
  'ruinas-de-vertice': {
    nome: 'Ruínas de Vértice', categoria: 'Puzzle · Aventura', plataformas: 'PC', nota: 'Em breve', preco: 'A divulgar', lancamento: 'Previsto para 20 de novembro de 2026',
    descricao: 'Resolva os enigmas de uma cidade esquecida e atravesse seus portais.', imagem: 'assets/capa-ruinas-vertice.svg', alt: 'Portal roxo entre ruínas antigas sob o céu noturno',
  },
};

const dataLancamento = {
  'mare-de-papel': 'Disponível desde 23 de setembro de 2026',
  'neon-na-veia': 'Disponível desde 12 de setembro de 2026',
  'jardim-de-outro-mundo': 'Disponível desde 29 de agosto de 2026',
  'depois-das-seis': 'Disponível desde 8 de agosto de 2026',
};

(window.jogosAdicionaisKgj || []).forEach((jogo) => {
  jogosDisponiveis[jogo.slug] = {
    slug: jogo.slug,
    nome: jogo.nome,
    categoria: `${jogo.categoria} / ${jogo.genero}`,
    plataformas: jogo.plataformas,
    nota: jogo.avaliacao,
    preco: jogo.preco,
    lancamento: jogo.lancamento,
    descricao: jogo.descricao,
    imagem: jogo.imagem,
    alt: `Capa de ${jogo.nome}, jogo de ${jogo.categoria.toLocaleLowerCase('pt-BR')} com tema ${jogo.genero.toLocaleLowerCase('pt-BR')}`,
  };
});

const slugSelecionado = new URLSearchParams(window.location.search).get('jogo');
const jogoSelecionado = jogosDisponiveis[slugSelecionado];
const secaoDetalhe = document.querySelector('#gameDetail');
const avisoNaoEncontrado = document.querySelector('#gameNotFound');

function mostrarDetalhesDoJogo(jogo) {
  secaoDetalhe.hidden = false;
  secaoDetalhe.dataset.gameSlug = jogo.slug || slugSelecionado;
  avisoNaoEncontrado.hidden = true;
  document.title = `${jogo.nome} — K.G.J.`;
  document.querySelector('#breadcrumbTitle').textContent = jogo.nome;
  document.querySelector('#detailTitle').textContent = jogo.nome;
  const descricao = document.querySelector('#detailDescription');
  descricao.textContent = jogo.descricao;
  if ((jogo.slug || slugSelecionado) === 'mindshift') {
    const trechosEmDestaque = [
      'Sua mente é sua única arma.',
      'Mindshift',
      'Mas cuidado:',
      'quanto mais você avança, menos as coisas são o que parecem.',
      'talvez você perceba que o verdadeiro desafio nunca foi o puzzle.',
    ];
    descricao.replaceChildren();
    let restante = jogo.descricao;
    while (restante) {
      const ocorrencias = trechosEmDestaque
        .map((trecho) => ({ trecho, indice: restante.indexOf(trecho) }))
        .filter(({ indice }) => indice >= 0)
        .sort((a, b) => a.indice - b.indice);
      if (!ocorrencias.length) {
        descricao.append(document.createTextNode(restante));
        break;
      }
      const { trecho, indice } = ocorrencias[0];
      if (indice) descricao.append(document.createTextNode(restante.slice(0, indice)));
      const destaque = document.createElement('strong');
      destaque.textContent = trecho;
      descricao.append(destaque);
      restante = restante.slice(indice + trecho.length);
    }
  }
  document.querySelector('#detailCategory').textContent = jogo.categoria;
  document.querySelector('#detailGenre').textContent = jogo.categoria;
  document.querySelector('#detailPlatforms').textContent = jogo.plataformas;
  document.querySelector('#detailRating').textContent = jogo.nota === 'Sem avaliações' ? jogo.nota : `Nota ${jogo.nota}`;
  document.querySelector('#detailRelease').textContent = jogo.lancamento || dataLancamento[slugSelecionado] || 'Data a confirmar';
  document.querySelector('#detailPrice').textContent = jogo.preco;
  const imagem = document.querySelector('#detailImage');
  imagem.src = jogo.imagem;
  imagem.alt = jogo.alt || `Capa de ${jogo.nome}`;
}

function jogoDaApiParaDetalhes(jogo) {
  const lancamento = jogo.lancamento && /^\d{4}-\d{2}-\d{2}$/.test(jogo.lancamento)
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${jogo.lancamento}T00:00:00Z`))
    : jogo.lancamento;
  return {
    ...jogo,
    categoria: `${jogo.categoria} / ${jogo.genero}`,
    lancamento,
    alt: `Capa de ${jogo.nome}, jogo de ${jogo.categoria.toLocaleLowerCase('pt-BR')} com tema ${jogo.genero.toLocaleLowerCase('pt-BR')}`,
  };
}

if (jogoSelecionado) {
  mostrarDetalhesDoJogo(jogoSelecionado);
} else if (!window.kgjApi || !slugSelecionado) {
  secaoDetalhe.hidden = true;
  avisoNaoEncontrado.hidden = false;
  document.title = 'Jogo não encontrado — K.G.J.';
} else {
  secaoDetalhe.hidden = false;
  avisoNaoEncontrado.hidden = true;
  document.querySelector('#detailTitle').textContent = 'Carregando jogo...';
}

if (window.kgjApi && slugSelecionado) {
  window.kgjApi.getGame(slugSelecionado)
    .then((jogo) => mostrarDetalhesDoJogo(jogoDaApiParaDetalhes(jogo)))
    .catch(() => {
      if (jogoSelecionado) return;
      secaoDetalhe.hidden = true;
      avisoNaoEncontrado.hidden = false;
      document.title = 'Jogo não encontrado — K.G.J.';
    });
}
