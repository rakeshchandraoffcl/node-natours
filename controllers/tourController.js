// const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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

exports.topFIveCheap = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // 🔥 EXECUTE QUERY OBJECT 🔥
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limit()
      .pagination();
    const tours = await features.queryForDocument;

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
    // console.log(error.message);
    res.status(404).json({
      status: 'fail',
      message: error.message
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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          // 🧠 filter by id 🧠
          // _id: { $eq: new mongoose.Types.ObjectId('5e9be6002b33662748ba67c9') }
          ratingsAverage: { $gte: 4.5 }
        }
      },
      {
        $group: {
          _id: '$ratingsAverage',
          count: { $sum: 1 },
          totalRatingsQuantity: { $sum: '$ratingsQuantity' },
          averageRating: { $avg: '$ratingsAverage' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
      // 🧠 add field 🧠
      // {
      //   $addFields: {
      //     round: { $round: ['$averageRating', 0] }
      //   }
      // }
      // 🧠 Remove field 🧠
      // { $unset: ['averageRating'] }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const { year } = req.params;
    const stats = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          counts: { $sum: 1 },
          names: { $push: '$name' }
        }
      },
      {
        $addFields: {
          month: '$_id'
        }
      },
      {
        $sort: {
          counts: -1
        }
      },
      {
        $limit: 12
      },
      {
        $project: {
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      length: stats.length,
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};
