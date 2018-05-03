'use strict';

import faker from 'faker';
import superagent from 'superagent';
import User from '../model/user';
import { startServer, stopServer } from '../lib/server';
import logger from '../lib/logger';

const apiURL = `http://localhost:${process.env.PORT}/api/users`;

const createUserMock = () => {
  return new User({
    name: faker.name.findName(),
    location: faker.address.city(),
    bicepsRPM: faker.random.number(300),
    tricepsRPM: faker.random.number(300),
  }).save();
};

// const createManyUserMocks = (howManyNotes) => {
//   // Promise.all takes an array of promises.
//   return Promise.all(new Array(howManyNotes))
//     .fill(100)
//     .map(x => createUserMock(x));
// };

describe('/api/users', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(() => User.remove({}));

  describe('POST /api/users', () => {
    test('POST - It should respond with a 200 status ', () => {
      const userToPost = {
        name: faker.name.findName(),
        location: faker.address.city(),
        bicepsRPM: faker.random.number(300),
        tricepsRPM: faker.random.number(300),
      };
      return superagent.post(apiURL)
        .send(userToPost)
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.name).toEqual(userToPost.name);
          expect(response.body.location).toEqual(userToPost.location);
          expect(response.body.bicepsRPM).toEqual(userToPost.bicepsRPM);
          expect(response.body.tricepsRPM).toEqual(userToPost.tricepsRPM);
          expect(response.body._id).toBeTruthy();
        });
    });
    test('POST - It should respond with a 400 status ', () => {
      const UserToPost = {
        location: faker.address.city(),
        bicepsRPM: faker.random.number(300),
        tricepsRPM: faker.random.number(300),
      };
      return superagent.post(apiURL)
        .send(UserToPost)
        .then(Promise.reject)
        .catch((response) => {
          expect(response.status).toEqual(400);
        });
    });
    test('POST - 409 due to duplicate name', () => {
      return createUserMock()
        .then((savedUser) => {
          const mockCategory = {
            name: savedUser.name,
            location: savedUser.location,
          };
          return superagent.post(apiURL)
            .send(mockCategory);
        })
        .then(Promise.reject)
        .catch((error) => {
          expect(error.status).toEqual(409);
        });
    });
  });

  describe('GET /api/users/:id', () => {
    test('GET - should respond with 200 if there are no errors', () => {
      let userToTest = null;
      return createUserMock()
        .then((user) => {
          userToTest = user;
          return superagent.get(`${apiURL}/${user._id}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.name).toEqual(userToTest.name);
          expect(response.body.location).toEqual(userToTest.location);
          expect(response.body.bicepsRPM).toEqual(userToTest.bicepsRPM);
          expect(response.body.tricepsRPM).toEqual(userToTest.tricepsRPM);
        });
    });
    test('GET - should respond with 404 if there is no user to be found', () => {
      return superagent.get(`${apiURL}/THisIsAnInvalidId`)
        .then(Promise.reject)
        .catch((response) => {
          expect(response.status).toEqual(404);
        });
    });
    test('GET - should respond with an array if no id specified.', () => {
      return superagent.get(apiURL)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });
  });

  describe('DELETE /api/users', () => {
    test('DELETE - should respond with 204 if item was successfully removed.', () => {
      return createUserMock()
        .then((user) => {
          return superagent.delete(`${apiURL}/${user._id}`);
        })
        .then((response) => {
          expect(response.status).toEqual(204);
        });
    });
    test('DELETE - should respond with 404 if there is no user to be found', () => {
      return superagent.delete(`${apiURL}/THisIsAnInvalidId`)
        .then(Promise.reject)
        .catch((response) => {
          expect(response.status).toEqual(404);
        });
    });
  });

  describe('PUT /api/users', () => {
    test('PUT - should update a user and return a 200 status code.  ', () => {
      let userToUpdate = null;
      return createUserMock()
        .then((userMock) => {
          userToUpdate = userMock;
          return superagent.put(`${apiURL}/${userMock._id}`)
            .send({ name: 'John Doe' });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.name).toEqual('John Doe');
          expect(response.body.location).toEqual(userToUpdate.location);
          expect(response.body.bicepsRPM).toEqual(userToUpdate.bicepsRPM);
          expect(response.body.tricepsRPM).toEqual(userToUpdate.tricepsRPM);
          expect(response.body._id).toEqual(userToUpdate._id.toString());
          // Mongo generated id's are objects, not strings/numbers thus toString() is required.
        });
    });
    test('PUT - should respond with a 404 if user not found.', () => {
      return createUserMock()
        .then(() => {
          return superagent.put(`${apiURL}/invalidID`)
            .send({ name: 'John Doe' });
        })
        .catch((error) => {
          expect(error.status).toEqual(404);
        });
    });
    test('PUT - should respond with a 400 if invalid id.', () => {
      return createUserMock()
        .then((userMock) => {
          return superagent.put(`${apiURL}/${userMock._id}`)
            .send({ name: '' });
        })
        .catch((error) => {
          expect(error.status).toEqual(400);
        });
    });
    test('PUT - 409 due to duplicate name', () => {
      const firstMock = () => {
        return new User({
          name: 'John Doe',
          location: faker.address.city(),
          bicepsRPM: faker.random.number(300),
          tricepsRPM: faker.random.number(300),
        }).save();
      };
      return createUserMock()
        .then((userMock) => {
          const mockCategory = {
            name: firstMock.name,
          };
          return superagent.put(`${apiURL}/${userMock._id}`)
            .send(mockCategory);
        })
        /* This works because there will always be a valid response back from 
        a PUT as it returns the targed item's values whether the request was valid or not. */
        .then(Promise.resolve()) 
        .catch((error) => {
          logger.log(logger.INFO, `error: ${error}`);
          expect(error.status).toEqual(409);
        });
    });
  });
});
