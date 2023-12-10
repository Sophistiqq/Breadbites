const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const helmet = require('helmet');
const crypto = require('crypto'); // Add crypto module for generating nonce
const bodyParser = require('body-parser');
// Set Content Security Policy (CSP) headers to allow inline scripts with nonce
router.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64'); // Generate a nonce value
    res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`);
    res.setHeader('X-Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`); // For older browsers
    res.locals.nonce = nonce; // Make the nonce value available in templates
    next();
});
// Create a connection to the MySQL database
const db = mysql.createConnection({
    // uri: 'mysql://avnadmin:AVNS__I1qTDQJdXjTU4WAgRX@breadbites-breadbites.a.aivencloud.com:10293/defaultdb?ssl-mode=REQUIRED',
    host: 'breadbites-breadbites.a.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS__I1qTDQJdXjTU4WAgRX',
    database: 'breadbites',
    port: 10293,
});

// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '091534',
//     database: 'breadbites'
// })


// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.session.loggedIn && req.session.username === 'admin') {
        next();
    } else {
        res.redirect('/');
    }
};

router.use(express.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Route for the admin page with admin authentication
router.get('/', isAdmin, (req, res) => {
    res.render('admin');
});

// Route for admin login
router.post('/login', isAdmin, (req, res) => {
    const { username, password } = req.body;

    // Query to check if the admin username and password match in the database
    const query = `SELECT * FROM admin WHERE username = ? AND password = ?`;
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        if (results.length > 0) {
            // Set session variables to indicate that the admin is logged in
            req.session.loggedIn = true;
            req.session.username = username;
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/');
        }
    });
});

const os = require('os');


function calculateSystemUptime() {
    const uptime = os.uptime();
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

router.get('/uptime', (req, res) => {
    res.send(calculateSystemUptime());
});

router.get('/dashboard', isAdmin, (req, res) => {
    const usersQuery = `SELECT * FROM users WHERE username != 'admin' AND id != 1`;
    const productsQuery = `SELECT * FROM products`;
    const ordersQuery = `
        SELECT orders.id, users.fullname, orders.delivery_date, orders.delivery_time, order_items.product_id, order_items.price, order_items.quantity
        FROM orders
        JOIN users ON orders.user_id = users.id
        JOIN order_items ON orders.id = order_items.order_id
    `;
    const orderHistoryQuery = `
        SELECT order_history.id, users.fullname, order_history.delivery_date, order_history.delivery_time
        FROM order_history
        JOIN users ON order_history.user_id = users.id
    `;

    db.query(usersQuery, (usersErr, usersResults) => {
        if (usersErr) {
            console.error(usersErr);
            res.sendStatus(500);
            return;
        }

        db.query(productsQuery, (productsErr, productsResults) => {
            if (productsErr) {
                console.error(productsErr);
                res.sendStatus(500);
                return;
            }

            db.query(ordersQuery, (ordersErr, ordersResults) => {
                if (ordersErr) {
                    console.error(ordersErr);
                    res.sendStatus(500);
                    return;
                }

                db.query(orderHistoryQuery, (orderHistoryErr, orderHistoryResults) => {
                    if (orderHistoryErr) {
                        console.error(orderHistoryErr);
                        res.sendStatus(500);
                        return;
                    }

                    const transactions = ordersResults.reduce((acc, order) => {
                        let transaction = acc.find(t => t.id === order.id);
                        if (!transaction) {
                            transaction = {
                                id: order.id,
                                fullname: order.fullname,
                                delivery_date: order.delivery_date,
                                delivery_time: order.delivery_time,
                                productOrders: [],
                                totalPrice: 0
                            };
                            acc.push(transaction);
                        }
                        const totalPrice = order.price * order.quantity;
                        transaction.productOrders.push({
                            productName: productsResults.find(p => p.product_id === order.product_id).product_name,
                            price: order.price,
                            quantity: order.quantity,
                            totalPrice: totalPrice
                        });
                        transaction.totalPrice += totalPrice;
                        return acc;
                    }, []);

                    const totalUsers = usersResults.length;
                    const totalProducts = productsResults.length;
                    const activeUsers = usersResults.filter(user => user.isActive).length;
                    const systemUptime = calculateSystemUptime();

                    res.render('dashboard', {
                        users: usersResults,
                        products: productsResults,
                        transactions: transactions,
                        totalUsers: totalUsers,
                        totalProducts: totalProducts,
                        activeUsers: activeUsers,
                        systemUptime: systemUptime,
                        orderHistory: orderHistoryResults // Pass the order history to the EJS template
                    });
                });
            });
        });
    });
});

const bcrypt = require('bcryptjs');

router.post('/admin-add', isAdmin, (req, res) => {
    const { fullname, username, email, password, contact_number, address, role } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Query to insert a new user into the database
        const query = `INSERT INTO users (fullname, username, email, password, contact_number, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [fullname, username, email, hashedPassword, contact_number, address, role], (err, results) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            res.redirect('/admin/dashboard#users-section');
        });
    });
});


// Route for editing a user
router.post('/admin-edit', isAdmin, (req, res) => {
    const { 'edit-user-id': userid, 'edit-fullname': fullname, 'edit-username': username, 'edit-email': email, 'edit-password': password, 'edit-contact_number': contact_number, 'edit-address': address, 'edit-role': role } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Query to update the user in the database
        const query = `UPDATE users SET fullname = ?, username = ?, email = ?, password = ?, contact_number = ?, address = ?, role = ? WHERE id = ?`;
        db.query(query, [fullname, username, email, hashedPassword, contact_number, address, role, userid], (err, results) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            res.redirect('/admin/dashboard#users-section');
        });
    });
});

router.delete('/admin-delete', isAdmin, (req, res) => {
    const { userId } = req.body;

    // Query to delete the user's orders first
    const deleteOrdersQuery = `DELETE FROM orders WHERE user_id = ?`;
    db.query(deleteOrdersQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Query to delete the user from the database
        const deleteUserQuery = `DELETE FROM users WHERE id = ?`;
        db.query(deleteUserQuery, [userId], (err, results) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            res.json({ message: 'User deleted successfully.' });
        });
    });
});



const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/images/PRODUCTS'),
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/admin-add-product', isAdmin, upload.single('image_loc'), (req, res) => {
    const { product_name, category, qty_stocks, product_description, price } = req.body;
    const filename = path.basename(req.file.path);
    const image_loc = '/images/PRODUCTS/' + filename;
    // Query to insert the new product into the database
    const insertQuery = `INSERT INTO products (product_name, image_loc, category, qty_stocks, product_description, price) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(insertQuery, [product_name, image_loc, category, qty_stocks, product_description, price], (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        res.redirect('/admin/dashboard#products-section');
    });
});


// Route for deleting a product
router.delete('/admin-delete-product', isAdmin, (req, res) => {
    const { productId } = req.body;

    // Query to delete the corresponding rows in the child table (order_items)
    const deleteOrderItemsQuery = `DELETE FROM order_items WHERE product_id = ?`;
    db.query(deleteOrderItemsQuery, [productId], (err) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Query to delete the product from the parent table (products)
        const deleteProductQuery = `DELETE FROM products WHERE product_id = ?`;
        db.query(deleteProductQuery, [productId], (err) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            res.json({ message: 'Product deleted successfully' });
        });
    });
});


// Route for editing a product
router.post('/admin-edit-product', isAdmin, (req, res) => {
    const { 'edit-product-id': productId, 'edit-product_name': productName, 'edit-category': category, 'edit-qtystocks': qtyStocks, 'edit-product_description': productDescription, 'edit-price': price } = req.body;
    
    // Query to update the product in the database
    const query = `UPDATE products SET product_name = ?, category = ?, qty_stocks = ?, product_description = ?, price = ? WHERE product_id = ?`;
    db.query(query, [productName, category, qtyStocks, productDescription, price, productId], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        res.redirect('/admin/dashboard#products-section');
    });
});


















module.exports = router;
