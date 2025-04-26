// backend/routes/razorpay.js
const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: 'rzp_test_JQ3qfa8eGYKkBj',
  key_secret: 'n9dvi3hJSmhFxEfLYLrziox1',
});

router.post('/order', async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: 'receipt#1',
    });

    res.json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).send('Error creating order');
  }
});

module.exports = router;
