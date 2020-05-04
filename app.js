const express = require('express');
const hpp = require('hpp');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const timeout = require('connect-timeout');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// SET HTTP SECURITY HEADER
app.use(helmet());

// RESPONSE TIMEOUT
app.use(timeout('10s'));

// function haltOnTimedout(req, res, next) {
//   if (!req.timedout) return next();
// }

// LIMIT NUMBER OF REQUESTS
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 60 * 1000,
  message: 'Too many request'
});

app.use('/api', limiter);

// SET NODE_ENV
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ADD REQUEST BODY TO <req.body> AND LIMIT SIZE OF INCOMING DATA
app.use(express.json({ limit: '10kb' }));

// SANITIZE DATA AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());
// SANITIZE DATA AGAINST XSS
app.use(xss());
// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
      'difficulty'
    ]
  })
);

// SERVER STATIC FILE
app.use(express.static(`${__dirname}/public`));

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server`, 404));
});

// app.use(haltOnTimedout);

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);
console.log(process.env.NODE_ENV);

module.exports = app;
