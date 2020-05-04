const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);
router
  .route('/update-my-password')
  .patch(authController.protected, authController.updatePassword);
router
  .route('/update-my-info')
  .patch(authController.protected, userController.updateMe);
router
  .route('/delete-me')
  .delete(authController.protected, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
