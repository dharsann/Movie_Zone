// Import the MongoDB client
const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Atlas connection string
const uri = process.env.MONGODB_URI;

// Function to connect to the MongoDB cluster and return a reference to the 'users' collection
async function connectToDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect the client to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Access the database and collection
    const database = client.db('userdb'); // Change the database name to 'userdb'
    const collection = database.collection('users'); // Create a collection named 'users'

    // Return the database reference and collection
    return {
      database,
      collection,
    };
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err);
    throw err; // Rethrow the error to handle it in the calling code
  }
}

module.exports = connectToDatabase;
