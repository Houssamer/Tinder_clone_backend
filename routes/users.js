import express from 'express';
import mongoose from 'mongoose';
import Users from '../models/Users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { secretJWT } from '../config/keys.js';
import auth from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

//storage configuration

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const typeAccepted = /jpeg|jpg|png/;

    if (typeAccepted.test(path.extname(file.originalname.toLowerCase()))) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
});

//user model
const User = new mongoose.model('User', Users);

// users get (get all users from database)
router.get('/all', (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => console.log(err));
});

//user post (create a user)
router.post('/', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Please enter all fields' });
  } else {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          res.status(400).json({ message: 'the user is already exist' });
        }

        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save().then((user) => {
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
                    },
                  });
                }
              );
            });
          });
        });
      })
      .catch((err) => console.log(err));
  }
});
//user delete (delete a user)
router.delete('/:id', auth, (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: 'Please enter your password' });
  }

  User.findById(req.params.id).then((user) => {
    bcrypt
      .compare(password, user.password)
      .then((isMatched) => {
        if (!isMatched) {
          res.status(400).json({ message: 'bad password, permission denied' });
        }

        user.remove().then(() => res.json({ success: true }));
      })
      .catch((err) => res.status(404).json({ success: false }));
  });
});

//user update (update a user)

router.post('/:id', auth, upload.single('uploads'), (req, res) => {
  const imgURL = 'http://localhost:3001/' + req.file.filename;

  if (!imgURL) {
    res.status(400).json({ message: 'Please enter your picture url' });
  }

  User.findByIdAndUpdate(req.params.id, { imgURL: imgURL })
    .then(() => res.status(202).json({ message: 'Updated' }))
    .catch((err) => console.log(err));
});

//get the user who is logged in

router.get('/', auth, (req, res) => {
  User.findById(req.user.id).then((user) => res.json(user));
});

export default router;
