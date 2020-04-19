const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const tourSchema = new Schema({
  name: {
    type: String,
    required: [true, 'A <name> must be required'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'A <duration> must be required']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A <maxGroupSize> must be required']
  },
  difficulty: {
    type: String,
    required: [true, 'A <difficulty> must be required']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A <price> must be required']
  },
  priceDiscount: {
    type: Number
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A <summary> must be required']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    trim: true,
    required: [true, 'A <imageCover> must be required']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date]
});
const Tour = model('Tour', tourSchema);

module.exports = Tour;
