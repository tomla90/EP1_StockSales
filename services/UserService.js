const crypto = require("crypto");

class UserService {
  constructor(db) {
    this.Users = db.users;
    this.db = db;
  }

  async getAllUsers() {
    return this.Users.findAll();
  }

  async getUserById(userId) {
    return this.Users.findOne({ where: { id: userId } });
  }

  async createUser(userData) {
    console.log("Creating user with data:", userData);
    try {
      const hashedPassword = crypto
        .createHash("sha256")
        .update(userData.password)
        .digest("hex");

      userData.password = hashedPassword;

      const user = await this.Users.create(userData);
      console.log("Created user:", user);
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(userId, updatedData) {
    return this.Users.update(updatedData, { where: { id: userId } });
  }

  async deleteUser(userId) {
    const user = await this.db.User.findOne({ where: { id: userId } });

    if (!user) {
      return null;
    }

    await user.destroy();

    return user;
  }
}

module.exports = UserService;
