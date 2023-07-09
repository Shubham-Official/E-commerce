const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin)

router.get("/signup", authController.getSignup)

router.post("/login",
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email address.")
            .normalizeEmail(),
        body("password", "Enter a valid Password!")
            .isLength({ min: 5 })
            .isAlphanumeric()
    ],
    authController.postLogin);

router.post("/signup",
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email")
            //below is the custom validator which we can add.
            .custom((value, { req }) => {
                // if (value === "check@test.com") {
                //     throw new Error("This email is not allowed!")
                // }
                // return true;
                return User.findOne({
                    email: value
                }).
                    then(userDoc => {
                        if (userDoc) {
                            return Promise.reject("Email already exists, Login instead!")
                        }
                    });
            })
            .normalizeEmail(),
        body("password", "Password should be atlest 5 in length and alphanumeric")
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        body("confirmPassword")
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Passwords should match!")
                }
                return true;
            })
    ],
    authController.postSignup);

router.post("/logout", authController.postLogout);

module.exports = router;