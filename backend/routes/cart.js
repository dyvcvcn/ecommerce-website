const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getCart(userId) {
    return db.prepare(`
    SELECT ci.id as cart_item_id, ci.quantity, p.*
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.id
  `).all(userId);
}

router.get('/', (req, res) => {
    res.json(getCart(req.user.id));
});

router.post('/', (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
        .get(req.user.id, productId);

    if (existing) {
        db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?')
            .run(quantity, existing.id);
    } else {
        db.prepare('INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?,?,?,?)')
            .run(uuid(), req.user.id, productId, quantity);
    }
    res.status(201).json(getCart(req.user.id));
});

router.put('/:cartItemId', (req, res) => {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1' });
    const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?')
        .get(req.params.cartItemId, req.user.id);
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, item.id);
    res.json(getCart(req.user.id));
});

router.delete('/:cartItemId', (req, res) => {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?')
        .run(req.params.cartItemId, req.user.id);
    res.json(getCart(req.user.id));
});

router.delete('/', (req, res) => {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    res.json([]);
});

module.exports = router;