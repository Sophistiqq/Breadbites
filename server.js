// Npm run start then browser-sync start --proxy 'localhost:8080' --serveStatic 'public' --files 'public,views'
const express = require('express');
const app = express();
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const bcrypt = require('bcryptjs');


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(8080, () => {
    console.log('Server is running on port https://localhost:8080');
});

// Configure Content Security Policy
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        },
    })
);


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

const sessionStore = new MySQLStore({}, db);
// Configure session middleware
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to the database');
});

app.use(session({
    secret: 'Jonaly', // Secret key used to sign the session ID cookie
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
    cookie: { secure: false }, // Configures the session cookie settings
    store: sessionStore // Use the MySQL session store
}));

// Route for the home page
app.get('/', (req, res) => {
    res.render('index', { loggedIn: req.session.loggedIn, role: req.session.role });
});

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Route for user login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Query to get the user with the given username
    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, function(err, result) {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }

                if (result) {
                    // Passwords match
                    // Set session variables to indicate that the user is logged in
                    req.session.loggedIn = true;
                    req.session.username = username;
                    req.session.userId = results[0].id; // Store user ID in session
                    req.session.email = results[0].email; // Store email in session
                    req.session.contact_number = results[0].contact_number; // Store contact number in session
                    req.session.address = results[0].address; // Store address in session
                    req.session.fullname = results[0].fullname; // Store fullname in session
                    const role = results[0].role; // Get the role from the database results
                    req.session.role = role; // Set the role in the session variables
                    if (role === 'admin') {
                        res.redirect('/');
                    } else {
                        res.redirect('/products');
                    }
                } else {
                    // Passwords don't match
                    res.redirect('/');
                }
            });
        } else {
            res.redirect('/');
        }
    });
});


app.post('/register', (req, res) => {
    const { username, email, password, contact_number, address, fullname } = req.body;
    const role = 'user'; // Set the role to "user"
    // Query to check if the username or email already exists in the database
    const checkUserQuery = `SELECT * FROM users WHERE username = ? OR email = ?`;
    db.query(checkUserQuery, [username, email], (err, results) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }

        if (results.length > 0) {
            // Redirect to the home page if the username or email already exists
            return res.redirect('/');
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            // Insert the new user into the database with the hashed password
            const insertUserQuery = `INSERT INTO users (username, email, password, contact_number, address, fullname, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;

            db.query(insertUserQuery, [username, email, hashedPassword, contact_number, address, fullname, role], (err) => {
                if (err) {
                    console.error(err);
                    return res.sendStatus(500);
                }

                res.redirect('/');
            });
        });
    });
});

// Route for user logout
app.get('/logout', (req, res) => {
    // Clear session variables to indicate that the user is logged out
    req.session.loggedIn = false;
    res.redirect('/');
});


app.post('/change-password', (req, res) => {
    const username = req.session.username; // Get the username from the session
    const currentPassword = req.body.currentPassword; // Get the current password from the request body
    const newPassword = req.body.newPassword; // Get the new password from the request body

    // Query to get the user with the given username
    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        if (results.length > 0) {
            // Check if the current password is correct
            bcrypt.compare(currentPassword, results[0].password, (err, isMatch) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }

                if (isMatch) {
                    // The current password is correct, so we can update the password
                    // Hash the new password before storing it
                    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                        if (err) {
                            console.error(err);
                            res.sendStatus(500);
                            return;
                        }

                        const updateQuery = `UPDATE users SET password = ? WHERE username = ?`;
                        db.query(updateQuery, [hashedPassword, username], (err) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500);
                                return;
                            }

                            // Send a success message
                            res.json({ success: true });
                        });
                    });
                } else {
                    // The current password is incorrect, so we send an error message
                    res.json({ success: false, message: 'Current password is incorrect' });
                }
            });
        } else {
            // The username does not exist in the database
            res.json({ success: false, message: 'Username does not exist' });
        }
    });
});


// Route for displaying products
app.get('/products', (req, res) => {
    // Query to retrieve all products from the database
    const query = `SELECT * FROM products`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        res.render('products', { products: results, loggedIn: req.session.loggedIn, role: req.session.role, username: req.session.username, id: req.session.userId });
    });
});





// Admin routes
const adminRoutes = require('./adminRoutes');
const router = require('./adminRoutes');
app.use('/admin', adminRoutes);


const axios = require('axios');
const infobipUrl = 'https://api.infobip.com/sms/1/text/single';
const infobipCredentials = 'Basic ' + Buffer.from('roi.for.school:Roi09153445041...').toString('base64');



app.post('/checkout', (req, res) => {
    const order = req.body;
    const addressOption = order.addressOption;
    const deliveryAddress = order.deliveryAddress;
    let totalCost = 0; // Initialize total cost to 0
    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        const insertOrderQuery = `INSERT INTO orders (user_id, delivery_date, delivery_time, delivery_address) VALUES (?, ?, ?, ?)`;
        db.query(insertOrderQuery, [order.userId, order.deliveryDate, order.deliveryTime, addressOption === 'my-address' ? req.session.address : deliveryAddress], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.sendStatus(500);
                });
            }

            const orderId = result.insertId;

            const productOrdersPromises = order.productOrders.map((productOrder) => {
                totalCost += productOrder.price * productOrder.quantity; // Add the total cost of the product order to the total cost of the order
                const findProductQuery = `SELECT product_id, qty_stocks FROM products WHERE product_name = ?`;
                return new Promise((resolve, reject) => {
                    db.query(findProductQuery, [productOrder.productName], (err, results) => {
                        if (err) {
                            return reject(err);
                        }
``
                        const productId = results[0].product_id;
                        const currentQtyStocks = results[0].qty_stocks;
                        const newQtyStocks = currentQtyStocks - productOrder.quantity;

                        const updatedQtyStocks = newQtyStocks >= 0 ? newQtyStocks : 0; // Update the quantity only if it's greater than or equal to 0

                        const updateQtyStocksQuery = `UPDATE products SET qty_stocks = ? WHERE product_id = ?`;
                        db.query(updateQtyStocksQuery, [updatedQtyStocks, productId], (err) => {
                            if (err) {
                                return reject(err);
                            }

                            const insertOrderItemQuery = `INSERT INTO order_items (order_id, product_id, price, quantity) VALUES (?, ?, ?, ?)`;
                            db.query(insertOrderItemQuery, [orderId, productId, productOrder.price, productOrder.quantity], (err) => {
                                if (err) {
                                    return reject(err);
                                }

                                resolve();
                            });
                        });
                    });
                });
            });

            Promise.all(productOrdersPromises)
                .then(() => {
                    // Fetch the user's contact number
                    const fetchUserContactQuery = `SELECT contact_number FROM users WHERE id = ?`;
                    db.query(fetchUserContactQuery, [order.userId], (err, results) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.sendStatus(500);
                            });
                        }

                        const userContactNumber = results[0].contact_number;
                        const headers = {
                            'Authorization': infobipCredentials,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        };
                        const data = {
                            'from': 'InfoSMS',
                            'to': userContactNumber,
                            'text': `Your order has been processed successfully. Delivery Address: ${addressOption === 'my-address' ? req.session.address : deliveryAddress}. Total Cost: ${totalCost}`
                        };
                
                        axios.post(infobipUrl, data, { headers: headers })
                            .then(response => console.log(response.data))
                            .catch(err => console.error(err));

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);
                                    res.sendStatus(500);
                                });
                            }

                            res.sendStatus(200);
                        });
                    });
                })
                .catch((err) => {
                    db.rollback(() => {
                        console.error(err);
                        res.sendStatus(500);
                    });
                });
        });
    });
});

// Route for displaying user's orders
app.get('/orders', (req, res) => {
    // Check if user is logged in
    if (!req.session.loggedIn) {
        res.redirect('/');
        return;
    }

    // Query to fetch all products
    const productsQuery = `SELECT * FROM products`;
    db.query(productsQuery, (err, productsResults) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        const ordersQuery = `
            SELECT orders.id, users.fullname, orders.delivery_date, orders.delivery_time, orders.delivery_address, order_items.product_id, order_items.price, order_items.quantity
            FROM orders
            JOIN users ON orders.user_id = users.id
            JOIN order_items ON orders.id = order_items.order_id
            WHERE users.id = ?
        `;

        db.query(ordersQuery, [req.session.userId], (err, ordersResults) => {
            if (err) {
                console.error(err);
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
                        delivery_address: order.delivery_address,
                        productOrders: [],
                        totalPrice: 0,
                        totalQuantity: 0 // Add totalQuantity property
                    };
                    acc.push(transaction);
                }
                const product = productsResults.find(p => p.product_id === order.product_id);
                const totalPrice = order.price * order.quantity;
                transaction.productOrders.push({
                    productName: product.product_name,
                    price: order.price,
                    quantity: order.quantity,
                    totalPrice: totalPrice
                });
                transaction.totalPrice += totalPrice;
                transaction.totalQuantity += order.quantity; // Increment totalQuantity
                return acc;
            }, []);

            // Render the orders view and pass the orders data to it
            res.render('orders', { transactions: transactions });
        });
    });
});

// Route for editing an order
// Route for fetching order details
app.get('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    // Query to get the order details
    const query = `SELECT * FROM orders WHERE id = ?`;
    db.query(query, [orderId], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Send the order data as a JSON response
        res.json(results[0]);
    });
});

// Route for canceling an order
app.get('/orders/cancel/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    // Query to delete the order items
    const query1 = `DELETE FROM order_items WHERE order_id = ?`;
    db.query(query1, [orderId], (err) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Query to delete the order
        const query2 = `DELETE FROM orders WHERE id = ?`;
        db.query(query2, [orderId], (err) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            // Redirect back to the orders page
            res.redirect('/orders');
        });
    });
});


// Route for updating an order
app.put('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const { deliveryDate, deliveryTime } = req.body;

    // Query to update the order details
    const query = 'UPDATE orders SET delivery_date = ?, delivery_time = ? WHERE id = ?';
    db.query(query, [deliveryDate, deliveryTime, orderId], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Send a success message as a JSON response
        res.json({ success: true });
    });
});


// Route for getting product stock
app.get('/product-stock', (req, res) => {
    const productName = req.query.name;

    // Query to get the product stock
    const query = 'SELECT qty_stocks FROM products WHERE product_name = ?';
    db.query(query, [productName], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Send the product stock as a JSON response
        if (results.length > 0) {
            res.json({ stock: results[0].qty_stocks });
        } else {
            res.json({ stock: 0 });
        }
    });
});



const isAdmin = (req, res, next) => {
    if (req.session.loggedIn && req.session.username === 'admin') {
        next();
    } else {
        res.redirect('/');
    }
};

// Route for delivery-orders
app.get('/delivery-orders', isAdmin, (req, res) => {
    const ordersQuery = `
        SELECT orders.id, users.fullname, users.contact_number, orders.delivery_date, orders.delivery_time, order_items.product_id, order_items.price, order_items.quantity
        FROM orders
        JOIN users ON orders.user_id = users.id
        JOIN order_items ON orders.id = order_items.order_id
    `;
    const productsQuery = `SELECT * FROM products`;

    db.query(ordersQuery, (ordersErr, ordersResults) => {
        if (ordersErr) {
            console.error(ordersErr);
            res.sendStatus(500);
            return;
        }

        db.query(productsQuery, (productsErr, productsResults) => {
            if (productsErr) {
                console.error(productsErr);
                res.sendStatus(500);
                return;
            }

            const transactions = ordersResults.reduce((acc, order) => {
                let transaction = acc.find(t => t.id === order.id);
                if (!transaction) {
                    transaction = {
                        id: order.id,
                        fullname: order.fullname,
                        contact_number: order.contact_number,
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

            res.render('delivery-orders', {
                transactions: transactions
            });
        });
    });
});



/* 
Table for deliveries
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    delivery_date DATE,
    delivery_time TIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    price DECIMAL(10, 2),
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);


CREATE TABLE order_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    user_id INT,
    delivery_date DATE,
    delivery_time TIME,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


*/

// Delivery done functionality
app.post('/delivery-done', (req, res) => {
    const orderId = req.body.orderId;
    const contactNumber = req.body.contactNumber;
    // Query to get the order details
    const getOrderQuery = `SELECT * FROM orders WHERE id = ?`;
    db.query(getOrderQuery, [orderId], (err, orderResults) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
            return;
        }

        if (orderResults.length === 0) {
            res.status(404).send('Order not found');
            return;
        }

        const order = orderResults[0];

        // Insert the order details into the order history table
        const insertOrderHistoryQuery = `INSERT INTO order_history (order_id, user_id, delivery_date, delivery_time) VALUES (?, ?, ?, ?)`;
        db.query(insertOrderHistoryQuery, [order.id, order.user_id, order.delivery_date, order.delivery_time], (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server Error');
                return;
            }

            // Query to delete the order items
            const deleteOrderItemsQuery = `DELETE FROM order_items WHERE order_id = ?`;
            db.query(deleteOrderItemsQuery, [orderId], (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Server Error');
                    return;
                }

                // Query to delete the order
                const deleteOrderQuery = `DELETE FROM orders WHERE id = ?`;
                db.query(deleteOrderQuery, [orderId], (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Server Error');
                        return;
                    }

                    // Send confirmation text message using Infobip
                    const headers = {
                        'Authorization': infobipCredentials,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    };
                    const data = {
                        'from': 'InfoSMS',
                        'to': contactNumber, // Use the contact number from the request body
                        'text': 'Your order has been delivered successfully.'
                    };
                    axios.post(infobipUrl, data, { headers: headers })
                        .then(response => {
                            console.log(response.data);
                        })
                        .catch(err => {
                            console.error(err);
                            res.status(500).send('Server Error');
                        });

                    // Redirect back to the delivery orders page
                    res.redirect('/delivery-orders');
                });
            });
        });
    });
});



// Cancel order functionality
app.post('/cancel-order', (req, res) => {
    const orderId = req.body.orderId;
    const contactNumber = req.body.contactNumber;

    // Query to delete the order items
    const query1 = `DELETE FROM order_items WHERE order_id = ?`;

    // Delete order items
    db.query(query1, [orderId], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
            return;
        }

        // Send confirmation text message using Infobip
        const headers = {
            'Authorization': infobipCredentials,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        const data = {
            'from': 'InfoSMS',
            'to': contactNumber, // Use the contact number from the request body
            'text': 'Your order has been Cancelled.'
        };

        axios.post(infobipUrl, data, { headers: headers })
            .then(response => {
                console.log(response.data);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Server Error');
                return;
            });

        // Delete the order
        const query2 = `DELETE FROM orders WHERE id = ?`;
        db.query(query2, [orderId], (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server Error');
                return;
            }

            // Redirect back to the orders page
            res.redirect('/delivery-orders');
        });
    });
});