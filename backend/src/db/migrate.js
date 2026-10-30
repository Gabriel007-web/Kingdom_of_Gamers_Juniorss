const fs = require('node:fs/promises');
const path = require('node:path');
const { validateConfig } = require('../config/env');
const { pool } = require('./pool');

async function runMigrations() {
  validateConfig();
  const directory = path.join(__dirname, 'migrations');
  const files = (await fs.readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
  const client = await pool.connect();

  try {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    for (const file of files) {
      const existing = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
      if (existing.rowCount) continue;

      await client.query('BEGIN');
      try {
        const sql = await fs.readFile(path.join(directory, file), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.info(`Migração aplicada: ${file}`);
      } catch (erro) {
        await client.query('ROLLBACK');
        throw erro;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((erro) => {
  console.error('Não foi possível aplicar as migrações:', erro.message);
  process.exitCode = 1;
});
