import logger from './logger';
import User from '../collections/user';
import * as Universal from './universal';
const soap = require('soap');

export const addAdmin = async () => {
  let data = {
    name: 'Admin',
    email: 'admin@yopmail.com',
    password: Universal.encryptpassword('admin@123'),
    status: 1,
    role: 2
  };
  let admin = await User.findOne({ email: 'admin@yopmail.com' });
  if (!admin) {
    await User.register(data);
    logger.info('Adding admin..............');
  }
};

export const dbModal = async (type, db) => {
  let obj;
  if (type == 1) {
    obj = {
      name: db.name,
      email: db.email,
      role: db.role,
      status: db.status
    };
  } else if (type == 3) {
    obj = {
      ...db
    };
  } else {
    obj = {
      name: db.name,
      email: db.email,
      role: db.role,
      city: db.city,
      post_code: db.post_code,
      status: db.status,
      emailVerify: db.emailVerify,
      credit_score: db.credit_score ? db.credit_score : 0
    };
  }
  return obj;
};

//Soap Middleware to parse all third party API vendors requests and parse then XML response to JSON
export const SOAPClient = async (url, payload, type, func) => {
  return new Promise((resolve, reject) => {
    // url = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarProductInfoServicePort?wsdl';
    // const args = {'arg0': {category: 'Bags'}, 'arg1': {sanMarCustomerNumber: 56404, sanMarUserName: 'cmagee', sanMarUserPassword: 'birdie1'}};
    let args;
    if (type == 'SANMAR') {
      soap.createClient(url, function(err, client) {
        if (client) {
          if (func == 'getProduct') {
            args = {
              arg0: payload,
              arg1: {
                sanMarCustomerNumber: 56404,
                sanMarUserName: 'cmagee',
                sanMarUserPassword: 'birdie1'
              }
            };
            client.getProduct(args, function(err1, result) {
              if (err1) {
                reject(err1);
              }
              if (result && result.return && !result.return.errorOccured) {
                console.log(result.return.listResponse);
                resolve(result.return.listResponse);
              } else {
                return;
              }
            });
          } else if (func == 'getProductInfoByStyleColorSize') {
            args = {
              arg0: payload,
              arg1: {
                sanMarCustomerNumber: 56404,
                sanMarUserName: 'cmagee',
                sanMarUserPassword: 'birdie1'
              }
            };
            client.getProductInfoByStyleColorSize(args, function(err1, result) {
              if (err1) {
                reject(err1);
              }
              if (result && result.return && !result.return.errorOccured) {
                console.log(result.return.listResponse);
                resolve(result.return.listResponse);
              } else {
                return;
              }
            });
          } else {
            client.getProductDeltaInfo(args, function(err1, result) {
              if (err1) {
                reject(err1);
              }
              if (result && result.return && !result.return.errorOccured) {
                console.log(result.return.listResponse);
                resolve(result.return.listResponse);
                // console.log(JSON.stringify(result.return.listResponse));
              } else {
                // const responseJSON = result.toJSON(result.body);
                // const finalData = xml2json.toJson(result.body);
                // if(responseJSON.statusCode == 500){

                // }
                // console.log(finalData, "==finalData")
                return;
              }
            });
          }
        } else {
          resolve();
        }
      });
    }
  });
};
