import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/authMiddleware.js';
import Users from '../models/Users.js';

const router = express.Router();

const User = new mongoose.model('User', Users);

router.get('/:id', auth, (req, res) => {
  User.find({ _id: { $ne: req.params.id } })
    .then((users) => {
      res.status(200).json({
        users,
      });
    })
    .catch((err) => console.log(err));
});

export default router;
