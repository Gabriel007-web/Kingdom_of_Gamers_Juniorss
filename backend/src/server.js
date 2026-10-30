const { app } = require('./app');
const { config, validateConfig } = require('./config/env');
const { pool } = require('./db/pool');

validateConfig();

const server = app.listen(config.port, () => {
  console.info(`K.G.J. API disponível em http://localhost:${config.port}/api`);
});

async function shutdown(signal) {
  console.info(`Recebido ${signal}; encerrando a API...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
