const jwt = require('jsonwebtoken');
const db = require('../models');

module.exports = function attachUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return next();
      }

      const { id, email } = user;

      db.User.findOne({ where: { id }, include: 'roles' })
        .then(user => {
          if (user) {
            req.user = {
              id: user.id,
              email: user.email,
              roles: user.roles.map(role => role.name)
            };
          }

          next();
        })
        .catch(error => {
          console.error('Error finding user:', error);
          next();
        });
    });
  } else {
    next();
  }
};