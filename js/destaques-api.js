(() => {
  if (!window.kgjApi) return;

  const secaoRecentes = document.querySelector('.release-section:not(.upcoming-section)');
  const secaoEmBreve = document.querySelector('.upcoming-section');
  const gradeRecentes = secaoRecentes?.querySelector('.recent-grid');
  const gradeEmBreve = secaoEmBreve?.querySelector('.upcoming-grid');
  const destaqueExistente = secaoRecentes?.querySelector('.release-feature');
  if (!secaoRecentes || !secaoEmBreve || !gradeRecentes || !gradeEmBreve || !destaqueExistente) return;

  const formatarData = (data) => {
    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return 'Data a confirmar';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${data}T00:00:00Z`));
  };
  const preco = (jogo) => jogo.preco || 'A definir';
  const nota = (jogo) => jogo.avaliacao === 'Sem avaliações' ? jogo.avaliacao : `Nota ${jogo.avaliacao}`;
  const linkDoJogo = (jogo, classe) => {
    const link = document.createElement('a');
    link.className = `${classe} card-hover`;
    link.href = `jogo.html?jogo=${encodeURIComponent(jogo.slug)}`;
    return link;
  };

  function criarCardRecente(jogo) {
    const card = linkDoJogo(jogo, 'release-card');
    const imagem = document.createElement('img');
    imagem.src = jogo.imagem;
    imagem.alt = `Capa de ${jogo.nome}`;
    imagem.loading = 'lazy';
    const copy = document.createElement('div');
    copy.className = 'release-card-copy';
    const data = document.createElement('span');
    data.className = 'release-date';
    data.textContent = formatarData(jogo.lancamento);
    const titulo = document.createElement('h3');
    titulo.textContent = jogo.nome;
    const categoria = document.createElement('p');
    categoria.textContent = `${jogo.categoria} / ${jogo.genero}`;
    const meta = document.createElement('div');
    meta.className = 'release-card-meta';
    const plataforma = document.createElement('span');
    plataforma.textContent = jogo.plataformas;
    const avaliacao = document.createElement('span');
    avaliacao.textContent = nota(jogo);
    const valor = document.createElement('strong');
    valor.className = 'release-price';
    valor.textContent = preco(jogo);
    meta.append(plataforma, avaliacao);
    copy.append(data, titulo, categoria);
    if (jogo.slug === 'echoes-of-valoria' || jogo.slug === 'mindshift') {
      const resumo = document.createElement('p');
      resumo.className = 'synopsis-short';
      resumo.textContent = window.kgjGameSummaryFor?.(jogo) || jogo.descricao;
      copy.append(resumo);
    }
    copy.append(meta, valor);
    card.append(imagem, copy);
    return card;
  }

  function criarCardFuturo(jogo) {
    const card = linkDoJogo(jogo, 'upcoming-card');
    const imagemBox = document.createElement('div');
    imagemBox.className = 'upcoming-image';
    const imagem = document.createElement('img');
    imagem.src = jogo.imagem;
    imagem.alt = `Capa de ${jogo.nome}`;
    imagem.loading = 'lazy';
    const selo = document.createElement('span');
    selo.className = 'upcoming-badge';
    selo.textContent = 'LANÇAMENTO PREVISTO';
    imagemBox.append(imagem, selo);
    const copy = document.createElement('div');
    copy.className = 'upcoming-card-copy';
    const data = document.createElement('span');
    data.className = 'release-date';
    data.textContent = formatarData(jogo.lancamento);
    const titulo = document.createElement('h3');
    titulo.textContent = jogo.nome;
    const descricao = document.createElement('p');
    descricao.textContent = window.kgjGameSummaryFor?.(jogo) || jogo.descricao;
    const meta = document.createElement('div');
    meta.className = 'release-card-meta';
    const categoria = document.createElement('span');
    categoria.textContent = `${jogo.categoria} / ${jogo.genero}`;
    const plataforma = document.createElement('span');
    plataforma.textContent = jogo.plataformas;
    const valor = document.createElement('strong');
    valor.className = 'release-price';
    valor.textContent = preco(jogo);
    meta.append(categoria, plataforma);
    copy.append(data, titulo, descricao, meta, valor);
    card.append(imagemBox, copy);
    return card;
  }

  function criarDestaque(jogo) {
    const destaque = linkDoJogo(jogo, 'release-feature');
    const imagemBox = document.createElement('div');
    imagemBox.className = 'release-feature-image';
    const imagem = document.createElement('img');
    imagem.src = jogo.imagem;
    imagem.alt = `Capa de ${jogo.nome}`;
    const selo = document.createElement('span');
    selo.className = 'release-badge';
    selo.textContent = jogo.slug === 'neon-requiem' ? 'DESTAQUE K.G.J.' : 'LANÇAMENTO RECENTE';
    imagemBox.append(imagem, selo);
    const copy = document.createElement('div');
    copy.className = 'release-feature-copy';
    const data = document.createElement('span');
    data.className = 'release-date';
    data.textContent = jogo.slug === 'neon-requiem'
      ? 'Disponível na K.G.J.'
      : `Disponível desde ${formatarData(jogo.lancamento)}`;
    const titulo = document.createElement('h3');
    titulo.textContent = jogo.nome;
    const descricao = document.createElement('p');
    descricao.textContent = window.kgjGameSummaryFor?.(jogo) || jogo.descricao;
    const meta = document.createElement('div');
    meta.className = 'release-card-meta';
    [jogo.categoria, jogo.plataformas, nota(jogo)].forEach((texto) => {
      const item = document.createElement('span');
      item.textContent = texto;
      meta.append(item);
    });
    const valor = document.createElement('strong');
    valor.className = 'release-price';
    valor.textContent = preco(jogo);
    copy.append(data, titulo, descricao, meta, valor);
    destaque.append(imagemBox, copy);
    return destaque;
  }

  Promise.all([window.kgjApi.getFeatured(), window.kgjApi.getRecent(), window.kgjApi.getUpcoming()])
    .then(([featured, recent, upcoming]) => {
      if (!recent.length && !upcoming.length && !featured.length) return;

      const neonDaApi = featured.find((jogo) => jogo.slug === 'neon-requiem');
      const neonLocal = (window.jogosAdicionaisKgj || []).find((jogo) => jogo.slug === 'neon-requiem');
      const hero = neonDaApi || neonLocal || featured[0] || recent[0];
      const recentesRestantes = recent.filter((jogo) => jogo.slug !== hero?.slug);
      const echoes = featured.find((jogo) => jogo.slug === 'echoes-of-valoria')
        || recent.find((jogo) => jogo.slug === 'echoes-of-valoria')
        || (window.jogosAdicionaisKgj || []).find((jogo) => jogo.slug === 'echoes-of-valoria');
      if (echoes && echoes.slug !== hero?.slug && !recentesRestantes.some((jogo) => jogo.slug === echoes.slug)) {
        recentesRestantes.push(echoes);
      }
      const mindshift = featured.find((jogo) => jogo.slug === 'mindshift')
        || recent.find((jogo) => jogo.slug === 'mindshift')
        || (window.jogosAdicionaisKgj || []).find((jogo) => jogo.slug === 'mindshift');
      if (mindshift && mindshift.slug !== hero?.slug && !recentesRestantes.some((jogo) => jogo.slug === mindshift.slug)) {
        recentesRestantes.push(mindshift);
      }
      if (hero) destaqueExistente.replaceWith(criarDestaque(hero));
      else destaqueExistente.remove();
      gradeRecentes.replaceChildren(...recentesRestantes.map(criarCardRecente));
      gradeEmBreve.replaceChildren(...upcoming.map(criarCardFuturo));
    })
    .catch(() => {
      // Mantém a seleção estática caso o banco ainda não tenha sido configurado.
    });
})();
