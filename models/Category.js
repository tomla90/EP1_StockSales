module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define('Category', {
      category: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
    });
  
    Category.associate = function(models) {
      Category.belongsToMany(models.Item, {
        through: 'ItemCategories',
        as: 'items',
        foreignKey: 'categoryId',
      });
    };
  
    return Category;
  };