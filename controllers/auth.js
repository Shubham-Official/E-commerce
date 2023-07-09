const User = require("../models/user");

const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req
    //     .get("Cookie")
    //     .split("=")[1];
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
        },
        validationErrors: [],
        //isAuthenticated: false, // Passed using locals middleware
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationErrors: [],
        //isAuthenticated: false, // Passed using locals middleware
    })
}

exports.postLogin = (req, res, next) => {
    //We can give more properties ({key:value} pair) to the setHeader function.
    // res.setHeader("Set-Cookie", "loggedIn=true"); this is the cookies example

    // --> below is session example
    // User.findById("648f63286226614f74eff215")
    //     .then(user => {
    //         req.session.isLoggedIn = true;
    //         req.session.user = user;
    //         req.session.save((err) => {
    //             console.log(err);
    //             res.redirect("/");
    //         })
    //     })
    //     .catch(err => console.log(err));

    // ---> Using authentication
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: errors.array(),
            //isAuthenticated: false, // Passed using locals middleware
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                //We have installed another package for flash requests.
                // req.flash("error", "Invalid email or password."); Done using validation.
                return res.status(422).render("auth/login", {
                    path: "/login",
                    pageTitle: "Login",
                    errorMessage: "Invalid email or password.",
                    oldInput: {
                        email: email,
                        password: password,
                    },
                    validationErrors: [],
                    //isAuthenticated: false, // Passed using locals middleware
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect("/");
                        })
                    }
                    // req.flash("error", "Invalid email or password.");
                    // res.redirect("/login");
                    return res.status(422).render("auth/login", {
                        path: "/login",
                        pageTitle: "Login",
                        errorMessage: "Invalid email or password.",
                        oldInput: {
                            email: email,
                            password: password,
                        },
                        validationErrors: [],
                        //isAuthenticated: false, // Passed using locals middleware
                    });
                })
                .catch(err => {
                    console.log(err)
                    res.redirect("/login");
                });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
            path: "/signup",
            pageTitle: "Signup",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array(),
            //isAuthenticated: false, // Passed using locals middleware
        });
    }
    // Done using express validation package.
    // User.findOne({
    //     email: email
    // }).
    //     then(userDoc => {
    //         if (userDoc) {
    //             req.flash("error", "Email already exists, Login instead!");
    //             return res.redirect("/login");
    //         }
    bcrypt.hash(password, 12).then(hashedPassword => {
        const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
        })
        return user.save();
    })
        .then(() => {
            res.redirect("/login");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect("/");
    });
};
