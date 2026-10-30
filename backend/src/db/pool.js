const { Pool } = require('pg');
const { config } = require('../config/env');

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.databaseSsl ? { rejectUnauthorized: true } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (erro) => {
  console.error('Falha inesperada em uma conexão ociosa com PostgreSQL:', erro.message);
});

module.exports = { pool };
