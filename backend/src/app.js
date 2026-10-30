const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { config } = require('./config/env');
const { HttpError } = require('./utils/http-error');
const { verifyRequestOrigin } = require('./middleware/request-origin');
const { notFound, errorHandler } = require('./middleware/error-handler');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.frontendOrigins.includes(origin)) return callback(null, true);
    return callback(new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'Origem não autorizada.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use('/api', verifyRequestOrigin);
app.use('/api', require('./routes'));
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
