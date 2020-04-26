// const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.getAllTours = catchAsync(async (req, res, next) => {
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
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour)
    return next(new AppError(`Cannot find tour with id ${req.params.id}`, 404));
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour)
    return next(new AppError(`Cannot find tour with id ${req.params.id}`, 404));
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour)
    return next(new AppError(`Cannot find tour with id ${req.params.id}`, 404));
  res.status(204).json({
    status: 'success',
    data: {
      tour: null
    }
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
});
