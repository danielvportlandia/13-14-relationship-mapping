'use strict';

import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  bicepsRPM: {
    type: Number,
  },
  tricepsRPM: {
    type: Number,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'post',
    },
  ],
}, {
  usePushEach: true,
});

export default mongoose.model('user', userSchema);
