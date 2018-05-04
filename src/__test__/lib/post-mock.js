'use strict';

import faker from 'faker';
import Post from '../../model/post';
import createUserMock from '../../model/user'; // <== this is BAD PRACTICE!

const createPostMock = () => {
  const resultMock = {};

  return createUserMock() // Creates a user
    .then((createdUser) => {
    // Step 2: Create a new post
      resultMock.user = createdUser;

      return new Post({
        level: faker.random.number(100),
        exerciseCount: faker.random.number(20),
        user: createdUser._id,
      }).save();
    })
    .then((newPost) => {
      resultMock.post = newPost;
      return resultMock;
    });
};

// const removePostMock = () => Promise.all([
//   Post.remove({}),
//   removeUserMock(),
//   /* remove the children first, then the parents, ordering matters in this block. */
// ]);

export default createPostMock;
