module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define(
    'Order',
    {
      userId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      total: {
        type: Sequelize.DataTypes.DOUBLE,
        allowNull: false
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      }
    },
  );

  Order.associate = function(models) {
    Order.hasMany(models.OrderItem, {
      as: 'orderitems',
      foreignKey: 'orderId',
    });

    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Order;
};