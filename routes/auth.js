import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { secretJWT } from '../config/keys.js';
import Users from '../models/Users.js';

const router = express.Router();

const User = new mongoose.model('User', Users);

router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Please enter all fields' });
  } else {
    User.findOne({ email }).then((user) => {
      if (!user) {
        res.status(400).json({ message: "the user doesn't exist" });
      }

      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          res
            .status(400)
            .json({ message: 'wrong password, authentification denied' });
        } else {
          jwt.sign(
            { id: user.id },
            secretJWT,
            { expiresIn: '12h' },
            (err, token) => {
              if (err) throw err;
              res.json({
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  imgURL: user.imgURL,
                },
              });
            }
          );
        }
      });
    });
  }
});

export default router;
