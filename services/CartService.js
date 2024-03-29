const { Op } = require("sequelize");

class CartService {
  constructor(db) {
    this.Cart = db.Cart;
    this.CartItem = db.CartItem;
    this.Item = db.Item;
    this.User = db.User;
    this.db = db;
  }

  async getCart(userId) {
    return this.Cart.findOne({
      where: { userId: userId },
      include: {
        model: this.CartItem,
        as: "cartItems",
        include: {
          model: this.Item,
          as: "item",
        },
      },
    });
  }

  async getAllCarts() {
    try {
      const query = `
        SELECT
          c.id AS cartId,
          u.id AS userId,
          u.username AS userName,
          u.fullname AS fullName,
          ci.id AS cartItemId,
          ci.quantity,
          i.id AS itemId,
          i.item_name,
          i.description,
          i.price,
          i.img_url,
          i.sku,
          i.stock_quantity
        FROM
          carts AS c
          INNER JOIN users AS u ON c.userId = u.id
          LEFT JOIN cartitems AS ci ON c.id = ci.cartId
          LEFT JOIN items AS i ON ci.itemId = i.id
        ORDER BY
          c.id, ci.id
      `;

      const [results] = await this.db.sequelize.query(query);

      const carts = {};

      for (const row of results) {
        const { cartId, userId, userName, fullName, cartItemId, ...item } = row;

        if (!carts[cartId]) {
          carts[cartId] = {
            cartId,
            userId,
            userName,
            fullName,
            cartItems: [],
          };
        }

        if (cartItemId) {
          carts[cartId].cartItems.push({
            cartItemId,
            ...item,
          });
        }
      }

      return Object.values(carts);
    } catch (error) {
      console.error("Error retrieving carts:", error);
      throw error;
    }
  }

  async addItemToCart(userId, itemId, quantity) {
    const item = await this.Item.findOne({ where: { id: itemId } });

    if (!item) {
      throw new Error("Item does not exist in the database");
    }

    if (item.stock_quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    let cart = await this.getCart(userId);

    if (!cart) {
      cart = await this.Cart.create({ userId });
    }

    const cartItem = await this.CartItem.create({
      cartId: cart.id,
      itemId,
      quantity,
    });

    return cartItem;
  }
  async updateCartItem(userId, cartItemId, quantity) {
    const cart = await this.getCart(userId);

    if (!cart) {
      throw new Error("No cart found for this user");
    }

    const cartItem = await this.CartItem.findOne({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    const item = await this.Item.findOne({ where: { id: cartItem.itemId } });

    if (!item) {
      throw new Error("Item does not exist");
    }

    if (item.stock_quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    const updatedCartItem = await cartItem.update({ quantity });

    return updatedCartItem;
  }

  async deleteCartItem(userId, itemId) {
    const cart = await this.getCart(userId);

    if (!cart) {
      throw new Error("No cart found for this user");
    }

    return this.CartItem.destroy({ where: { id: itemId, cartId: cart.id } });
  }

  async deleteCart(cartId, userId) {
    await this.CartItem.destroy({ where: { cartId: cartId } });

    return this.Cart.destroy({ where: { id: cartId, userId: userId } });
  }
}

module.exports = CartService;
