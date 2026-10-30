const filterButtons = document.querySelectorAll('.filter-chip');
const cards = [...document.querySelectorAll('.game-card')];
const searchInput = document.querySelector('#gameSearch');
const emptyState = document.querySelector('#emptyState');
let activeFilter = 'todos';

function updateGames() {
  const query = searchInput.value.trim().toLocaleLowerCase('pt-BR');
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesCategory = activeFilter === 'todos' || card.dataset.category === activeFilter;
    const searchable = `${card.dataset.name} ${card.textContent}`.toLocaleLowerCase('pt-BR');
    const matchesSearch = !query || searchable.includes(query);
    const visible = matchesCategory && matchesSearch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    updateGames();
  });
  button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
});

searchInput.addEventListener('input', updateGames);

