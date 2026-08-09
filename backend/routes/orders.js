const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { chargeCard } = require('./payment');

const router = express.Router();
router.use(requireAuth);

// GET /api/orders  -> order history for logged-in user
router.get('/', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    const withItems = orders.map(o => ({ ...o, items: itemsStmt.all(o.id) }));
    res.json(withItems);
});

router.get('/:id', (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ ...order, items });
});

// POST /api/orders/checkout
// body: { shipping: {name, address, city, zip}, card: {cardNumber, expiry, cvc} }
router.post('/checkout', (req, res) => {
    const { shipping = {}, card = {} } = req.body;
    const cartItems = db.prepare(`
    SELECT ci.quantity, p.*
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
  `).all(req.user.id);

    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    for (const item of cartItems) {
        if (item.quantity > item.stock) {
            return res.status(400).json({ error: `Not enough stock for ${item.name}` });
        }
    }

    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const charge = chargeCard({
        cardNumber: card.cardNumber,
        expiry: card.expiry,
        cvc: card.cvc,
        amount: total,
    });

    if (!charge.success) {
        return res.status(402).json({ error: charge.error || 'Payment failed' });
    }

    const orderId = uuid();
    const insertOrder = db.prepare(`
    INSERT INTO orders (id, user_id, total, status, payment_id, payment_status, shipping_name, shipping_address, shipping_city, shipping_zip)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `);
    const insertItem = db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity) VALUES (?,?,?,?,?,?)
  `);
    const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    const clearCart = db.prepare('DELETE FROM cart_items WHERE user_id = ?');

    const tx = db.transaction(() => {
        insertOrder.run(
            orderId, req.user.id, total, 'confirmed', charge.paymentId, 'paid',
            shipping.name || req.user.name, shipping.address || '', shipping.city || '', shipping.zip || ''
        );
        for (const item of cartItems) {
            insertItem.run(uuid(), orderId, item.id, item.name, item.price, item.quantity);
            decrementStock.run(item.quantity, item.id);
        }
        clearCart.run(req.user.id);
    });
    tx();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    res.status(201).json({ ...order, items });
});

module.exports = router;