const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const collegeLogin = mongoose.Schema({

    Coll_Name: String,
    username: String,
    password: String,
    profile: String
})

collegeLogin.plugin(passportLocalMongoose);
const clgLoginModel = mongoose.model("collegeLogin", collegeLogin);


module.exports = clgLoginModel;

