module.exports = (sequelize, DataTypes) => {
    const Item = sequelize.define('Item', {
      item_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      img_url: {
        type: DataTypes.STRING,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    }, 
    );
  
    Item.associate = (models) => {
      Item.belongsToMany(models.Category, {
        through: 'ItemCategories',
        as: 'categories',
        foreignKey: 'itemId',
      });
      Item.hasMany(models.CartItem, {
        foreignKey: 'itemId',
        as: 'cartItems',
      });
      Item.hasMany(models.OrderItem, {
        foreignKey: 'itemId',
        as: 'orderItems',
      });
    };
  
    return Item;
  };