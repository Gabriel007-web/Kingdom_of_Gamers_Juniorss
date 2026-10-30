(() => {
  const grade = document.querySelector('#gameGrid');
  if (!grade || !window.kgjApi) return;

  window.kgjApi.listGames({ status: 'released', limit: 100 })
    .then((jogos) => {
      const cards = [...grade.querySelectorAll('.game-card')];
      jogos.slice(0, cards.length).forEach((jogo, index) => {
        const card = cards[index];
        card.dataset.category = jogo.filtro;
        card.dataset.name = `${jogo.nome} ${jogo.categoria} ${jogo.genero}`.toLocaleLowerCase('pt-BR');

        const capa = card.querySelector('.game-cover');
        capa.className = 'game-cover card-hover cover-api';
        capa.href = `jogo.html?jogo=${encodeURIComponent(jogo.slug)}`;
        const imagem = document.createElement('img');
        imagem.src = jogo.imagem;
        imagem.alt = `Capa de ${jogo.nome}`;
        imagem.loading = 'lazy';
        const selo = document.createElement('span');
        selo.className = 'cover-tag';
        selo.textContent = jogo.featured ? 'DESTAQUE' : 'NOVO';
        const tituloCapa = document.createElement('span');
        tituloCapa.className = 'cover-title';
        tituloCapa.textContent = jogo.nome;
        const plataformaCapa = document.createElement('span');
        plataformaCapa.className = 'cover-platform';
        plataformaCapa.textContent = jogo.plataformas.toLocaleUpperCase('pt-BR');
        capa.replaceChildren(imagem, selo, tituloCapa, plataformaCapa);

        card.querySelector('.game-info h3').textContent = jogo.nome;
        card.querySelector('.game-info p').textContent = window.kgjGameSummaryFor?.(jogo) || jogo.descricao;
        card.querySelector('.price').textContent = jogo.preco;
        card.querySelector('.game-meta span:first-child').textContent = jogo.categoria;
        card.querySelector('.game-meta .rating').textContent = jogo.avaliacao === 'Sem avaliações' ? jogo.avaliacao : `Nota ${jogo.avaliacao}`;
      });
    })
    .catch(() => {
      // Os cards locais continuam sendo exibidos quando o backend está indisponível.
    });
})();
