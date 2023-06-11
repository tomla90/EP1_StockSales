### EP1 StockSales

This API is designed as a backend for a fictive online store. It manages users, roles, items, carts, orders, and categories. It includes endpoints for creating, retrieving, updating, and deleting these elements.

## Instructions

- Step 1: Download the project from GitHub and unzip it.

- Step 2: Install Node.js and NPM (Node Package Manager) if you haven't already.

- Step 3: Create a .env file in the project root directory and copy/paste the environment variables from the .env section in the README file into your newly created .env file.

- Step 4: Create a database in mySQL with following script:
    CREATE DATABASE StockSalesDB;
    CREATE USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';
    ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';
    GRANT ALL PRIVILEGES ON StockSalesDB.* TO 'admin'@'localhost';

- Step 5: Open your terminal, navigate to the project folder, and run npm install.

- Step 6: Start the server with npm start. It should be running on http://localhost:3000.

- Step 7: Use Postman to interact with the API endpoints.(information on this at the bottom of README)

- Step 8: Run http://localhost:3000/setup to populate the database with products and make an admin user with the credentials for login:
    username: Admin
    password: admin_password
    The next step will do the same but also run tests to check if the api is working properly.

- Step 9: You can run tests by typing npm test in your terminal. This will initiate 10 tests, verifying the functionality of the database. Please note that these tests will delete the existing database, run the /setup to populate the database from the API, create an admin user, and execute all the other tests.

Remember to stop the server when you're done by pressing Ctrl+C in your terminal.


## .env

DATABASE_NAME=StockSalesDB
ADMIN_USERNAME=admin
ADMIN_PASSWORD=P@ssw0rd
DIALECT=mysql
HOST=localhost
SECRET=23bc563cfdc35af7f77fc2259757cacc1e167498c737e539aa933a5595dead1d
BASE_URL=http://localhost:3000


### For a concise summary of the project progression, challenges, and database structure, please refer to the "Retrospective Report.pdf" in Documentation folder within the project.

### Check out the "Postman.pdf" in the Documentation folder for info on using the database and endpoints. You can also find this online at " https://documenter.getpostman.com/view/25199058/2s93sc5YUg " for examples on all of the endpoints etc.