class CategoryService {
    constructor(db) {
      this.Category = db.Category;
      this.ItemCategory = db.ItemCategories;
    }
  
    
    async getAllCategories() {
      return this.Category.findAll();
    }
  
    async getCategoryById(categoryId) {
      return this.Category.findOne({ where: { id: categoryId } });
    }
  
    async createCategory(category) {
      try {
        const newCategory = await this.Category.create({ category });
        return newCategory;
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    }
    
    async updateCategory(categoryId, category) {
      try {
        await this.Category.update({ category }, { where: { id: categoryId } });
        return this.getCategoryById(categoryId);
      } catch (error) {
        console.error('Error updating category:', error);
        throw error;
      }
    }
  
    async deleteCategory(categoryId) {
      return this.Category.destroy({ where: { id: categoryId } });
    }
  }
  
  module.exports = CategoryService;