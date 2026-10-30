const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  databaseSsl: process.env.DATABASE_SSL === 'true',
  sessionTtlDays: Number.parseInt(process.env.SESSION_TTL_DAYS || '7', 10),
  frontendOrigins: (process.env.FRONTEND_ORIGINS || 'http://127.0.0.1:5500,http://localhost:5500')
    .split(',').map((origin) => origin.trim()).filter(Boolean),
  contactRateLimit: Number.parseInt(process.env.CONTACT_RATE_LIMIT || '5', 10),
  get secureCookies() { return this.nodeEnv === 'production'; },
};

function validateConfig() {
  if (!Number.isInteger(config.database.port) || config.database.port < 1 || config.database.port > 65535) {
    throw new Error('DATABASE_PORT precisa ser uma porta valida.');
  }
  const faltantes = [
    ['DATABASE_NAME', config.database.name],
    ['DATABASE_USER', config.database.user],
    ['DATABASE_PASSWORD', config.database.password],
  ].filter(([, value]) => value === undefined || value === '').map(([name]) => name);
  if (faltantes.length) throw new Error(`Defina no backend/.env: ${faltantes.join(', ')}.`);
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error('PORT precisa ser uma porta válida.');
  }
}

module.exports = { config, validateConfig };
