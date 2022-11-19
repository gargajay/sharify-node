const jwt = require('jsonwebtoken');
const config = require('config');
const { WEB_URL, SECERT_KEY } = config.get('appConstants');
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
    const decodedToken = jwt.verify(token, SECERT_KEY);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch(e) {
    res.status(401).json({'status':401,'message':'unauthenticated access'});
  }
};