const path = require('path');
const fs = require("fs");

const express = require('express');
const favicon = require("express-favicon");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const morgan = require("morgan");


const errorController = require('./controllers/error');
// const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");
// const db = require("./util/database");

// Below code is for sequelize and mysql
// const sequelize = require("./util/database");
// const Product = require("./models/product");
// const User = require("./models/user");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");
// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@atlascluster.2wqf5jm.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?w=majority`;

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        let date = new Date().toISOString().slice(0, 10);

        cb(null, date + "." + file.originalname.split(".")[1]);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {

        cb(null, false);
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" }); // This is used by morgan to log access details.

app.use(helmet()); //Third party package to add additional security Header.
app.use(morgan("combined", { stream: accessLogStream })); //Third party package to add logging details. 

// The app.use only registers a middleware, the incoming request call the function in it.
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(bodyParser.urlencoded({ extended: false })); //To accept incoming post data from user, Ex: login form and signup form data.
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
//The express.static now treats the files in theses folders(public, images) as if they were in the root directory.
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: "my secret",// This string is used for signing the hash which is set by express-session package automatically.
    resave: false,
    saveUninitialized: false,
    store: store
})
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    //This allows us to set local variables that are passed into the views.
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use((req, res, next) => {
    //throw new Error("Dummy"); //Outside promises the throw err will lead to the global error middleware.Inside promises(async code) this is not the case.
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            //Inside Promises or async code we have to use next(new Error(err)).
            next(new Error(err));
            //throw new Error(err); //This will not lead to global error middleware.
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

//When we call next(error) from our controllers, the execution automatically passes to the middlewares with the error arguments in them.If we have more than one error-handling middleware, they'll execute from top to bottom. Just like the normal middleware.
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn,
    });
})

// app.use((req, res, next) => {
//     // Sequelize below 
//     // User.findByPk(1).then(user => {
//     //     req.user = user;
//     //     next();
//     // }).catch(err => console.log(err));

//     // ---> Using Mongodb
//     // User.findById("648752afa09ec24f6c0d2b66")
//     //     .then(user => {
//     //         req.user = new User(user.name, user.email, user.cart, user._id);
//     //         next();
//     //     })
//     //     .catch(err => console.log(err))

//     //---> Using mongoose
//     User.findById("648f63286226614f74eff215")
//         .then(user => {
//             req.user = user;
//             next();
//         })
//         .catch(err => console.log(err))
// });

// Below are the Sequelize Associations. Associations are nothing but the relationship between the table i.e one-to-one, one-to-many, many-to-one, many-to-many.
// Product.belongsTo(User, {
//     constraints: true,
//     onDelete: "CASCADE"
// });
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });
// //Associations End

// sequelize
//     // .sync({ force: true }) // To always overwrite the data we store. 
//     .sync()
//     .then(result => {
//         return User.findByPk(1);
//     })
//     .then(user => {
//         if (!user) {
//             return User.create({ name: "Shubham", email: "popop@nodejs.com" });
//         }
//         // If we return a value in a then block then it automatically wrapped into promise.
//         return user;
//     })
//     .then(user => {
//         // console.log(user);
//         return user.createCart();
//     })
//     .then(cart => {
//         app.listen(2000);
//     })
//     .catch(err => {
//         console.log(err);
//     });

// app.listen(2000);

// mongoConnect(() => {
//     app.listen(2000);
// })

// ---> Using Mongoose
mongoose.connect(MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT || 2000);
    })
    .catch(err => console.log(err));