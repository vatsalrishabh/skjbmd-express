const mongoose = require('mongoose');
require('dotenv').config();

// Get the MongoDB URI from environment variables

const uri = process.env.MONGO_URI;
// const uri = "mongodb://mongo:wGZewZq7JmJlncte@195.250.30.251:27017/Dklean?tls=false&authSource=admin";
// const uri ="mongodb://mongo:p1dcxlHBWZVdvWHh@198.38.87.182:27017/?tls=false&authSource=admin";

// const uri = process.env.MONGO_URI;
// const uri = "mongodb://dkleanhealthcare_dkleandbuser:agLrP7x!5@198.38.87.182:27017/dkleanhealthcare_dkleandb";

// const uri = "mongodb://dkleanhealthcare_dkleandbuser:agLrP7x!5@localhost:27017/dkleanhealthcare_dkleandb";



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
