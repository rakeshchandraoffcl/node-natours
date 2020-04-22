const express = require('express');
const tourController = require('./../controllers/tourController');

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
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
