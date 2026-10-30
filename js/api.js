(() => {
  // Mantém a capa oficial do jogo em um único ponto do frontend.
  const capasOficiais = Object.freeze({
    'coracao-de-sucata': 'assets/capa-coracao-sucata.png',
    'neon-requiem': 'assets/capa-neon-requiem.jpg',
    'echoes-of-valoria': 'assets/capa-echoes-of-valoria.jpg',
    'mindshift': 'assets/capa-mindshift.jpg',
  });
  const resumosCurtos = Object.freeze({
    'echoes-of-valoria': 'Acompanhe Elian por ruínas do antigo reino enquanto investiga ecos ligados ao desaparecimento da Canção de Valoria.',
    'mindshift': 'Resolva enigmas, manipule padrões e explore salas onde nem tudo é o que parece.',
  });
  const normalizarSlug = (game = {}) => {
    const identificador = game.slug || game.name || game.nome || '';
    return String(identificador).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };
  const resolverDescricao = (game = {}) => {
    const slug = normalizarSlug(game);
    if (slug === 'mindshift') {
      const jogoLocal = (window.jogosAdicionaisKgj || []).find((jogo) => jogo.slug === slug);
      if (jogoLocal?.descricao) return jogoLocal.descricao;
    }
    return game.description || game.descricao || '';
  };
  const resolverCapa = (game = {}) => capasOficiais[normalizarSlug(game)]
    || game.coverImage || game.cover_image || game.imagem || '';
  const resolverResumoCurto = (game = {}) => {
    const slug = typeof game === 'string' ? game : normalizarSlug(game);
    return resumosCurtos[slug] || (typeof game === 'string'
      ? ''
      : game.shortDescription || game.short_description || game.description || game.descricao || '');
  };
  window.kgjResolveGameCover = resolverCapa;
  window.kgjGameSummaryFor = resolverResumoCurto;

  const localHosts = ['localhost', '127.0.0.1'];
  const localApiUrl = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api'
    : `${window.location.protocol}//${window.location.hostname}:3000/api`;
  const baseUrl = window.KGJ_API_BASE || (localHosts.includes(window.location.hostname)
    ? localApiUrl
    : '/api');

  function adaptarJogo(game) {
    const price = game.priceCents === null || game.priceCents === undefined
      ? (game.priceLabel || 'A definir')
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(game.priceCents / 100);
    const rating = game.rating === null || game.rating === undefined
      ? 'Sem avaliações'
      : Number(game.rating).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const platforms = Array.isArray(game.platforms) ? game.platforms.join(' · ') : (game.platforms || 'A confirmar');
    const categoryName = game.category?.name || game.categoryName || 'Outros';
    const categorySlug = game.category?.slug || game.categorySlug || 'outros';

    return {
      ...game,
      nome: game.name,
      descricao: resolverDescricao(game),
      descricaoCurta: resolverResumoCurto(game),
      categoria: categoryName,
      filtro: categorySlug,
      genero: game.genre || '',
      plataformas: platforms,
      preco: price,
      avaliacao: rating,
      nota: rating,
      imagem: resolverCapa(game),
      lancamento: game.releaseDate || 'Data a confirmar',
      statusLancamento: game.releaseStatus,
    };
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        credentials: 'include',
        signal: options.signal || controller.signal,
      });
    } finally {
      window.clearTimeout(timeout);
    }
    const result = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      const error = new Error(result?.error?.message || 'Não foi possível conectar à API K.G.J.');
      error.status = response.status;
      error.code = result?.error?.code;
      throw error;
    }
    return result?.data;
  }

  function queryString(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value);
    });
    const serialized = search.toString();
    return serialized ? `?${serialized}` : '';
  }

  window.kgjApi = {
    baseUrl,
    request,
    async listGames(params) { return (await request(`/games${queryString(params)}`)).map(adaptarJogo); },
    async searchGames(query) { return (await this.listGames({ q: query, limit: 8 })).map(adaptarJogo); },
    async getGame(slug) { return adaptarJogo(await request(`/games/${encodeURIComponent(slug)}`)); },
    async getFeatured() { return (await request('/games/featured')).map(adaptarJogo); },
    async getRecent() { return (await request('/games/recent')).map(adaptarJogo); },
    async getUpcoming() { return (await request('/games/upcoming')).map(adaptarJogo); },
    listCategories() { return request('/categories'); },
    register(data) { return request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); },
    login(data) { return request('/auth/login', { method: 'POST', body: JSON.stringify(data) }); },
    logout() { return request('/auth/logout', { method: 'POST' }); },
    getCurrentUser() { return request('/users/me'); },
    async getLibrary() {
      const games = await request('/library');
      return games.map((game) => ({
        ...game,
        descricao: resolverDescricao(game),
        imagem: resolverCapa(game),
        cover_image: resolverCapa(game),
        descricaoCurta: resolverResumoCurto(game),
      }));
    },
    addToLibrary(slug) { return request(`/library/${encodeURIComponent(slug)}`, { method: 'POST' }); },
    getWishlist() { return request('/wishlist'); },
    addToWishlist(slug) { return request(`/wishlist/${encodeURIComponent(slug)}`, { method: 'POST' }); },
    removeFromWishlist(slug) { return request(`/wishlist/${encodeURIComponent(slug)}`, { method: 'DELETE' }); },
    submitReview(slug, data) { return request(`/games/${encodeURIComponent(slug)}/reviews`, { method: 'POST', body: JSON.stringify(data) }); },
    listReviews(slug) { return request(`/games/${encodeURIComponent(slug)}/reviews`); },
    sendContact(data) { return request('/contact', { method: 'POST', body: JSON.stringify(data) }); },
  };
})();
