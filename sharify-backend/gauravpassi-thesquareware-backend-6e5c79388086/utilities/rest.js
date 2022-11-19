/* -----------------------------------------------------------------------
   * @ description : Here defines all rest functions.
----------------------------------------------------------------------- */

import Boom from 'boom';
import config from 'config';
import jwt from 'jsonwebtoken';
import User from '../collections/user';
//import Temp from '../collections/temp';
import Messages from './messages';
import logger from './logger';

const { jwtKey } = config.get('app');

export const authorization = async (request, h) => {
  let token = request.headers['authorization'];
  token = token.split(' ');
  if (token && token[0] && token[0] == 'Bearer') {
    token = token[1];
    let decoded = {};
    try {
      decoded = jwt.verify(token, jwtKey);
    } catch (err) {
      throw Boom.unauthorized(Messages.tokenExpired);
    }
    logger.info('authorization', decoded);
    const user = await User.checkToken(token);
    if (user) return h.authenticated({ credentials: { user, token } });
    else throw Boom.unauthorized(Messages.unauthorizedUser);
  } else {
    throw Boom.unauthorized(Messages.unauthorizedUser);
  }
};

//success response with custom status codes
export const successAction = (data, message = 'OK') => ({
  statusCode: 200, //1000
  message,
  data: data ? data : undefined
});

export const failAction = errorMessage => {
  if (errorMessage === Messages.phoneNumberNotExists) {
    const error = Boom.badRequest(Messages.phoneNumberNotExists);
    error.output.statusCode = 277; // Assign a custom error code
    error.reformat();
    throw error;
  } else if (errorMessage === Messages.merchantAPI) {
    const error = Boom.badRequest(Messages.merchantAPI);
    error.output.statusCode = 278; // Assign a custom error code
    error.reformat();
    throw error;
  } else {
    throw Boom.badRequest(errorMessage);
  }
};

export const failActionJoi = (request, h, error) => {
  let errorMessage = '';
  if (error.output.payload.message.indexOf('[') > -1) {
    errorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf('['));
  } else {
    errorMessage = error.output.payload.message;
  }
  errorMessage = errorMessage.replace(/"/g, '');
  errorMessage = errorMessage.replace('[', '');
  errorMessage = errorMessage.replace(']', '');
  error.output.payload.message = errorMessage;
  delete error.output.payload.validation;
  throw Boom.badRequest(errorMessage);
};
