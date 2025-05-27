const mongoose = require('mongoose');
require('dotenv').config();

// Get the MongoDB URI from environment variabless

const uri = process.env.MONGO_URI;







// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.ymxhhg7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


// Connect to MongoDB
console.log(uri);
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });
