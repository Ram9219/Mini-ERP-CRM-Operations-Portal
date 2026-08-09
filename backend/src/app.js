const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const healthRouter = require('./routes/health');
const authRouter = require('./routes/authRoutes');
const testRouter = require('./routes/testRoutes');
const customerRouter = require('./routes/customerRoutes');
const productRouter = require('./routes/productRoutes');
const challanRouter = require('./routes/challanRoutes');
const { pool } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required');
}

const app = express();

app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin denied: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(
  session({
    store: new PgSession({
      pool,
      createTableIfMissing: true,
    }),
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);
app.get('/',(req,res)=>{
    res.send('Welcome to the Mini ERP Backend API');
});
app.use('/api/auth', authRouter);
app.use('/api/test', testRouter);
app.use('/api/customers', customerRouter);
app.use('/api/products', productRouter);
app.use('/api/challans', challanRouter);
app.use('/api/health', healthRouter);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;
