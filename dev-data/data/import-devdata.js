const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const db = process.env.LOCAL_DATABASE_URL;

mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  // eslint-disable-next-line no-unused-vars
  .then(conn => {
    console.log('DB connected');
  })
  .catch(err => console.log(err));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA
const importTourData = async () => {
  try {
    await Tour.create(tours);
    console.log('import completed');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// DELETE DATA
const deleteTourData = async () => {
  try {
    await Tour.deleteMany();
    console.log('delete completed');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

switch (process.argv[2]) {
  case '--import':
    importTourData();
    break;
  case '--delete':
    deleteTourData();
    break;

  default:
    console.log('Invalid options');
    process.exit();
}
