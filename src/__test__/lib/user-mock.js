'use strict';

import faker from 'faker';
import User from '../../model/user';

const createUserMock = () => {
  return new User({
    name: faker.name.findName(),
    location: faker.address.city(),
    bicepsRPM: faker.random.number(300),
    tricepsRPM: faker.random.number(300),
  }).save();
};

export default createUserMock;
