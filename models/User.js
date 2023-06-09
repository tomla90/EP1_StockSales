module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('User', {
    fullname: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    EncryptedPassword: {
      type: Sequelize.DataTypes.BLOB,
      allowNull: false,
    },
    Salt: {
      type: Sequelize.DataTypes.BLOB,
      allowNull: false,
    },
  });

  User.associate = function (models) {
    User.belongsToMany(models.Role, {
      through: models.UserRoles,
      as: 'roles',
      foreignKey: 'userId',
    });

    User.hasOne(models.Cart, {
      foreignKey: 'userId',
      as: 'cart',
    });
  };

  return User;
};