const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: (v) =>
        Array.isArray(v) && v.length >= 2 && v.every((o) => typeof o === 'string' && o.trim() !== ''),
      message: 'A question needs at least 2 non-empty options',
    },
  },
  keywords: {
    type: [String],
    default: [],
  },
  correctAnswerIndex: {
    type: Number,
    required: [true, 'correctAnswerIndex is required'],
    min: [0, 'correctAnswerIndex must be >= 0'],
    validate: {
      validator: function (v) {
        return Number.isInteger(v) && Array.isArray(this.options) && v < this.options.length;
      },
      message: 'correctAnswerIndex must be an integer that points to an item of options',
    },
  },
});

module.exports = mongoose.model('Question', questionSchema);
