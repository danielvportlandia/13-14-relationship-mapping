'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import Post from '../model/post';

const jsonParser = bodyParser.json();
const postRouter = new Router();

postRouter.post('/api/posts', jsonParser, (request, response, next) => {
  // TODO: Optional validation

  return new Post(request.body).save()
    .then((post) => {
      logger.log(logger.INFO, 'PUT - responding with a 200 status code.');
      response.json(post);
    })
    .catch(next);
});

postRouter.put('/api/posts/:id', jsonParser, (request, response, next) => {
  const options = { runValidators: true, new: true };

  return Post.findByIdAndUpdate(request.params.id, request.body, options)
    .then((updatedPost) => {
      if (!updatedPost) {
        return next(new HttpError(404, 'Post not found.'));
      }
      logger.log(logger.INFO, 'PUT - responding with a 200 status code.');
      return response.json(updatedPost);
    })
    .catch(next);
});

export default postRouter;
