const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const sendMail = require('../utils/email');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// ############################### UTILS STARTS ##################################
const createJWT = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const sendCookie = (res, cookieInfo) => {
  const options = {
    expires: cookieInfo.expires,
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') options.secure = true;
  res.cookie(cookieInfo.name, cookieInfo.value, options);
};
// ############################### UTILS ENDS ##################################

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });
  const { name, email, photo, _id } = newUser;
  const token = createJWT(_id);
  sendCookie(res, {
    name: 'jwt',
    value: token,
    expires: new Date(
      Date.now + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  });
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: _id,
        name,
        email,
        photo
      }
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('email and password required', 400));
  }
  const user = await User.findOne({ email }).select('+password'); // [model > password > {select: false}]
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 403));
  }

  const token = createJWT(user.id);
  sendCookie(res, {
    name: 'jwt',
    value: token,
    expires: new Date(
      Date.now + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  });

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protected = catchAsync(async (req, res, next) => {
  let token;
  // CHECK WEATHER TOKEN EXISTS OR NOT
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // console.log(token);
  if (!token) return next(new AppError('You are not logged in, 401'));
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decode);

  // CHECK WEATHER USER EXISTS OR NOT
  const freshUser = await User.findById(decode.id);
  if (!freshUser)
    return next(
      new AppError('The user belongs to the token does not exist', 401)
    );

  // CHECK WEATHER USER CHANGED PASSWORD AFTER TOKEN ISSUED
  if (freshUser.passwordChanged(decode.iat)) {
    return next(new AppError('User changed the password', 401));
  }

  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('You have not permisiion for this task', 403));
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user exists with this email', 404));
  const token = user.setToken();
  await user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.get('host')}/api/v1/users/${token}`;
  const message = `Send a patch request to ${url} to reset your password`;

  try {
    await sendMail({
      to: user.email,
      subject: 'Password reset token (valid for 10 mins)',
      message
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExipersAt = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error);
    next(new AppError('Unable to send reset token', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExipersAt: { $gt: Date.now() }
  });
  if (!user)
    return next(new AppError('User does not exist or token expired', 400));

  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExipersAt = undefined;
  await user.save();
  const jwtToken = createJWT(user.id);
  sendCookie(res, {
    name: 'jwt',
    value: jwtToken,
    expires: new Date(
      Date.now + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  });

  res.status(200).json({
    status: 'success',
    token: jwtToken
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { email } = req.user;
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!oldPassword || !(await user.comparePassword(oldPassword, user.password)))
    return next(new AppError('Password not matched', 401));
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  const jwtToken = createJWT(user.id);
  sendCookie(res, {
    name: 'jwt',
    value: jwtToken,
    expires: new Date(
      Date.now + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  });

  res.status(200).json({
    status: 'success',
    token: jwtToken
  });
});
