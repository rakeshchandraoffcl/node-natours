const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router();

// param middleware
// only run when the specify route is present in the url

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.topFIveCheap, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protected, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protected,
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

module.exports = router;
