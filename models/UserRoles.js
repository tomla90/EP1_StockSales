module.exports = (sequelize, Sequelize) => {
  const UserRoles = sequelize.define('UserRoles', {
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    roleId: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'Roles',
        key: 'id',
      }
    }
  });

  return UserRoles;
};