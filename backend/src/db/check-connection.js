const { validateConfig } = require('../config/env');
const { pool } = require('./pool');

async function checkConnection() {
  validateConfig();
  const result = await pool.query('SELECT 1 AS database_connection_ok');
  console.info(`Conexao PostgreSQL confirmada; consulta retornou ${result.rows[0].database_connection_ok}.`);
}

checkConnection()
  .catch((erro) => {
    const detalhe = erro.code || erro.message || String(erro);
    console.error('Falha na conexao PostgreSQL ou na consulta:', detalhe);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
