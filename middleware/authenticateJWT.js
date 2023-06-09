const jwt = require('jsonwebtoken');
const db = require('../models');

module.exports = function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
      if (err) {
        return res.sendStatus(403);
      }

      const { id, email } = decodedToken;

      
      db.User.findOne({ where: { id }, include: 'roles' })
        .then(user => {
          if (!user) {
            return res.sendStatus(403);
          }

          req.user = {
            id: user.id,
            email: user.email,
            roles: user.roles.map(role => role.name) 
          };

          next();
        })
        .catch(error => {
          console.error(error);
          res.sendStatus(500);
        });
    });
  } else {
    res.sendStatus(401);
  }
};