const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { validateConfig } = require('../src/config/env');
const { pool } = require('../src/db/pool');

const jogosBase = [
  { slug: 'mare-de-papel', nome: 'Maré de Papel', categoria: 'Aventura', filtro: 'aventura', genero: 'Exploração', descricao: 'Um mundo dobrado à mão, cheio de caminhos para descobrir.', plataformas: 'PC · Mac', preco: 'R$ 24,90', avaliacao: '4,8', imagem: 'assets/capa-mare.svg', lancamento: '2026-09-23', destaque: true },
  { slug: 'neon-na-veia', nome: 'Neon na Veia', categoria: 'Ação', filtro: 'acao', genero: 'Arcade', descricao: 'Corra, enfrente as ondas e tente mais uma vez.', plataformas: 'PC · Linux', preco: 'R$ 32,00', avaliacao: '4,9', imagem: 'assets/capa-neon.svg', lancamento: '2026-09-12', destaque: true },
  { slug: 'jardim-de-outro-mundo', nome: 'Jardim de Outro Mundo', categoria: 'Relax', filtro: 'relax', genero: 'Simulação', descricao: 'Plante memórias, cultive um refúgio e colha estrelas.', plataformas: 'PC · Switch', preco: 'R$ 18,50', avaliacao: '4,7', imagem: 'assets/capa-jardim.svg', lancamento: '2026-08-29' },
  { slug: 'depois-das-seis', nome: 'Depois das Seis', categoria: 'Puzzle', filtro: 'puzzle', genero: 'Enigma', descricao: 'Pequenos enigmas para transformar o fim do dia.', plataformas: 'PC · Mac', preco: 'R$ 21,90', avaliacao: '4,6', imagem: 'assets/capa-seis.svg', lancamento: '2026-08-08' },
  { slug: 'a-ultima-aurora', nome: 'A Última Aurora', categoria: 'Aventura', filtro: 'aventura', genero: 'Exploração', descricao: 'Explore um mundo no crepúsculo e descubra o que resta depois da última luz.', plataformas: 'PC · Mac', preco: 'A divulgar', avaliacao: 'Em breve', imagem: 'assets/capa-ultima-aurora.svg', lancamento: '2026-10-30', status: 'upcoming' },
  { slug: 'ruinas-de-vertice', nome: 'Ruínas de Vértice', categoria: 'Puzzle', filtro: 'puzzle', genero: 'Aventura', descricao: 'Resolva os enigmas de uma cidade esquecida e atravesse seus portais.', plataformas: 'PC', preco: 'A divulgar', avaliacao: 'Em breve', imagem: 'assets/capa-ruinas-vertice.svg', lancamento: '2026-11-20', status: 'upcoming' },
];

function readStaticGames() {
  const sourcePath = path.resolve(__dirname, '../../js/jogos-adicionais.js');
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(sourcePath, 'utf8'), context, { timeout: 1000 });
  return [...jogosBase, ...context.window.jogosAdicionaisKgj];
}

function priceInCents(value) {
  const match = /^R\$\s*(\d+),(\d{2})$/.exec(value || '');
  return match ? Number(match[1]) * 100 + Number(match[2]) : null;
}

async function seed() {
  validateConfig();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const jogos = readStaticGames();
    for (const jogo of jogos) {
      const categorySlug = jogo.filtro || 'acao';
      const category = await client.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [jogo.categoria || 'Ação', categorySlug],
      );
      const cents = priceInCents(jogo.preco);
      await client.query(
        `INSERT INTO games (slug, name, description, category_id, genre, platforms, price_cents, price_label,
          rating_override, cover_image, release_date, release_status, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
          category_id = EXCLUDED.category_id, genre = EXCLUDED.genre, platforms = EXCLUDED.platforms,
          price_cents = EXCLUDED.price_cents, price_label = EXCLUDED.price_label,
          rating_override = EXCLUDED.rating_override, cover_image = EXCLUDED.cover_image,
          release_date = EXCLUDED.release_date, release_status = EXCLUDED.release_status,
          is_featured = EXCLUDED.is_featured, updated_at = NOW()`,
        [jogo.slug, jogo.nome, jogo.descricao, category.rows[0].id, jogo.genero || '',
          (jogo.plataformas || 'A confirmar').split(' · '), cents, cents === null ? (jogo.preco || 'A definir') : null,
          /^\d(?:,\d)?$/.test(jogo.avaliacao || '') ? Number(jogo.avaliacao.replace(',', '.')) : null,
          jogo.imagem || '', jogo.lancamento && /^\d{4}-\d{2}-\d{2}$/.test(jogo.lancamento) ? jogo.lancamento : null,
          jogo.status || 'released', Boolean(jogo.destaque)],
      );
    }
    await client.query('COMMIT');
    const slugs = jogos.map((jogo) => jogo.slug);
    const verificacao = await client.query(
      'SELECT COUNT(*)::int AS total FROM games WHERE slug = ANY($1::text[])',
      [slugs],
    );
    const totalRegistrado = verificacao.rows[0].total;
    if (totalRegistrado !== jogos.length) {
      throw new Error(`Verificacao incompleta: esperados ${jogos.length} jogos, encontrados ${totalRegistrado}.`);
    }
    const porCategoria = await client.query(
      `SELECT categories.name, COUNT(*)::int AS total
       FROM games
       JOIN categories ON categories.id = games.category_id
       WHERE games.slug = ANY($1::text[])
       GROUP BY categories.name
       ORDER BY categories.name`,
      [slugs],
    );
    console.info(`${totalRegistrado} jogos confirmados no PostgreSQL apos a carga.`);
    for (const categoria of porCategoria.rows) {
      console.info(`  ${categoria.name}: ${categoria.total}`);
    }
    console.info(`${jogos.length} jogos importados/atualizados a partir do catálogo atual.`);
  } catch (erro) {
    await client.query('ROLLBACK').catch(() => {});
    throw erro;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((erro) => {
  console.error('Não foi possível importar os jogos:', erro.message);
  process.exitCode = 1;
});
