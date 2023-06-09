module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },
  
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Item, {
      foreignKey: 'itemId',
      as: 'item',
    });
  };

  return OrderItem;
};