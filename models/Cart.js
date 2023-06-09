module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define('Cart', {
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  });

  Cart.associate = (models) => {
    Cart.hasMany(models.CartItem, {
      foreignKey: 'cartId',
      as: 'cartItems',
    });

   
    Cart.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Cart;
};