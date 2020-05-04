const Apperror = require('../utils/appError');

const developmentError = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    error,
    message: error.message,
    stack: error.stack
  });
};
const productionError = (res, error) => {
  // 🧠 error.isOperational = true [ Known error & handled by developer] 🧠
  // 🧠  error.isOperational = false [ error from unknown source and dont expose the error to real user ] 🧠

  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  } else {
    // 1) Log error
    console.error('🐛 Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// DB ERROR

const handleCastErrorDb = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new Apperror(message, 400);
};
const handleValidationErrorDb = err => {
  const message = Object.values(err.errors).map(e => e.message);
  return new Apperror(message.join('. '), 400);
};
const handleDuplicateEntryDB = err => {
  const val = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  console.log(val);
  const message = `Duplicate value ${val}, please use another one`;
  return new Apperror(message, 400);
};

const JsonWebTokenError = () =>
  new Apperror('Invalid token, please log in again', 401);

const tokenExpiredError = () =>
  new Apperror('Token expired, please log in again', 401);
const timeOut = () => new Apperror('Response timeout', 503);

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
    developmentError(res, error);
  } else {
    let err = { ...error };
    if (err.name === 'CastError') {
      err = handleCastErrorDb(err);
    }
    if (err.name === 'ValidationError') {
      err = handleValidationErrorDb(err);
    }
    if (err.code === 11000) {
      err = handleDuplicateEntryDB(err);
    }
    if (err.name === 'JsonWebTokenError') {
      err = JsonWebTokenError();
    }
    if (err.name === 'TokenExpiredError') {
      err = tokenExpiredError();
    }
    if (err.code === 'ETIMEDOUT') {
      err = timeOut();
    }
    productionError(res, err);
  }
};
