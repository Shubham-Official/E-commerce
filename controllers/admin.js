const { validationResult } = require("express-validator")

const fileHelper = require("../util/file")
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  //Below if() check is the brute way to protect manual accessing of the route, We can also use middleware to do this.
  // if (!req.session.isLoggedIn) {
  //   return res.redirect("/login");
  // }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
    //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  // const imageUrl = req.body.imageUrl;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
      //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: `/${imageUrl}`,
    userId: req.user
  });
  product
    .save()
    .then(() => {
      console.log("Product Created");
      res.redirect("/admin/products");
    }).catch(err => {
      // res.redirect("/500");
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  // ---> Using Sequelize and mysql database
  // req.user.createProduct({
  //   title: title,
  //   price: price,
  //   imageUrl: imageUrl,
  //   description: description,
  // })

  //The below code is when using the local file system.

  // const product = new Product(null, title, imageUrl, description, price);
  // product.save().then(() => { res.redirect('/'); }).catch(err => console.log(err));
  // res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;
  // Product.findById(prodId, product => {
  //   if (!product) {
  //     return res.redirect("/");
  //   }
  //   res.render('admin/edit-product', {
  //     pageTitle: 'Edit Product',
  //     path: '/admin/edit-product',
  //     editing: editMode,
  //     product: product,
  //   });
  // })

  // ---> Using sequelize
  // req.user.getProducts({ where: { id: prodId } })
  //   // Product.findByPk(prodId)
  //   .then(products => {
  //     const product = products[0];
  //     if (!product) {
  //       return res.redirect("/");
  //     }
  //     res.render("admin/edit-product", {
  //       product: product,
  //       pageTitle: "Edit Product",
  //       path: "/admin/edit-product",
  //       editing: editMode
  //     })
  //   }).catch(err => console.log(err));

  // ---> Using MongoDb
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        product: product,
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //This next(error) is a special express condition, that will route directly to the middleware which has the error argument set.
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  //Using local filesystem
  // const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDesc, updatedPrice);
  // updatedProduct.save();
  // res.redirect("/admin/products");

  // ---> Using Sequelize
  // Product.findByPk(prodId).then(product => {
  //   product.title = updatedTitle;
  //   product.price = updatedPrice;
  //   product.description = updatedDesc;
  //   product.imageUrl = updatedImageUrl;
  //   return product.save();//This will update the database.
  // }).then(result => {
  //   res.redirect("/admin/products");
  // }).catch(err => console.log(err));

  // ---> Using MongoDb
  // const product = new Product(updatedTitle, updatedPrice, updatedDesc, updatedImageUrl, prodId);
  // product.save()
  //   .then(result => {
  //     console.log("Product Updated!")
  //     res.redirect("/admin/products");
  //   })
  //   .catch(err => console.log(err));

  // ---> Using Mongoose
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
    })
  }

  Product.findById(prodId).then(product => {
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    if (image) {
      // fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    return product.save()
      .then(() => res.redirect("/admin/products"))
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getProducts = (req, res, next) => {
  // ---> Below syntax is using normal mysql query
  // Product.fetchAll(products => {
  //   res.render('admin/products', {
  //     prods: products,
  //     pageTitle: 'Admin Products',
  //     path: '/admin/products'
  //   });
  // });

  // ---> Using Sequelize
  // Product.findAll().then(products => {
  //   res.render("admin/products", {
  //     prods: products,
  //     pageTitle: "Admin Products",
  //     path: "/admin/products"
  //   })
  // }).catch(err => console.log(err));

  // ---> Using Sequelize Association methods
  // req.user.getProducts().then(products => {
  //   res.render("admin/products", {
  //     prods: products,
  //     pageTitle: "Admin Products",
  //     path: "/admin/products"
  //   })
  // }).catch(err => console.log(err));

  // ---> Using mongodb
  // Product.fetchAll()
  //   .then(products => {
  //     res.render("admin/products", {
  //       prods: products,
  //       pageTitle: "Admin Products",
  //       path: "/admin/products"
  //     })
  //   })
  //   .catch(err => console.log(err));

  // ---> Using Mongoose
  Product.find({ userId: req.user._id })
    //Now if we want to get the full details of the embedded user in the products, then we can use the inbuilt function provided by mongoose i.e populate("userId") along with attribute which we want to populate(here its userId) and also use select() function to get specific attributes.
    // .select("title price -_id")
    // .populate("userId", "name")
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        //isAuthenticated: req.session.isLoggedIn, //we have passed this using locals middleware.
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;

//   // Product.deleteById(prodId);
//   // res.redirect("/admin/products");

//   // ---> Using Sequelize
//   // Product.findByPk(prodId).then(product => {
//   //   return product.destroy();
//   // }).then(result => {
//   //   res.redirect("/admin/products");
//   // }).catch(err => console.log(err));

//   // ---> Using mongodb
//   // Product.deleteById(prodId)
//   //   .then(() => {
//   //     res.redirect("/admin/products");
//   //   })
//   //   .catch(err => console.log(err));

//   // ---> Using Mongoose
//   // Product.findById(prodId).then(product => {
//   //   if (!product) {
//   //     return next(new Error("Product not found."));
//   //   }
//   //   fileHelper.deleteFile(product.imageUrl);
//   //   return Product.deleteOne({ _id: prodId, userId: req.user._id })
//   // }).then(() => res.redirect("/admin/products"))
//   //   .catch(err => {
//   //     const error = new Error(err);
//   //     error.httpStatusCode = 500;
//   //     return next(error);
//   //   });

//   Product.deleteOne({ _id: prodId, userId: req.user._id })
//     .then(() => res.redirect("/admin/products"))
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error("Product not found."));
      }
      // fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("Product deleted");
      res.status(200).json({ message: "Success!" });//This will not render a new page.
    })
    .catch(err => {
      res.status(500).json({ message: "Failed!" });
    })
}