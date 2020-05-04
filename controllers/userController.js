const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// ########################### UTILS AREA STARTS ############################

const filterInfo = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach(k => {
    if (fields.includes(k)) newObj[k] = obj[k];
  });
  return newObj;
};
// ########################### UTILS AREA ENDS ############################

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-__v');
  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // CHECK WEATHER THE BODY CONTAINS PASSWORD RELATED
  if (req.body.password || req.body.passwodConfirm)
    return next(
      new AppError(
        'This route is not for password update. Please use /update-my-password',
        400
      )
    );

  const updateData = filterInfo(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    daa: null
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
