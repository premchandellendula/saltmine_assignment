const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const PORT = 3000;
const priceApiUrl = 'http://localhost:3001/products/';


let cart = [];

const roundUp = (value) => Math.ceil(value * 100) / 100;

const getProductPrice = async (productName) => {
    try {
        const response = await axios.get(`${priceApiUrl}${productName}`);
        console.log(response.data.price);
        return response.data.price;
    } catch (error) {
        throw new Error(`Product not found: ${productName}`);
    }
};

app.post('/cart/add', async (req, res) => {
    const { productName, quantity } = req.body;

    try {
        console.log("before price");
        const price = await getProductPrice(productName);
        console.log("after price");
        const existingProduct = cart.find(item => item.productName === productName);
        
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({ productName, price, quantity });
        }
        
        res.status(200).json({ message: 'Product added to cart', cart });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/cart/totals', (req, res) => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.125; // 12.5% tax
    const total = subtotal + tax;

    res.status(200).json({
        subtotal: roundUp(subtotal),
        tax: roundUp(tax),
        total: roundUp(total),
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
