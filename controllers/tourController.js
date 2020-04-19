const Tour = require('../models/tourModel');

// ⛳ check id middleware ⛳

// exports.checkID = (req, res, next, val) => {
//   // console.log(`Tour id is: ${val}`);
//   // if (req.params.id * 1 > tours.length) {
//   return res.status(404).json({
//     status: 'fail',
//     message: 'Invalid ID'
//   });
//   // }
//   // next();
// };

exports.getAllTours = async (req, res) => {
  try {
    // CREATE A COPY
    const queryObj = { ...req.query };
    // EXCLUDE FIELDS
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // EXCLUDE FROM QUERY OBJECT
    excludeFields.forEach(field => delete queryObj[field]);
    console.log(queryObj);

    // 🔥 BUILD QUERY OBJECT 🔥
    const query = Tour.find(queryObj);

    // 🔥 EXECUTE QUERY OBJECT 🔥
    const tours = await query;

    // 🔥 SEND RESPONSE 🔥
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.createTour = async (req, res) => {
  // console.log(req.body);
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newTour
      }
    });
  } catch (error) {
    // 🧠 400 - bad request
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: {
        tour: null
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
