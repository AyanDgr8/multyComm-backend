// src/app.js


import express from "express";
import cors from "cors";
import router from './routes/router.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandling.js';

const app = express();


// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000', // Change this to the origin of your frontend
    credentials: true, // Allow credentials
    optionsSuccessStatus: 200
  };

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);



// Middleware for handling 404 errors
app.use(notFoundHandler);

// Middleware for handling errors
app.use(errorHandler);

export { app };