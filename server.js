const dotenv = require('dotenv');
const mongoose = require('mongoose');

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

const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
