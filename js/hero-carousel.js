(() => {
  const destaque = document.querySelector('.hero-feature');
  const imagem = document.querySelector('#heroGameImage');
  const titulo = document.querySelector('#featuredGameTitle');
  const genero = document.querySelector('#heroGameGenre');
  const categoria = document.querySelector('#heroGameCategory');
  const avaliacao = document.querySelector('#heroGameRating');
  const preco = document.querySelector('#heroGamePrice');
  const link = document.querySelector('#heroFeatureLink');
  const contador = document.querySelector('#heroCarouselCounter');
  const anterior = document.querySelector('#heroCarouselPrevious');
  const proximo = document.querySelector('#heroCarouselNext');
  if (!destaque || !imagem || !titulo || !link || !contador || !anterior || !proximo) return;

  const ordemDosDestaques = ['coracao-de-sucata', 'neon-requiem', 'echoes-of-valoria', 'mindshift'];
  const jogosDisponiveis = window.jogosAdicionaisKgj || [];
  let slides = ordemDosDestaques
    .map((slug) => jogosDisponiveis.find((jogo) => jogo.slug === slug))
    .filter(Boolean);
  if (!slides.length) return;

  const preferenciaMovimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  let indiceAtual = 0;
  let temporizador = null;
  let temporizadorTransicao = null;
  let pausado = false;

  const limparTemporizador = () => {
    if (temporizador !== null) window.clearTimeout(temporizador);
    temporizador = null;
  };

  function podeAvancarAutomaticamente() {
    return !preferenciaMovimentoReduzido.matches && !pausado && !document.hidden;
  }

  function agendarProximo() {
    limparTemporizador();
    if (!podeAvancarAutomaticamente() || slides.length < 2) return;
    temporizador = window.setTimeout(() => mudarSlide(1), 6500);
  }

  function exibirSlide(jogo) {
    const imagemOficial = window.kgjResolveGameCover?.(jogo) || jogo.imagem || '';
    const plataforma = jogo.plataformas || 'A confirmar';
    imagem.src = imagemOficial;
    imagem.dataset.gameSlug = jogo.slug;
    imagem.alt = `Capa de ${jogo.nome}`;
    titulo.textContent = jogo.nome;
    if (genero) genero.textContent = (jogo.genero || jogo.categoria || 'Jogo independente').toLocaleUpperCase('pt-BR');
    if (categoria) categoria.textContent = `${jogo.categoria || 'Outros'} · ${plataforma}`.toLocaleUpperCase('pt-BR');
    if (avaliacao) avaliacao.textContent = jogo.avaliacao || 'Sem avaliações';
    if (preco) preco.textContent = jogo.preco || 'A definir';
    link.href = `jogo.html?jogo=${encodeURIComponent(jogo.slug)}`;
    link.setAttribute('aria-label', `Ver jogo ${jogo.nome}`);
    contador.textContent = `${String(indiceAtual + 1).padStart(2, '0')} — ${String(slides.length).padStart(2, '0')}`;
  }

  function mudarSlide(direcao) {
    limparTemporizador();
    indiceAtual = (indiceAtual + direcao + slides.length) % slides.length;
    window.clearTimeout(temporizadorTransicao);
    const atraso = preferenciaMovimentoReduzido.matches ? 0 : 140;
    destaque.classList.add('hero-slide-changing');
    temporizadorTransicao = window.setTimeout(() => {
      exibirSlide(slides[indiceAtual]);
      destaque.classList.remove('hero-slide-changing');
      agendarProximo();
    }, atraso);
  }

  anterior.addEventListener('click', (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    mudarSlide(-1);
  });
  proximo.addEventListener('click', (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    mudarSlide(1);
  });
  destaque.addEventListener('mouseenter', () => { pausado = true; limparTemporizador(); });
  destaque.addEventListener('mouseleave', () => { pausado = false; agendarProximo(); });
  destaque.addEventListener('focusin', () => { pausado = true; limparTemporizador(); });
  destaque.addEventListener('focusout', (evento) => {
    if (!destaque.contains(evento.relatedTarget)) {
      pausado = false;
      agendarProximo();
    }
  });
  document.addEventListener('visibilitychange', agendarProximo);
  preferenciaMovimentoReduzido.addEventListener?.('change', agendarProximo);

  exibirSlide(slides[indiceAtual]);
  agendarProximo();

  // Quando a API estiver disponível, substitui os dados locais pelos dados oficiais do cadastro.
  if (window.kgjApi) {
    window.kgjApi.listGames({ limit: 100 })
      .then((jogosApi) => {
        const porSlug = new Map(jogosApi.map((jogo) => [jogo.slug, jogo]));
        slides = slides.map((jogo) => ({ ...jogo, ...(porSlug.get(jogo.slug) || {}) }));
        exibirSlide(slides[indiceAtual]);
        agendarProximo();
      })
      .catch(() => {
        // Os dados locais mantêm o carrossel disponível quando a API não responde.
      });
  }
})();
