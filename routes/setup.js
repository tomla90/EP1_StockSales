const express = require('express');
const router = express.Router();
const db = require('../models');
const UtilityService = require('../services/UtilityService');
const jsend = require('jsend');
const crypto = require('crypto');

const utilityService = new UtilityService(db);

router.use(jsend.middleware);

router.post('/', async (req, res) => {
  const apiUrl = 'http://143.42.108.232:8888/items/stock';

  try {
    const importResult = await utilityService.importItemsFromApi(apiUrl);
    if (importResult === 'itemsExist') {
      res.jsend.fail({ message: 'Items already exist in the database. Import and Admin creation aborted.' });
    } else if (importResult === 'invalidData') {
      res.jsend.fail({ message: 'Received data is not an array. Import aborted.' });
    } else if (importResult === 'importSuccess') {
      const adminData = {
        fullname: 'Admin',
        username: 'Admin',
        email: 'admin@test.com',
        password: 'admin_password',
      };

      try {
        const salt = crypto.randomBytes(16);
        const hashedPassword = crypto.pbkdf2Sync(adminData.password, salt, 310000, 32, 'sha256');

        const newUser = await db.User.create({
          fullname: adminData.fullname,
          username: adminData.username,
          email: adminData.email,
          EncryptedPassword: hashedPassword,
          Salt: salt,
        });

        let adminRole = await db.Role.findOne({ where: { name: 'Admin' } });
        let userRole = await db.Role.findOne({ where: { name: 'User' } });

        if (!adminRole) {
          adminRole = await db.Role.create({ name: 'Admin' });
        }
        if (!userRole) {
          userRole = await db.Role.create({ name: 'User' });
        }

        await newUser.setRoles([adminRole]);
        res.jsend.success({ message: 'Items imported successfully and admin user created.' });
      } catch (error) {
        res.jsend.error({ message: error.message });
      }
    }
  } catch (error) {
    res.jsend.error({ message: error.message });
  }
});

module.exports = router;