const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_KEY);

// const p = path.join()
const PDFDocument = require("pdfkit");

const Product = require('../models/product');
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  // Product.fetchAll(products => {
  //   res.render('shop/product-list', {
  //     prods: products,
  //     pageTitle: 'All Products',
  //     path: '/products'
  //   });
  // });

  // ---> From here we started working with the database instead of local file system.

  // ---> Using normal mysql syntax below
  // Product.fetchAll().then(([rows, fieldData]) => {
  //   res.render("shop/product-list", {
  //     prods: rows,
  //     pageTitle: "All Products",
  //     path: "/products"
  //   })
  // }).catch(err => console.log(err));

  // ---> Using Sequelize
  // Product.findAll().then(products => {
  //   res.render("shop/product-list", {
  //     prods: products,
  //     pageTitle: "All Products",
  //     path: "/products"
  //   })
  // }).catch(err => console.log(err));

  // ---> Using mongoDb
  // Product.fetchAll()
  //   .then(products => {
  //     res.render("shop/product-list", {
  //       prods: products,
  //       pageTitle: "All Products",
  //       path: "/products"
  //     });
  //   })
  //   .catch(err => console.log(err))

  // ---> Using Mongoose
  // Product.find()
  //   .then(products => {
  //     res.render("shop/product-list", {
  //       prods: products,
  //       pageTitle: "All Products",
  //       path: "/products",
  //       //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
  //     })
  //   })
  //   .catch(err => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });

  // Below code is for Pagination.
  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts;
    return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
  })
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        // We have passed the below variables using locals middleware in the app.js file
        // isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken(),
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findById(prodId, product => {
  //   res.render("shop/product-detail", {
  //     product: product,
  //     pageTitle: product.title,
  //     path: "/products"
  //   })
  // })

  // --->> From here we started working with database instead of a local file system.

  // Using normal mysql syntax below
  // Product.findById(prodId).then(product => {
  //   res.render("shop/product-detail", {
  //     product: product,
  //     pageTitle: product.title,
  //     path: "/products"
  //   })
  // }).catch(err => console.log(err));

  // ---> Using Sequelize
  // Product.findAll({ where: { id: prodId } }).then(products => {
  //   res.render("shop/product-detail", {
  //     product: products[0],
  //     pageTitle: products[0].title,
  //     path: "/products"
  //   })
  // }).catch(err => console.log(err));

  // ---> Using MongoDb
  // Product.findById(prodId)
  //   .then(product => {
  //     res.render("shop/product-detail", {
  //       product: product,
  //       pageTitle: product.title,
  //       path: "/products"
  //     });
  //   })
  //   .catch(err => console.log(err))

  // ---> Using Mongoose
  Product.findById(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getIndex = (req, res, next) => {
  // Product.fetchAll(products => {
  //   res.render('shop/index', {
  //     prods: products,
  //     pageTitle: 'Shop',
  //     path: '/'
  //   });
  // });

  // ---> From here we started working with the database instead of local file system.

  // ---> This is the normal sequelize syntax below
  // Product.fetchAll().then(([rows, fieldData]) => {
  //   res.render("shop/index", {
  //     prods: rows,
  //     pageTitle: "Shop",
  //     path: "/"
  //   })
  // }).catch(err => console.log(err));

  // ---> Using Sequelize
  // Product.findAll().then(products => {
  //   res.render("shop/index", {
  //     prods: products,
  //     pageTitle: "Shop",
  //     path: "/"
  //   })
  // }).catch(err => console.log(err));

  // ---> Using MongoDb
  // Product.fetchAll()
  //   .then(products => {
  //     res.render("shop/product-list", {
  //       prods: products,
  //       pageTitle: "All Products",
  //       path: "/"
  //     });
  //   })
  //   .catch(err => console.log(err))

  // ---> Using Mongoose
  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts;
    return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
  })
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        // We have passed the below variables using locals middleware in the app.js file
        // isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken(),
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(prod => prod.id === product.id);
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts,
  //     });
  //   });
  // });

  // ---> Using sequelize Associations
  // req.user.getCart()
  //   .then(cart => {
  //     return cart.getProducts()
  //       .then(products => {
  //         res.render("shop/cart", {
  //           path: "/cart",
  //           pageTitle: "Your Cart",
  //           products: products,
  //         })
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   })
  //   .catch(err => console.log(err));

  // ---> Using mongodb
  // req.user.getCart().then(products => {
  //   res.render("shop/cart", {
  //     path: "/cart",
  //     pageTitle: "Your Cart",
  //     products: products,
  //   });
  // }).catch(err => console.log(err));

  // ---> Using mongoose
  req.user
    .populate("cart.items.productId")
    // .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findById(prodId, (product) => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect("/cart");

  // ---> Using Sequelize Associations
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user.getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } })
  //   })
  //   .then(products => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }
  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
  //   })
  //   .then(() => { res.redirect("/cart"); })
  //   .catch(err => console.log(err));

  // // ---> Using MongoDb
  // Product.findById(prodId).then(product => {
  //   req.user.addToCart(product);
  //   res.redirect("/cart");
  // }).then(result => {
  //   console.log(result);
  // })

  // ---> Using mongoose
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
    console.log(result);
    res.redirect("/cart");
  })
};

exports.postCartDelete = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findById(prodId, product => {
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect("/cart");
  // })

  //---> Using sequelize Associations
  // req.user.getCart()
  //   .then(cart => {
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then(products => {
  //     const product = products[0];
  //     return product.cartItem.destroy();
  //   .then(result => {
  //     res.redirect("/cart");
  //   })
  //   .catch(err => console.log(err));

  // ---> Using mongodb
  // req.user.deleteItemFromCart(prodId).then(() => {
  //   res.redirect("/cart");
  // })
  //   .catch(err => console.log(err));

  // ---> Using Mongoose
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect("/cart")
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: products.map(p => {
          return {
            description: p.productId.description,
            price: p.productId,
            quantity: p.quantity,
          };
        }),
        success_url: req.protocol + '://' + req.get("host") + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get("host") + '/checkout/cancel',
      });
    })
    .then(session => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(resutl => {
      req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

// We dont need below code because we have replaced it with getCheckoutSuccess() above.
// exports.postOrder = (req, res, next) => {
//   // ---> Using Sequelize
//   // let fetchedCart;
//   // req.user.getCart()
//   //   .then(cart => {
//   //     fetchedCart = cart;
//   //     return cart.getProducts();
//   //   })
//   //   .then(products => {
//   //     console.log(products);
//   //     return req.user.createOrder()
//   //       .then(order => {
//   //         return order.addProducts(products.map(product => {
//   //           product.orderItem = { quantity: product.cartItem.quantity };
//   //           return product;
//   //         }));
//   //       })
//   //       .then(() => {
//   //         fetchedCart.setProducts(null);
//   //         res.redirect("/orders")
//   //       })
//   //       .then(() => res.redirect("/orders"))
//   //       .catch(err => console.log(err));
//   //   })
//   //   .catch(err => console.log(err));

//   // ---> Using mongoDb
//   // req.user
//   //   .addOrder()
//   //   .then(() => res.redirect("/orders"))
//   //   .catch(err => console.log(err));

//   // ---> Using Mongoose
//   req.user
//     .populate("cart.items.productId")
//     .then(user => {
//       const products = user.cart.items.map(i => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user
//         },
//         products: products
//       });
//       return order.save();
//     })
//     .then(resutl => {
//       req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect("/orders");
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.getOrders = (req, res, next) => {
  // req.user.getOrders({ include: ["products"] })
  //   .then(orders => {
  //     res.render('shop/orders', {
  //       path: '/orders',
  //       pageTitle: 'Your Orders',
  //       orders: orders,
  //     });
  //   })
  //   .catch(err => console.log(err));

  // ---> Using mongodb
  // req.user.getOrders().then(orders => {
  //   res.render("shop/orders", {
  //     path: "/orders",
  //     pageTitle: "Your Orders",
  //     orders: orders
  //   });
  // }).catch(err => console.log(err))

  // ---> Using Mongoose
  Order.find({ "user.userId": req.user._id }).then(orders => {
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
      //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
    })
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  order.findById(orderId).then(order => {
    if (!order) {
      return next(new Error("No order Found!"));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("invoices", invoiceName);

    // Below is PDF creation using thirdparty pdfkit module.
    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=" + invoiceName + "");
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true,
    });

    pdfDoc.text("________________________________");
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc.fontSize(14).text(prod.product.title + " - " + prod.quantity + " x " + "Rs " + prod.product.price);
    });

    pdfDoc.fontSize(26).text("________________________________");
    pdfDoc.fontSize(14).text("Total Price:   Rs" + totalPrice);
    pdfDoc.end();
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   res.setHeader("Content-Type", "application/pdf");
    //   res.setHeader("Content-Disposition", "attachment; filename=" + invoiceName + "");
    //   res.send(data);
    // });
    //Below code is to recieve large data in buffers or streams.
    // const file = fs.createReadStream(invoicePath);
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", "attachment; filename=" + invoiceName + "");
    // file.pipe(res);
  })
    .catch(err => next(err));
}

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };
