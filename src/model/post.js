'use strict';

import mongoose from 'mongoose';
import HttpError from 'http-errors';
import { doesNotReject } from 'assert';
import User from './user';

const postSchema = mongoose.Schema({
  level: {
    type: Number,
    required: true,
  },
  exerciseCount: {
    type: Number,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // this is _id
    required: true,
    ref: 'user', // has to match EXACTLY to the exported string name of the user.
  },
});

/* A mongoose hook needs access to 
- a done() function
- the object we are working with (mongoose calls this 'document')
*/
function postPreHook(done) { // done is using an (error, data) signature
  // here, the value 'contextual this' is the document.
  return User.findById(this.user)
    .then((userFound) => {
      if (!userFound) {
        throw new HttpError(404, 'user not found.');
      }
      userFound.post.push(this._id);
      return userFound.save();
    })
    .then(() => done()) // done without any arguments means success.
    .catch(done); // done with results mean an error
}

const postPostHook = (document, done) => {
  return User.findById(document.user)
    .then((userFound) => {
      if (!userFound) {
        throw new HttpError(500, 'User not found in post hook.');
      }
      userFound.posts = userFound.users.filter((user) => {
        return user._id.toString() !== document._id.toString();
      });
    })
    .then(() => done())
    .catch(done); // same as .catch(result => done(result))
};

postSchema.pre('save', postPreHook);
postSchema.post('remove', postPostHook);

export default mongoose.model('post', postSchema);
