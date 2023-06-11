const { Op } = require('sequelize');

class ItemService {
  constructor(db, CategoryService) {
    this.Item = db.Item;
    this.ItemCategory = db.ItemCategories;
    this.CategoryService = CategoryService;
    this.Category = db.Category
  }

  
  async getAllItems(user = null) {
    try {
      const items = user
        ? await this.Item.findAll({
            include: [
              {
                model: this.Category,
                as: 'categories',
                attributes: ['id', 'category'],
                through: { attributes: [] },
              },
            ],
          })
        : await this.Item.findAll({
            where: { stock_quantity: { [Op.gt]: 0 } },
            include: [
              {
                model: this.Category,
                as: 'categories',
                attributes: ['id', 'category'],
                through: { attributes: [] },
              },
            ],
          });
      return items;
    } catch (error) {
      console.error('Error getting all items:', error);
      throw error;
    }
  }

  async getItemById(itemId) {
    return this.Item.findOne({ where: { id: itemId } });
  }

  async createItem(itemData, categoryId) {
    console.log('Creating item with data:', itemData);
    try {
        const item = await this.Item.create(itemData);
        console.log('Created item:', item);
        if (categoryId) {
            const category = await this.findCategoryById(categoryId);
            if (category) {
                await this.ItemCategory.create({ itemId: item.id, categoryId: category.id });
                console.log('Assigned category to item');
            } else {
                console.log('Category not found, no category assigned to item');
            }
        }
        
        const itemWithCategories = await this.Item.findOne({ 
            where: { id: item.id },
            include: [{
              model: this.Category,
              as: 'categories',
              attributes: ['id', 'category'], 
              through: { attributes: [] },
            }]
        });
        return itemWithCategories;
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
}
  
async findCategoryById(id) {
  try {
      const category = await this.Category.findOne({
          where: { id: id }
      });

      return category;
  } catch (error) {
      console.error('Error finding category:', error);
      throw error;
  }
}


  async updateItem(itemId, updatedData, newCategoryId) {
    try {
    
      await this.Item.update(updatedData, { where: { id: itemId } });

     
      if (newCategoryId) {
        const itemCategory = await this.ItemCategory.findOne({ where: { itemId: itemId } });

        if (itemCategory) {
          await itemCategory.update({ categoryId: newCategoryId });
        } else {
          throw new Error("Item's category not found");
        }
      }

      return this.getItemById(itemId);
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(itemId) {
    return this.Item.destroy({ where: { id: itemId } });
  }

}

module.exports = ItemService;