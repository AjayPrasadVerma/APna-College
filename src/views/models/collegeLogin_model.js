const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const collegeLogin = mongoose.Schema({

    Coll_Name: String,
    username: String,
    password: String,
    profile: String
})

const collegeApplication = mongoose.Schema({
    collegeName: String,
    courseType: String,
    from: Date,
    To: Date,
    PgCourse: Array,
    notice: String
})

collegeLogin.plugin(passportLocalMongoose);
const clgLoginModel = mongoose.model("collegeLogin", collegeLogin);
const clgAppliModel = mongoose.model("openApplication", collegeApplication);

module.exports = { clgLoginModel, clgAppliModel };

