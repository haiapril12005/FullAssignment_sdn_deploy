const crypto = require('crypto');
const express = require('express');
const User = require('../models/User');
const { getToken, verifyUser, verifyAdmin } = require('../authenticate');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = (storedHash || '').split(':');
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

const publicUser = (u) => ({ _id: u._id, username: u.username, admin: u.admin });

// GET /api/users  -> Admin only
router.get(
  '/',
  verifyUser,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    res.json(await User.find({}));
  })
);

// POST /api/users/signup  { username, password }
// "admin" in the body is ignored: nobody can make themselves Admin.
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) throw new HttpError(400, 'Username and password are required');
    if (username.length < 3) throw new HttpError(400, 'Username must be at least 3 characters');
    if (password.length < 3) throw new HttpError(400, 'Password must be at least 3 characters');
    if (await User.findOne({ username })) {
      throw new HttpError(400, 'A user with the given username is already registered');
    }
    const user = await User.create({ username, passwordHash: hashPassword(password), admin: false });
    res.status(201).json({
      success: true,
      status: 'Registration Successful!',
      token: getToken(user),
      user: publicUser(user),
    });
  })
);

// POST /api/users/login  { username, password }
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) throw new HttpError(400, 'Username and password are required');
    const user = await User.findOne({ username }).select('+passwordHash');
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError(401, 'Invalid username or password');
    }
    res.json({
      success: true,
      status: 'Login Successful!',
      token: getToken(user),
      user: publicUser(user),
    });
  })
);

// GET /api/users/me  -> who am I (used by the frontend to restore the session)
router.get('/me', verifyUser, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// GET /api/users/logout  -> JWT is stateless: the client simply forgets its token
router.get('/logout', (req, res) => {
  res.json({ success: true, status: 'Logout Successful!' });
});

module.exports = router;
module.exports.hashPassword = hashPassword;
