const jogosParaBuscar = [
  { slug: 'mare-de-papel', nome: 'Maré de Papel', categoria: 'Aventura', plataforma: 'PC · Mac', nota: '4,8', busca: 'aventura exploração papel mundo dobrado' },
  { slug: 'neon-na-veia', nome: 'Neon na Veia', categoria: 'Ação', plataforma: 'PC · Linux', nota: '4,9', busca: 'ação arcade corrida neon' },
  { slug: 'jardim-de-outro-mundo', nome: 'Jardim de Outro Mundo', categoria: 'Relax', plataforma: 'PC · Switch', nota: '4,7', busca: 'relax simulação jardim plantar' },
  { slug: 'depois-das-seis', nome: 'Depois das Seis', categoria: 'Puzzle', plataforma: 'PC · Mac', nota: '4,6', busca: 'puzzle enigmas tempo' },
  { slug: 'a-ultima-aurora', nome: 'A Última Aurora', categoria: 'Aventura', plataforma: 'PC · Mac', nota: 'Em breve', busca: 'aventura exploração mundo crepúsculo' },
  { slug: 'ruinas-de-vertice', nome: 'Ruínas de Vértice', categoria: 'Puzzle · Aventura', plataforma: 'PC', nota: 'Em breve', busca: 'puzzle aventura enigmas portais ruínas' },
  ...((window.jogosAdicionaisKgj || []).map((jogo) => ({
    slug: jogo.slug,
    nome: jogo.nome,
    categoria: `${jogo.categoria} / ${jogo.genero}`,
    plataforma: jogo.plataformas,
    nota: jogo.avaliacao,
    busca: jogo.descricao,
  }))),
];

const caixaBusca = document.querySelector('#headerSearch');
const campoBusca = document.querySelector('#siteSearch');
const listaSugestoes = document.querySelector('#searchSuggestions');

if (caixaBusca && campoBusca && listaSugestoes) {
  const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  let sequenciaBusca = 0;

  function fecharSugestoes() {
    listaSugestoes.hidden = true;
    campoBusca.setAttribute('aria-expanded', 'false');
  }

  function renderizarSugestoes(encontrados) {
    listaSugestoes.replaceChildren();
    if (encontrados.length === 0) {
      const aviso = document.createElement('p');
      aviso.className = 'search-empty';
      aviso.textContent = 'Nenhum jogo encontrado.';
      listaSugestoes.append(aviso);
    } else {
      encontrados.forEach((jogo) => {
        const link = document.createElement('a');
        link.className = 'search-result';
        link.href = `jogo.html?jogo=${encodeURIComponent(jogo.slug)}`;
        link.setAttribute('role', 'option');

        const nome = document.createElement('span');
        nome.className = 'search-result-name';
        nome.textContent = jogo.nome;

        const detalhes = document.createElement('span');
        detalhes.className = 'search-result-meta';
        detalhes.textContent = `${jogo.categoria} · ${jogo.plataforma} · Nota ${jogo.nota}`;

        link.append(nome, detalhes);
        listaSugestoes.append(link);
      });
    }
    listaSugestoes.hidden = false;
    campoBusca.setAttribute('aria-expanded', 'true');
  }

  function atualizarSugestoes() {
    const sequenciaAtual = ++sequenciaBusca;
    const consulta = normalizar(campoBusca.value.trim());
    listaSugestoes.replaceChildren();

    if (!consulta) {
      fecharSugestoes();
      return;
    }

    let encontrados = jogosParaBuscar.filter((jogo) => {
      const texto = normalizar(`${jogo.nome} ${jogo.categoria} ${jogo.plataforma} ${jogo.busca}`);
      return texto.includes(consulta);
    });

    renderizarSugestoes(encontrados);

    if (window.kgjApi) {
      window.kgjApi.searchGames(campoBusca.value.trim())
        .then((jogosRemotos) => {
          if (sequenciaAtual !== sequenciaBusca) return;
          const jogosNormalizados = jogosRemotos.map((jogo) => ({
          slug: jogo.slug,
          nome: jogo.nome,
          categoria: `${jogo.categoria} / ${jogo.genero}`,
          plataforma: jogo.plataformas,
          nota: jogo.avaliacao,
          busca: jogo.descricao,
          }));
          renderizarSugestoes(jogosNormalizados.length ? jogosNormalizados : encontrados);
        })
        .catch(() => {
          // Os resultados estáticos permanecem disponíveis se a API não responder.
        });
    }
  }

  campoBusca.addEventListener('input', atualizarSugestoes);
  campoBusca.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      fecharSugestoes();
    } else if (event.key === 'ArrowDown') {
      const primeiroResultado = listaSugestoes.querySelector('.search-result');
      if (primeiroResultado) {
        event.preventDefault();
        primeiroResultado.focus();
      }
    } else if (event.key === 'Enter') {
      const primeiroResultado = listaSugestoes.querySelector('.search-result');
      if (primeiroResultado) window.location.assign(primeiroResultado.href);
    }
  });

  campoBusca.addEventListener('focus', atualizarSugestoes);
  document.addEventListener('click', (event) => {
    if (!caixaBusca.contains(event.target)) fecharSugestoes();
  });
}
