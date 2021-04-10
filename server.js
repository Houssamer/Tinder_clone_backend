import express from 'express';
import mongoose from 'mongoose';
import { MONGO_URI } from './config/keys.js';
import users from './routes/users.js';
import auth from './routes/auth.js';
import usersExceptOne from './routes/usersExceptOne.js';

const app = express();
const PORT = process.env.PORT || 3001;

//middlewares

app.use(express.json());
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-auth-token'
  );
  next();
});
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/users_except_one', usersExceptOne);

//setting up the database

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to mongodb'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.json({ message: 'Hello backend' });
});

//listen on port

app.listen(PORT, () => console.log('app running on port ' + PORT));
