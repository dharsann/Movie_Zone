const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const connectToDatabase = require('./db/connectToDatabase');
const fs = require('fs');
const winston = require('winston');
const WebSocket = require('ws'); // Import WebSocket module
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

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.File({ filename: 'user-activity.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

function appendToLog(logPath, data) {
  fs.appendFile(logPath, data + '\n', (err) => {
    if (err) {
      console.error('Error appending to log:', err);
    }
  });
}

app.use(morganMiddleware);

const sessionSecret = process.env.SESSION_SECRET;
const sessionMiddleware = session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000,
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 3600000,
  },
});
app.use(sessionMiddleware);

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  // Send message to connected clients when session is updated
  sessionMiddleware(ws.upgradeReq, {}, () => {
    ws.on('message', (message) => {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  });
});

// Signup endpoint
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

// Signin endpoint
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

// Logout endpoint
app.post('/api/logout', (req, res) => {
  try {
    logger.info('User logged out');
    const sessionId = req.session.id;
    req.session.destroy((err) => {
      if (err) {
        logger.error('Error logging out:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
      const logData = {
        action: 'logout',
        session_id: sessionId,
        timestamp: new Date().toISOString(),
      };
      appendToLog('user-activity.log', JSON.stringify(logData));

      // Notify WebSocket clients about logout
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: 'logout', session_id: sessionId }));
        }
      });
    });
  } catch (error) {
    logger.error('Error logging out:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Attach WebSocket server to existing HTTP server
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
