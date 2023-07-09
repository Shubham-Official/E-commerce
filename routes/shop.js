const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// //The colan after the Products/ in the below router indicates express not to look for the routes instead this part can be anything and we can extract the information through the url.This part after the colan is called the dynamic segment.
router.get("/products/:productId", shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDelete);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", shopController.getCheckoutSuccess);

router.get("/checkout/cancel", shopController.getCheckout);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;
