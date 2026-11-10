
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all products and search products
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;

        let sql = 'SELECT * FROM products';
        let params = [];

        if (search) {
            sql += ' WHERE name LIKE ? OR category LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        sql += ' ORDER BY id DESC';

        const [products] = await db.query(sql, params);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// GET one product
router.get('/:id', async (req, res) => {
    try {
        const [products] = await db.query(
            'SELECT * FROM products WHERE id = ?',
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(products[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch product' });
    }
});

// CREATE product
router.post('/', async (req, res) => {
    try {
        const { name, description, price, stock, category, image_url } = req.body;

        if (!name || price === undefined || price === null || stock === undefined || stock === null) {
            return res.status(400).json({
                message: 'Name, price, and stock are required'
            });
        }

        const [result] = await db.query(
            `INSERT INTO products
            (name, description, price, stock, category, image_url)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name,
                description || null,
                price,
                stock,
                category || null,
                image_url || null
            ]
        );

        res.status(201).json({
            message: 'Product created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create product' });
    }
});

// UPDATE product
router.put('/:id', async (req, res) => {
    try {
        const { name, description, price, stock, category, image_url } = req.body;

        if (!name || price === undefined || price === null || stock === undefined || stock === null) {
            return res.status(400).json({
                message: 'Name, price, and stock are required'
            });
        }

        const [result] = await db.query(
            `UPDATE products
            SET name = ?, description = ?, price = ?, stock = ?,
                category = ?, image_url = ?
            WHERE id = ?`,
            [
                name,
                description || null,
                price,
                stock,
                category || null,
                image_url || null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update product' });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM products WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

module.exports = router;
