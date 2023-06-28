const axios = require("axios");
const { Op } = require("sequelize");

class UtilityService {
  constructor(db) {
    this.Item = db.Item;
    this.ItemCategory = db.ItemCategories;
    this.Category = db.Category;
  }

  async createItemForSetup(itemData, categoryName) {
    console.log("Creating item with data:", itemData);
    try {
      const item = await this.Item.create(itemData);
      console.log("Created item:", item);
      if (categoryName) {
        const category = await this.findOrCreateCategory(categoryName);
        await this.ItemCategory.create({
          itemId: item.id,
          categoryId: category.id,
        });
        console.log("Assigned category to item");
      }
      return item;
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    }
  }

  async importItemsFromApi(apiUrl) {
    const itemCount = await this.Item.count();

    if (itemCount > 0) {
      console.log("Items already exist in the database. Import aborted.");
      return "itemsExist";
    }

    try {
      const response = await axios.get(apiUrl);
      const items = response.data.data;

      if (!Array.isArray(items)) {
        console.error("Received data is not an array. Import aborted.");
        return "invalidData";
      }

      for (const item of items) {
        await this.createItemForSetup(item, item.category);
      }

      console.log("Items imported successfully");
      return "importSuccess";
    } catch (error) {
      console.error("Error importing items from API:", error);
      throw error;
    }
  }

  async findOrCreateCategory(name) {
    try {
      const [category, created] = await this.Category.findOrCreate({
        where: { category: name },
        defaults: { category: name },
      });

      if (created) {
        console.log("Created new category:", name);
      }

      return category;
    } catch (error) {
      console.error("Error finding or creating category:", error);
      throw error;
    }
  }

  async searchItems(searchParams) {
    try {
      const { item_name, category, sku } = searchParams;

      let itemWhereClause = {};
      if (item_name) {
        itemWhereClause.item_name = { [Op.like]: "%" + item_name + "%" };
      }
      if (sku) {
        itemWhereClause.sku = sku;
      }

      let categoryWhereClause = {};
      if (category) {
        categoryWhereClause.category = { [Op.like]: "%" + category + "%" };
      }

      let query = {
        where: itemWhereClause,
        include: [],
      };

      if (Object.keys(categoryWhereClause).length) {
        query.include.push({
          model: this.Category,
          as: "categories",
          where: categoryWhereClause,
          required: true,
          through: { attributes: [] },
        });
      }

      const items = await this.Item.findAll(query);

      if (!items.length) {
        return { message: "Sorry, no items were found." };
      }
      return items;
    } catch (error) {
      console.error("Error searching for items:", error);
      throw error;
    }
  }
}

module.exports = UtilityService;
