import express from 'express';
import { secretJWT } from '../config/keys.js';
import jwt from 'jsonwebtoken';

function auth(req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    res.status(400).json({ message: 'no token, access denied' });
  }

  jwt.verify(token, secretJWT, (err, decoded) => {
    if (err) throw err;

    req.user = decoded;
  });

  next();
}

export default auth;
