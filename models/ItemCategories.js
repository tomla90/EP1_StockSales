module.exports = (sequelize, Sequelize) => {
    const ItemCategories = sequelize.define('ItemCategories', {
      itemId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: 'Items', 
          key: 'id',
        }
      },
      categoryId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: 'Categories',
          key: 'id',
        }
      }
    });
    
    return ItemCategories;
  };