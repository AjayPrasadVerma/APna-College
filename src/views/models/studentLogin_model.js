const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const StudentSignup = mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name Field are Missing"],
        minLegth: 3
    },
    username: {
        type: String,
        required: [true, "Email Field are Missing"]
    },
    mobileno: {
        type: Number,
        required: [true, "mobile number are Missing"]
    },
    password: {
        type: String,
    },
    profile: String
});

StudentSignup.plugin(passportLocalMongoose);
const SIGNUP = mongoose.model("StudentSignup", StudentSignup);

module.exports = SIGNUP;