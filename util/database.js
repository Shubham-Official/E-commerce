// const mysql = require("mysql2");

// const pool = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     database: "node-complete",
//     password: "Shubham@01"
// });

// module.exports = pool.promise();

// ---> Below is sequelize connection.
// const Sequelize = require("sequelize");

// const sequelize = new Sequelize("node-complete", "root", "Shubham@01", { dialect: "mysql", host: "localhost" });

// module.exports = sequelize;

// ---> Below is mongodb connection.
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect("mongodb+srv://E-commerce:k9VsnWqU7gGzI6vI@atlascluster.2wqf5jm.mongodb.net/?retryWrites=true&w=majority")
        .then(client => {
            console.log("connected!");
            _db = client.db("shop");
            callback();
        })
        .catch(err => {
            console.log(err)
            throw err;
        });
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No Database found!";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;


