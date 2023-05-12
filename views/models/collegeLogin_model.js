const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const collegeLogin = mongoose.Schema({
    university: {
        type: String,
        required: true,
    },
    coll_name: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    profile: String
})

const collegeApplication = mongoose.Schema({
    university: String,
    collegeName: String,
    courseType: String,
    from: Date,
    To: Date,
    course: Array,
    notice: String
})

collegeLogin.plugin(passportLocalMongoose);
const clgLoginModel = mongoose.model("collegeSignup", collegeLogin);
const clgAppliModel = mongoose.model("openApplication", collegeApplication);

module.exports = { clgLoginModel, clgAppliModel };

