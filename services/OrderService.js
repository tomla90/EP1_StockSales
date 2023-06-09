const { Op } = require("sequelize")

class OrderService {
  constructor(db) {
    this.Order = db.Order;
    this.OrderItem = db.OrderItem;
    this.Item = db.Item;
    this.User = db.User;
    this.CartItem = db.CartItem;
    this.Cart = db.Cart
    this.db = db;
  }

  async getUserOrders(userId) {
    const user = await this.User.findOne({
        where: { id: userId },
    });

    const usersWithSameEmail = await this.User.count({
        where: { email: user.email },
    });

    let discount = 0;

    if (usersWithSameEmail === 2) {
        discount = 0.10;
    } else if (usersWithSameEmail === 3) {
        discount = 0.30;
    } else if (usersWithSameEmail >= 4) {
        discount = 0.40;
    }

    const orders = await this.Order.findAll({
        where: { userId },
        include: [{
            model: this.OrderItem,
            as: 'orderitems',
            include: {
                model: this.Item,
                as: 'item'
            }
        }]
    });

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            discount: `${discount * 100}%`,
            usersWithSameEmail
        },
        orders
    };
}
  
async getAllOrders() {
  try {
    const query = `
      SELECT
        o.id AS orderId,
        u.id AS userId,
        u.username AS userName,
        u.fullname AS fullName,
        u.email AS userEmail,
        oi.id AS orderItemId,
        oi.quantity,
        i.id AS itemId,
        i.item_name,
        i.description,
        i.price,
        i.img_url,
        i.sku,
        i.stock_quantity,
        o.status AS orderStatus
      FROM
        Orders AS o
        INNER JOIN Users AS u ON o.userId = u.id
        LEFT JOIN OrderItems AS oi ON o.id = oi.orderId
        LEFT JOIN Items AS i ON oi.itemId = i.id
      ORDER BY
        o.id, oi.id
    `;

    const [results] = await this.db.sequelize.query(query);

    const orders = {};

    for (const row of results) {
      const { orderId, userId, userName, fullName, userEmail, orderItemId, orderStatus, ...item } = row;

      if (!orders[orderId]) {
        const usersWithSameEmail = await this.User.count({
          where: { email: userEmail },
        });

        let discount = 0;

        if (usersWithSameEmail === 2) {
          discount = 0.10;
        } else if (usersWithSameEmail === 3) {
          discount = 0.30;
        } else if (usersWithSameEmail >= 4) {
          discount = 0.40;
        }

        orders[orderId] = {
          orderId,
          userId,
          userName,
          fullName,
          userEmail,
          orderStatus,
          discount: `${discount * 100}%`,
          usersWithSameEmail,
          orderItems: [],
        };
      }

      if (orderItemId) {
        orders[orderId].orderItems.push({
          orderItemId,
          ...item,
        });
      }
    }

    return Object.values(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    throw error;
  }
}
  
  
  async createOrder(userId, itemId) {
    const t = await this.Order.sequelize.transaction();
  
    try {
      let order = null;
      let userCart = await this.Cart.findOne({
        where: { userId },
      });
  
      if (!userCart) {
        throw new Error(`No cart found for the user with ID ${userId}`);
      }
  
      const user = await this.User.findOne({
        where: { id: userId },
      });
  
      const usersWithSameEmail = await this.User.count({
        where: { email: user.email },
      });
  
      let discount = 0;
  
      if (usersWithSameEmail === 2) {
        discount = 0.10;
      } else if (usersWithSameEmail === 3) {
        discount = 0.30;
      } else if (usersWithSameEmail >= 4) {
        discount = 0.40;
      }
  
      if (itemId) {
        const cartItem = await this.CartItem.findOne({
          where: {
            cartId: userCart.id,
            itemId,
          },
          include: {
            model: this.Item,
            as: 'item',
          },
        });
  
        if (!cartItem) {
          throw new Error(`Item with ID ${itemId} does not exist in the cart`);
        }
  
        const item = await this.Item.findByPk(itemId);
  
        if (!item) {
          throw new Error(`Item with ID ${itemId} does not exist`);
        }
  
        if (item.stock_quantity < cartItem.quantity) {
          throw new Error(`Not enough stock for item ${itemId}`);
        }
  
        const itemTotal = item.price * cartItem.quantity * (1 - discount);
  
        order = await this.Order.findOne({
          where: {
            userId,
            status: 'In Process',
          },
          transaction: t,
        });
  
        if (!order) {
          order = await this.Order.create(
            { userId, status: 'In Process', total: itemTotal },
            { transaction: t }
          );
        } else {
          order.total += itemTotal;
          await order.save({ transaction: t });
        }
  
        await this.OrderItem.create(
          {
            orderId: order.id,
            itemId: item.id,
            quantity: cartItem.quantity,
            price: item.price,
          },
          { transaction: t }
        );
  
        item.stock_quantity -= cartItem.quantity;
        await item.save({ transaction: t });
  
        await cartItem.destroy({ transaction: t });
      } else {
        const cartItems = await this.CartItem.findAll({
          where: {
            cartId: userCart.id,
          },
          include: {
            model: this.Item,
            as: 'item',
          },
        });
  
        if (cartItems.length === 0) {
          throw new Error('Cart is empty');
        }
  
        order = await this.Order.findOne({
          where: {
            userId,
            status: 'In Process',
          },
          transaction: t,
        });
  
        if (!order) {
          order = await this.Order.create(
            { userId, status: 'In Process', total: 0 },
            { transaction: t }
          );
        }
  
        for (const cartItem of cartItems) {
          const item = await this.Item.findByPk(cartItem.itemId);
  
          if (!item) {
            throw new Error(`Item with ID ${cartItem.itemId} does not exist`);
          }
  
          if (item.stock_quantity < cartItem.quantity) {
            throw new Error(`Not enough stock for item ${cartItem.itemId}`);
          }
  
          const itemTotal = item.price * cartItem.quantity * (1 - discount);
  
          order.total += itemTotal;
          await order.save({ transaction: t });
  
          await this.OrderItem.create(
            {
              orderId: order.id,
              itemId: item.id,
              quantity: cartItem.quantity,
              price: item.price,
            },
            { transaction: t }
          );
  
          item.stock_quantity -= cartItem.quantity;
          await item.save({ transaction: t });
        }
  
        for (const cartItem of cartItems) {
          await cartItem.destroy({ transaction: t });
        }
      }
  
      await t.commit();
  
      return {
        order,
        discount: `${discount * 100}%`, 
        usersWithSameEmail
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
  

  async getOrderById(orderId) {
    const order = await this.Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: this.OrderItem,
          as: 'orderitems',
          include: {
            model: this.Item,
            as: 'item'
          }
        },
        {
          model: this.User,
          as: 'user'
        }
      ]
    });
  
    if (!order) {
      return null;
    }
  
    const usersWithSameEmail = await this.User.count({
      where: { email: order.user.email },
    });
  
    let discount = 0;
  
    if (usersWithSameEmail === 2) {
      discount = 0.10;
    } else if (usersWithSameEmail === 3) {
      discount = 0.30;
    } else if (usersWithSameEmail >= 4) {
      discount = 0.40;
    }
  
    return {
      orderId: order.id,
      userId: order.user.id,
      userName: order.user.username,
      fullName: order.user.fullname, 
      userDiscount: `${discount * 100}%`,
      usersWithSameEmail,
      orderStatus: order.status,
      orderItems: order.orderitems.map(item => {
        return {
          orderItemId: item.id,
          itemId: item.item.id,
          quantity: item.quantity,
          itemName: item.item.item_name,
          description: item.item.description,
          price: item.item.price,
          imgUrl: item.item.img_url,
          sku: item.item.sku,
          stockQuantity: item.item.stock_quantity
        }
      })
    };
  }

  async updateOrderStatus(orderId, status) {
    
    const validStatuses = ["In Process", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      throw new Error("Invalid order status");
    }

   
    await this.Order.update({ status }, { where: { id: orderId } });

    return this.getOrderById(orderId);
  }
}

module.exports = OrderService;