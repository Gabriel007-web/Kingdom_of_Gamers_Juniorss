const categoryButtons = [...document.querySelectorAll('[data-filter]')];
const searchField = document.querySelector('#catalogSearch');
const emptyMessage = document.querySelector('#emptyState');
const resultsCount = document.querySelector('#resultsCount');
let selectedCategory = 'todos';
const normalizarTexto = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

function criarCardDoJogo(jogo) {
  const card = document.createElement('article');
  card.className = 'catalog-card card-hover';
  card.dataset.slug = jogo.slug;
  card.dataset.category = jogo.filtro;
  card.dataset.name = normalizarTexto(`${jogo.nome} ${jogo.categoria} ${jogo.genero} ${jogo.plataformas} ${jogo.descricao}`);
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', `Abrir ${jogo.nome}`);
  const abrirJogo = () => { window.location.href = `jogo.html?jogo=${encodeURIComponent(jogo.slug)}`; };
  card.addEventListener('click', abrirJogo);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      abrirJogo();
    }
  });

  const imagemBox = document.createElement('div');
  imagemBox.className = 'catalog-image';
  const imagem = document.createElement('img');
  imagem.src = jogo.imagem;
  imagem.alt = `Capa de ${jogo.nome}, jogo de ${jogo.categoria.toLocaleLowerCase('pt-BR')} com tema ${jogo.genero.toLocaleLowerCase('pt-BR')}`;
  imagem.loading = 'lazy';
  const selo = document.createElement('span');
  selo.className = 'cover-tag';
  selo.textContent = 'NOVO';
  imagemBox.append(imagem, selo);

  const corpo = document.createElement('div');
  corpo.className = 'catalog-card-body';
  const tituloLinha = document.createElement('div');
  tituloLinha.className = 'catalog-title-row';
  const titulo = document.createElement('h2');
  titulo.textContent = jogo.nome;
  const avaliacao = document.createElement('span');
  avaliacao.className = 'catalog-rating';
  avaliacao.textContent = jogo.avaliacao;
  tituloLinha.append(titulo, avaliacao);

  const descricao = document.createElement('p');
  descricao.className = 'catalog-description';
  descricao.textContent = window.kgjGameSummaryFor?.(jogo) || jogo.descricao;
  const detalhes = document.createElement('div');
  detalhes.className = 'catalog-details';
  const genero = document.createElement('span');
  genero.className = 'catalog-category';
  genero.textContent = `${jogo.categoria} / ${jogo.genero}`;
  const plataforma = document.createElement('span');
  plataforma.textContent = jogo.plataformas;
  const preco = document.createElement('strong');
  preco.className = 'catalog-price';
  preco.textContent = jogo.preco;
  detalhes.append(genero, plataforma, preco);
  corpo.append(tituloLinha, descricao, detalhes);
  card.append(imagemBox, corpo);
  return card;
}

const catalogGrid = document.querySelector('#catalogGrid');
(window.jogosAdicionaisKgj || []).forEach((jogo) => catalogGrid.append(criarCardDoJogo(jogo)));
let gameCards = [...document.querySelectorAll('.catalog-card')];

function updateCatalog() {
  const query = normalizarTexto(searchField.value.trim());
  let visibleGames = 0;

  gameCards.forEach((card) => {
    const matchesCategory = selectedCategory === 'todos' || card.dataset.category === selectedCategory;
    const searchableText = normalizarTexto(`${card.dataset.name} ${card.textContent}`);
    const matchesSearch = !query || searchableText.includes(query);
    const isVisible = matchesCategory && matchesSearch;

    card.hidden = !isVisible;
    if (isVisible) visibleGames += 1;
  });

  emptyMessage.hidden = visibleGames > 0;
  resultsCount.textContent = `${visibleGames} ${visibleGames === 1 ? 'jogo' : 'jogos'}`;
}

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedCategory = button.dataset.filter;
    categoryButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
    updateCatalog();
  });
});

searchField.addEventListener('input', updateCatalog);
updateCatalog();

if (window.kgjApi) {
  window.kgjApi.listGames({ status: 'released', limit: 100 })
    .then((jogos) => {
      if (!jogos.length) return;
      const destaquesLocais = new Set(['coracao-de-sucata', 'neon-requiem', 'echoes-of-valoria', 'mindshift']);
      const slugsDaApi = new Set(jogos.map((jogo) => jogo.slug));
      const jogosLocaisAusentes = (window.jogosAdicionaisKgj || [])
        .filter((jogo) => destaquesLocais.has(jogo.slug) && !slugsDaApi.has(jogo.slug));
      const listaCatalogo = [...jogos, ...jogosLocaisAusentes];
      catalogGrid.replaceChildren(...listaCatalogo.map(criarCardDoJogo));
      gameCards = [...catalogGrid.querySelectorAll('.catalog-card')];
      updateCatalog();
    })
    .catch(() => {
      // A cópia local mantém o catálogo disponível se a API ainda não estiver configurada.
    });
}

