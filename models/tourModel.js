const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema, model } = mongoose;
const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A <name> must be required'],
      unique: true,
      trim: true,
      maxlength: [40, 'max 40 characters allowed'],
      minlength: [10, 'min 40 characters required']
    },
    slug: String,
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
      required: [true, 'A <difficulty> must be required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty should be <easy> or <medium> or <difficult>'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'should be between 1 to 5'],
      max: [5, 'should be between 1 to 5']
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
      type: Number,
      validate: {
        validator: function(val) {
          return val <= this.price;
        },
        message: '<priceDiscount> ({VALUE}) should be less than price'
      }
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
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// VIRTUAL PROPERTIES
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
tourSchema.pre('save', function(next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.post(/^find/, async function(doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(doc);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = model('Tour', tourSchema);

module.exports = Tour;
