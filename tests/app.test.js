const express = require("express");
const request = require("supertest");
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require("body-parser");
const db = require("../models");


const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
const signupRouter = require('../routes/signup');
const loginRouter = require('../routes/login');
const itemRouter = require('../routes/item');
const itemsRouter = require('../routes/items');
const categoryRouter = require('../routes/category');
const categoriesRouter = require('../routes/categories');
const setupRouter = require('../routes/setup');
const searchRouter = require('../routes/search');
const cartRouter = require('../routes/cart');
const allcartsRouter = require('../routes/allcarts');
const cartItemRouter = require('../routes/cartitem');
const orderRouter = require('../routes/order');
const ordersRouter = require('../routes/orders');
const allOrdersRouter = require('../routes/allorders');

const app = express();

app.use(bodyParser.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/items', itemsRouter);
app.use('/item', itemRouter);
app.use('/category', categoryRouter);
app.use('/categories', categoriesRouter);
app.use('/setup', setupRouter);
app.use('/search', searchRouter);
app.use('/cart', cartRouter);
app.use('/allcarts', allcartsRouter);
app.use('/cart_item', cartItemRouter);
app.use('/order', orderRouter);
app.use('/orders', ordersRouter);
app.use('/allorders', allOrdersRouter);

describe("Testing API endpoints", () => {

  
beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});
  let adminToken;
  let userToken;
  let createdCategoryId;
  let createdItemId;
  let createdUserId

 // 1
test("POST /setup - import items and login as admin", async () => {
  try {
    const response = await request(app).post("/setup").set("Authorization", `Bearer ${adminToken}`);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("message", "Items imported successfully and admin user created.");

    const credentials = {
      username: "Admin",
      password: "admin_password",
    };
    const loginResponse = await request(app).post("/login").send(credentials);
    expect(loginResponse.body.status).toBe("success");
    expect(loginResponse.body.data).toHaveProperty("token");
    adminToken = loginResponse.body.data.token;
  } catch (error) {
    console.error("An error occurred while testing POST /setup - import items and login as admin:");
    console.error(error.message);
    fail();
  }
});

// 2
test("POST /signup - new user", async () => {
  try {
    const userData = {
      username: 'test_user',
      email: 'test_user@test.com',
      password: 'test_password',
    };
    const { body } = await request(app).post("/signup").send(userData);
    expect(body.status).toBe("success");
    createdUserId = body.data.id;
    console.log(createdUserId);
  } catch (error) {
    console.error("An error occurred while testing POST /signup - new user:");
    console.error(error.message);
    fail();
  }
});

// 3
test("POST /login - user success", async () => {
  try {
    const credentials = {
      username: 'test_user',
      password: 'test_password',
    };
    const { body } = await request(app).post("/login").send(credentials);
    expect(body.status).toBe("success");
    expect(body.data).toHaveProperty("token");
    userToken = body.data.token;
  } catch (error) {
    console.error("An error occurred while testing POST /login - user success:");
    console.error(error.message);
    fail();
  }
});

// 4
test("POST /category - create a new category", async () => {
  try {
    const newCategory = { category: 'CAT_TEST' };
    const { body } = await request(app)
      .post('/category')
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newCategory);
    expect(body.status).toBe("success");
    createdCategoryId = body.data.newCategory.id;
  } catch (error) {
    console.error("An error occurred while testing POST /category - create a new category:");
    console.error(error.message);
    fail();
  }
});

// 5
test("POST /item - create a new item", async () => {
  try {
    const newItem = {
      item_name: 'ITEM_TEST',
      price: 100,
      categoryId: createdCategoryId,
      description: 'This is a test item',
      sku: 'SKU_TEST',
      stock_quantity: 50
    };
    const { body } = await request(app)
      .post('/item')
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newItem);
    expect(body.status).toBe("success");
    expect(body.data.newItem.item_name).toBe(newItem.item_name);
    expect(body.data.newItem.price).toBe(newItem.price);
    expect(body.data.newItem.description).toBe(newItem.description);
    expect(body.data.newItem.sku).toBe(newItem.sku);
    expect(body.data.newItem.stock_quantity).toBe(newItem.stock_quantity);
    createdItemId = body.data.newItem.id;
  } catch (error) {
    console.error("An error occurred while testing POST /item - create a new item:");
    console.error(error.message);
    fail();
  }
});

// 6
test("POST /search - search items", async () => {
  try {
    const searchText = { item_name: 'mart' };
    const { body } = await request(app)
      .post('/search')
      .set("Authorization", `Bearer ${userToken}`)
      .send(searchText);
    expect(body.status).toBe("success");
    expect(body.data).toHaveLength(3);
  } catch (error) {
    console.error("An error occurred while testing POST /search - search items:");
    console.error(error.message);
    fail();
  }
});

// 7
test("POST /search - search items", async () => {
  try {
    const searchText = { item_name: 'Laptop' };
    const { body } = await request(app)
      .post('/search')
      .set("Authorization", `Bearer ${userToken}`)
      .send(searchText);
    expect(body.status).toBe("success");
    expect(body.data).toHaveLength(1);
  } catch (error) {
    console.error("An error occurred while testing POST /search - search items:");
    console.error(error.message);
    fail();
  }
});

// 8
test("Admin endpoints", async () => {
  try {
    // Test endpoint - GET /allorders
    let response = await request(app)
      .get('/allorders')
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("orders");
    expect(response.body.data.orders).toHaveLength(0);

    // Test endpoint - GET /allcarts
    response = await request(app)
      .get('/allcarts')
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("carts");

    // Test endpoint - POST /category
    const newCategory = { category: 'ADMIN_CAT_TEST' };
    const categoryResponse = await request(app)
      .post('/category')
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newCategory);
    expect(categoryResponse.body.status).toBe("success");
    expect(categoryResponse.body.data).toHaveProperty("newCategory");
    expect(categoryResponse.body.data.newCategory).toHaveProperty("id");
    expect(categoryResponse.body.data.newCategory).toHaveProperty("category", newCategory.category);
    expect(categoryResponse.body.data.newCategory).toHaveProperty("updatedAt");
    expect(categoryResponse.body.data.newCategory).toHaveProperty("createdAt");

    const categoryIdToDelete = categoryResponse.body.data.newCategory.id;

    // Test endpoint - DELETE /category/:id
    const deleteResponse = await request(app)
      .delete(`/category/${categoryIdToDelete}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(deleteResponse.body.status).toBe("success");
    expect(deleteResponse.body.data).toHaveProperty("message", "Category deleted");
  } catch (error) {
    console.error("An error occurred while testing Admin endpoints:");
    console.error(error.message);
    fail();
  }
});

// 9
test("Delete all the values added", async () => {
  try {
    // Delete the item
    let response = await request(app)
      .delete(`/item/${createdItemId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect([200, 204].includes(response.status)).toBe(true);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("message", "Item deleted");

    // Delete the category
    response = await request(app)
      .delete(`/category/${createdCategoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect([200, 204].includes(response.status)).toBe(true);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("message", "Category deleted");

    // DELETE the user
    response = await request(app)
      .delete(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect([200, 204].includes(response.status)).toBe(true);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("result", "User deleted successfully");
  } catch (error) {
    console.error("An error occurred while testing Delete all the values added:");
    console.error(error.message);
    fail();
  }
});

// 10
test("POST /setup endpoint - Test must be run again", async () => {
  try {
    const response = await request(app)
      .post('/setup')
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.body.status).toBe("fail");
    expect(response.body.data).toHaveProperty("message", "Items already exist in the database. Import and Admin creation aborted.");
  } catch (error) {
    console.error("An error occurred while testing POST /setup endpoint - Test must be run again:");
    console.error(error.message);
    fail();
  }
});
});
