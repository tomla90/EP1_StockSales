module.exports = (sequelize, Sequelize) => {
  const CartItem = sequelize.define('CartItem', {
    cartId: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'Carts',
        key: 'id',
      },
    },
    itemId: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'Items',
        key: 'id',
      },
    },
    quantity: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  });

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Item, {
      foreignKey: 'itemId',
      as: 'item',
    });

    CartItem.belongsTo(models.Cart, {
      foreignKey: 'cartId',
      as: 'cart',
    });
  };

  return CartItem;
};