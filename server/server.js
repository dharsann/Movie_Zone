const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const connectToDatabase = require('./db/connectToDatabase');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
const morgan = require('morgan');

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
     stream: {
       write: (message) => logger.info(message.trim()),
     },
  }
 );
 const winston = require('winston');

 const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
     new winston.transports.File({ filename: 'error.log', level: 'error' }),
     new winston.transports.File({ filename: 'combined.log' }),
     new winston.transports.File({ filename: 'user-activity.log' }), // Add user activity log file
  ],
 });
 
 if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
     format: winston.format.simple(),
  }));
 }

// Function to append to log file
function appendToLog(logPath, data) {
  fs.appendFile(logPath, data + '\n', (err) => {
    if (err) {
      console.error('Error appending to log:', err);
    }
  });
}

// Use morgan middleware for logging HTTP requests
app.use(morganMiddleware);

const sessionSecret = process.env.SESSION_SECRET;
app.use(session({
 secret: sessionSecret,
 resave: false,
 saveUninitialized: true,
 cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 3600000,
 }
}));

// Your existing endpoints...
// In your signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Connect to MongoDB and get references to the database and collection
    const { database, collection } = await connectToDatabase();

    // Store the user in the database
    try {
      await collection.insertOne({ username, password: hashedPassword }); // Use insertOne method to insert a document
      res.status(201).json({ message: 'User signed up successfully' });

      // Log user activity
      const logData = {
        action: 'signup',
        username: username,
        timestamp: new Date().toISOString(),
      };
      appendToLog('user-activity.log', JSON.stringify(logData));
    } catch (error) {
      console.error('Error signing up user:', error);
      logger.error('Error signing up user:', error);
      res.status(500).json({ message: 'An error occurred during signup' });
    }
  } catch (error) {
    logger.error('Error signing up user:', error);
    res.status(500).json({ message: 'An error occurred during signup' });
  }
});

// In your signin endpoint
app.post('/api/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Connect to MongoDB and get references to the database and collection
    const { collection } = await connectToDatabase();

    // Find the user by username
    const user = await collection.findOne({ username });
    if (!user) {
      logger.error('Invalid credentials'); // Log the error
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error('Invalid credentials'); // Log the error
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // If the password matches, set session data
    req.session.user = { username: user.username };

    // Log user activity
    const logData = {
      action: 'signin',
      username: user.username,
      timestamp: new Date().toISOString(),
    };
    appendToLog('user-activity.log', JSON.stringify(logData));

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error(err.message);
    logger.error('Server Error'); // Log the error
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/logout', (req, res) => {
  try {
    // Log the logout action
    logger.info('User logged out');

    // Invalidate the session
    req.session.destroy(err => {
      if (err) {
        logger.error('Error logging out:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });

      // Log user activity
      const logData = {
        action: 'logout',
        username: req.session.user.username,
        timestamp: new Date().toISOString(),
      };
      appendToLog('user-activity.log', JSON.stringify(logData));
    });
  } catch (error) {
    logger.error('Error logging out:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
 logger.info(`Server running on port ${PORT}`);
});
