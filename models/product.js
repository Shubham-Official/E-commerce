// // const fs = require('fs');
// // const path = require('path');

// const db = require("../util/database");
// // const Cart = require("./cart");

// // const p = path.join(
// //   path.dirname(process.mainModule.filename),
// //   'data',
// //   'products.json'
// // );

// // const getProductsFromFile = cb => {
// //   fs.readFile(p, (err, fileContent) => {
// //     if (err) {
// //       cb([]);
// //     } else {
// //       cb(JSON.parse(fileContent));
// //     }
// //   });
// // };

// module.exports = class Product {
//   constructor(id, title, imageUrl, description, price) {
//     this.id = id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//   }

//   save() {

//     return db.execute("INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)",
//       [this.title, this.price, this.description, this.imageUrl]
//     )

//     // getProductsFromFile(products => {
//     //   if (this.id) {
//     //     const existingProductIndex = products.findIndex(prod => prod.id === this.id);
//     //     const updatedProducts = [...products];
//     //     updatedProducts[existingProductIndex] = this;
//     //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//     //       console.log(err);
//     //     });
//     //   } else {
//     //     this.id = Math.random().toString();
//     //     products.push(this);
//     //     fs.writeFile(p, JSON.stringify(products), err => {
//     //       console.log(err);
//     //     }); 
//     //   }
//     // });
//   }

//   static deleteById(id) {
//     // getProductsFromFile(products => {
//     //   const product = products.find(prod => prod.id === id);
//     //   const updatedProducts = products.filter(prod => prod.id !== id);
//     //   fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//     //     if (!err) {
//     //       Cart.deleteProduct(id, product.price);
//     //     }
//     //   });
//     // });
//   }

//   static fetchAll() {
//     // getProductsFromFile(cb);
//     // --->> From here we started working with database instead of a local file system.

//     return db.execute("SELECT * FROM products");
//   }

//   static findById(id) {
//     // getProductsFromFile(products => {
//     //   const product = products.find(p => p.id === id);
//     //   cb(product);
//     // });

//     // --->> From here we started working with database instead of a local file system.

//     return db.execute("SELECT * FROM products WHERE products.id = ?", [id])
//   }
// };

// -->Using Sequelize for MySql

// const Sequelize = require("sequelize");

// const sequelize = require("../util/database");

// const Product = sequelize.define("product", {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   title: Sequelize.STRING,
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false
//   }
// });

// module.exports = Product;

// ---> Using mongodb

// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update the product
//       dbOp = db.collection("products").updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db
//         .collection("products")
//         .insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => console.log(err));
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then(products => {
//         return products;
//       })
//       .catch(err => console.log(err));
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db.collection("products")
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then(product => {
//         console.log(product);
//         return product;
//       })
//       .catch(err => console.log(err));
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return db.collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then(result => {
//         console.log("Deleted!");
//       })
//       .catch(err => console.log(err));
//   }
// }

// module.exports = Product;

// ---> Using Mongoose

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  // We are not adding the id because it will automatically be added by mongodb.
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = mongoose.model("Product", productSchema);