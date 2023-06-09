module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define('Role', {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
  });

  Role.associate = function(models) {
    Role.belongsToMany(models.User, {
      through: models.UserRoles,
      as: 'users',
      foreignKey: 'roleId',
    });
  };

  return Role;
};