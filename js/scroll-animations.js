(() => {
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const seletoresDeRolagem = [
    '.game-card', '.filter-chip', '.section-heading', '.creator-banner', '.home-contact-cta',
    '.catalog-heading', '.catalog-card', '.release-section-heading', '.release-feature',
    '.release-card', '.upcoming-card', '.account-card', '.game-detail-art', '.game-detail-copy',
    '.contact-hero', '.contact-panel', '.help-link', '.contact-faq > div', '.faq-item',
    '.contact-notices article',
  ].join(',');

  if (movimentoReduzido.matches || !('IntersectionObserver' in window)) return;

  const elementosDeRolagem = document.querySelectorAll(seletoresDeRolagem);
  if (!elementosDeRolagem.length) return;

  const observador = new IntersectionObserver((entradas, observadorAtual) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('scroll-reveal-visible');
      observadorAtual.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -48px 0px', threshold: 0.04 });

  elementosDeRolagem.forEach((elemento) => {
    elemento.classList.add('scroll-reveal');
    observador.observe(elemento);
  });

  movimentoReduzido.addEventListener?.('change', (evento) => {
    if (!evento.matches) return;
    observador.disconnect();
    elementosDeRolagem.forEach((elemento) => elemento.classList.add('scroll-reveal-visible'));
  });
})();
