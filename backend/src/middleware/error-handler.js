const { ZodError } = require('zod');
const { HttpError } = require('../utils/http-error');
const { config } = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } });
}

function errorHandler(erro, req, res, next) {
  if (res.headersSent) return next(erro);
  if (erro instanceof ZodError) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Confira os campos enviados.' } });
  }
  if (erro instanceof HttpError) {
    return res.status(erro.status).json({ error: { code: erro.code, message: erro.message } });
  }
  if (erro.code === '23505') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'Já existe um registro com esses dados.' } });
  }
  if (erro.code === '23503') {
    return res.status(404).json({ error: { code: 'RELATED_RECORD_NOT_FOUND', message: 'O item relacionado não foi encontrado.' } });
  }
  console.error('Erro não tratado na API:', erro);
  const message = config.nodeEnv === 'production' ? 'Ocorreu um erro interno.' : erro.message;
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } });
}

module.exports = { notFound, errorHandler };
