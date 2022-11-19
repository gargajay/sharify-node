/* -----------------------------------------------------------------------
   * @ description : Here defines all universal functions.
----------------------------------------------------------------------- */

import md5 from 'md5';
import jwt from 'jsonwebtoken';
import config from 'config';
import _ from 'underscore';

const { cipherSecretKey } = config.get('appConstants');

export const getTimeStamp = () => {
  return Date.now();
};

export const encryptpassword = request => md5(request);

export const generateRandom = () => {
  let data = Math.floor(1000 + Math.random() * 9000);
  return data;
};

export const generateToken = data =>
  jwt.sign(data, config.app.jwtKey, { algorithm: config.app.jwtAlgo, expiresIn: '90d' });

export const decodeToken = token => jwt.verify(token, config.app.jwtKey);

export const getRandomValue = async arr => {
  return arr[Math.floor(Math.random() * arr.length)];
};
