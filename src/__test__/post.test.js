'use strict';

import faker from 'faker';
import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import createUserMock from './lib/user-mock';
import createPostMock from './lib/post-mock';

const apiURL = `http://localhost:${process.env.PORT}/api/posts`;

describe('/api/posts', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  // afterEach(removePostMock);

  describe('POST /api/posts', () => {
    test('200 status code in creation.', () => {
      // need to create a 'real' post I need a mock user.
      return createUserMock()
        .then((userMock) => {
          const userToPost = {
            level: faker.random.number(100),
            exerciseCount: faker.random.number(20),
            user: userMock._id,
          };
          return superagent.post(apiURL)
            .send(userToPost)
            .then((response) => {
              expect(response.status).toEqual(200);
            });
        });
    });
  });

  describe('PUT /api/posts', () => {
    test('PUT - should respond with a 200 if successful', () => {
      let postToUpdate = null;
      return createPostMock()
        .then((postMock) => {
          postToUpdate = postMock.post;
          return superagent.put(`${apiURL}/${postMock.post._id}`)
            .send({ exerciseCount: 15 });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.exerciseCount).toEqual(15);
          expect(response.body.level).toEqual(postToUpdate.level);
        });
    });
  });
});
