// npm run make-admin -- <username>   -> gives Admin privileges to an existing user
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  const username = process.argv[2];
  if (!username) {
    console.error('Usage: npm run make-admin -- <username>');
    process.exit(1);
  }
  await connectDB();
  const user = await User.findOneAndUpdate({ username }, { $set: { admin: true } }, { new: true });
  console.log(user ? `"${user.username}" is now an Admin.` : `User "${username}" not found.`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
