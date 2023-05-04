require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('./views/config');
const { vbuCollege, KolhanUniv, JRSU, JWU, DSMPU, BBMKU, NPU, RU, SKMU } = require("./views/models/college_model");
const SIGNUP = require('./views/models/studentLogin_model');
const { clgLoginModel, clgAppliModel } = require("./views/models/collegeLogin_model");
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const port = 3000;

const staticPath = path.join(__dirname, "../Public");

app.use(express.static(staticPath));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

passport.use('student', new LocalStrategy(SIGNUP.authenticate()));
passport.use('college', new LocalStrategy(clgLoginModel.authenticate()));

passport.serializeUser((user, done) => {
    done(null, { _id: user._id, type: user.constructor.modelName });
});

passport.deserializeUser((obj, done) => {
    const Model = (obj.type == 'StudentSignup' ? SIGNUP : clgLoginModel);
    Model.findById(obj._id, (err, user) => {
        done(err, user);
    })
})

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res) => {

    res.render('home', { logmessage: req.session.err });
});

app.get("/signup", (req, res) => {
    res.render('signup', { message: req.session.signupErr });
})

// ----------------- Signup Start ----------------------

app.post("/signup", async (req, res) => {

    try {

        const username = await SIGNUP.findOne({ username: req.body.username });
        const usermobile = await SIGNUP.findOne({ mobileno: req.body.mobile });

        if (username) {
            req.session.signupErr = "Email Id already exist!";
            return res.redirect('/signup');
        }
        else if (usermobile) {
            req.session.err = "Mobile no already exist!";
            return res.redirect('/signup');
        }
        else {
            await SIGNUP.register(new SIGNUP({
                name: req.body.name,
                username: req.body.username, // email
                mobileno: req.body.mobile,
                profile: "userdemo.png"
            }),
                req.body.password,
                function (err, user) {

                    if (err) {
                        console.log(err);
                        req.session.signupErr = "Something went wrong please try again";
                        res.redirect('/signup');
                    }
                    else {
                        passport.authenticate("student")(req, res, function () {
                            req.session.signupErr = "Account Successfully Created Please Login!";
                            res.redirect('/signup');
                        });
                    }

                }
            )
        }

    } catch (err) {
        console.log(err);
    }
});

//  ---------------- Signup end -----------------------

app.get("/student/dashboard", async (req, res) => {

    try {
        const stud = await SIGNUP.findOne({ username: req.session.usr });

        if (req.isAuthenticated()) {
            res.render('Dashboard', {
                username: stud.name,
                useremail: stud.username,
                usermobile: stud.mobileno,
                userprofile: stud.profile
            });

        } else {
            res.redirect("/");
        }
    } catch (err) {
        console.log(err);
    }
})


//-------------------- login start ---------------------

app.post("/", async (req, res) => {

    try {
        const logStu = new SIGNUP({
            username: req.body.username,
            password: req.body.password
        });

        if (req.body.username != "" || req.body.password != "") {
            const stud = await SIGNUP.findOne({ username: req.body.username });
            if (stud) {
                await passport.authenticate("student", function (err, logStu, info) {
                    if (!logStu) {
                        req.session.err = "Invalid Username and Password!";
                        return res.redirect('/');
                    }

                    req.logIn(logStu, async function (err) {
                        if (err) {
                            console.log(err);
                            req.session.err = "Someting went wrong!";
                            res.redirect('/');
                        } else {
                            req.session.usr = stud.username;
                            res.redirect("/student/dashboard");
                        }
                    });
                })(req, res);

            } else {
                req.session.err = "User does not exists!";
                res.redirect('/');
            }
        } else {
            req.session.err = "All field are mandatory!";
            res.redirect('/');
        }
    } catch (error) {
        console.log("Catch error : " + error);
    }
});

// ------------------- logout start ------------------
app.get("/logout", (req, res) => {

    req.logOut(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});
// ------------------- logout end --------------------

//------------------------- Instute part start ----------

// Define the authentication strategy for the collegeLoginModal model
app.get("/collegelogin", (req, res) => {
    res.render("CollegeLogin", { LogMessage: req.session.LogErr });
});

app.get("/college/collegeprofile", async (req, res) => {

    try {
        const clgFound = await clgLoginModel.findOne({ username: req.session.clgusr });

        if (req.isAuthenticated()) {
            res.render("CollegeProfile", {
                username: clgFound.Coll_Name,
                userprofile: clgFound.profile
            });
        } else {
            res.redirect("/collegelogin")
        }
    } catch (e) {
        console.log(err);
    }
});

app.get("/collegesignup", async (req, res) => {

    const vbucollege = await vbuCollege.find({});
    const koluniv = await KolhanUniv.find({}).sort({ _id: 1 });
    const Jrsu = await JRSU.find({}).sort({ _id: 1 });
    const Jrw = await JWU.find({}).sort({ _id: 1 });
    const Dsmpu = await DSMPU.find({}).sort({ _id: 1 });
    const Bbmku = await BBMKU.find({}).sort({ _id: 1 });
    const Npu = await NPU.find({}).sort({ _id: 1 });
    const Ru = await RU.find({}).sort({ _id: 1 });
    const Skmu = await SKMU.find({}).sort({ _id: 1 });

    const allCollName = await [...vbucollege, ...koluniv, ...Jrsu, ...Jrw, ...Dsmpu, ...Bbmku, ...Npu, ...Ru, ...Skmu];

    res.render("CollegeSignUp", { message: req.session.clgSign, college: allCollName });

})


// --------------- college Signup start ------------

app.post("/collegesignup", async (req, res) => {

    try {
        const collName = await clgLoginModel.findOne({ username: req.body.instute });

        if (collName) {
            req.session.clgSign = "Account already exist!";
            return res.redirect("/collegesignup");
        }
        else {
            await clgLoginModel.register(new clgLoginModel({
                Coll_Name: req.body.instute,
                username: req.body.username,     // college_code
                profile: "userdemo.png"
            }), req.body.password, function (err, college) {
                if (err) {
                    console.log("Error : " + err);
                    res.redirect("/collegesignup");
                } else {
                    passport.authenticate('college')(req, res, function () {
                        req.session.clgSign = "Account Successfully created please login!";
                        res.redirect("/collegesignup");
                    });
                }
            });
        }
    } catch (err) {
        console.log("Error Catched : " + err);
    }

})

// --------------- college Signup end --------------
// --------------- college login start --------------

app.post("/collegelogin", async (req, res) => {

    try {
        const logStu = new clgLoginModel({
            username: req.body.username,
            password: req.body.password
        });

        if (req.body.username != "" || req.body.password != "") {
            const stud = await clgLoginModel.findOne({ username: req.body.username });
            if (stud) {
                await passport.authenticate("college", function (err, logStu, info) {
                    if (!logStu) {
                        req.session.LogErr = "Invalid Username and Password!";
                        return res.redirect('/collegelogin');
                    }

                    req.logIn(logStu, async function (err) {
                        if (err) {
                            console.log(err);
                            req.session.LogErr = "Someting went wrong!";
                            res.redirect('/collegelogin');
                        } else {
                            req.session.clgusr = stud.username;
                            res.redirect("/college/collegeprofile");
                        }
                    });
                })(req, res);

            } else {
                req.session.LogErr = "User does not exists!";
                res.redirect('/collegelogin');
            }
        } else {
            req.session.LogErr = "All field are mandatory!";
            res.redirect('/collegelogin');
        }
    } catch (error) {
        console.log("Catch error : " + error);
    }
});

// --------------- college login end --------------
// ------------ open application ------------------
app.get("/college/collegeprofile/application", async (req, res) => {

    try {
        const clgFound = await clgLoginModel.findOne({ username: req.session.clgusr });
        if (req.isAuthenticated()) {
            res.render('collegeApplication', { username: clgFound.Coll_Name, year: year, successMsg: req.session.appSuccess });
        } else {
            res.redirect("/collegelogin")
        }
    } catch (err) {
        console.log(err);
    }

})

app.post("/clgapplication", async (req, res) => {
    // const value = req.body;
    // console.log("all data" + value);

    const openApplication = new clgAppliModel({
        collegeName: req.body.collegeName,
        courseType: req.body.courseType,
        from: req.body.from,
        To: req.body.to,
        PgCourse: req.body.PgCourse,
        notice: req.body.notice
    });

    try {
        await openApplication.save();
        req.session.appSuccess = "Application Successfully Submited!";
        res.redirect("/college/collegeprofile");
    } catch (err) {
        console.log(err);
    }
})

//------------------------- Instute part end ----------
//   ---------------------- application start -----------

app.get("/student/dashboard/applicatiion", async (req, res) => {

    try {
        const stud = await SIGNUP.findOne({ username: req.session.usr });

        if (req.isAuthenticated()) {
            res.render('Application', {
                username: stud.name,
                useremail: stud.username,
                usermobile: stud.mobileno,
                userprofile: stud.profile,
                Course: [req.session.course, req.session.crs],
                session: req.session.session,
                appNo: req.session.appNo,
                formNo: req.session.formNo
            });

        } else {
            res.redirect("/");
        }
    } catch (err) {
        console.log(err);
    }
})

// Generate a unique form number using timestamp 
function generateRegistrationNumber() {
    const timestamp = new Date().getTime();
    const registrationNumber = timestamp + timestamp;
    return registrationNumber;
}

const formNo = generateRegistrationNumber() + generateRegistrationNumber();

const year = new Date().getFullYear();

app.post("/application", (req, res) => {
    const Course = req.body.course;
    req.session.crs = Course;
    req.session.course = Course === "UG" ? `Under Graduate Admission ${year}` : `Post Graduate Admission ${year}`;
    req.session.session = Course === "UG" ? `${year}-${year + 3}` : `${year}-${year + 2}`;
    req.session.appNo = generateRegistrationNumber().toString().substring(4, 12);
    req.session.formNo = formNo.toString().substring(7, 12);

    res.redirect("/student/dashboard/applicatiion");
})


//   ---------------------- application end -------------

app.get("/university", async (req, res) => {

    const vbucollege = await vbuCollege.find({});
    const koluniv = await KolhanUniv.find({}).sort({ _id: 1 });
    const Jrsu = await JRSU.find({}).sort({ _id: 1 });
    const Jrw = await JWU.find({}).sort({ _id: 1 });
    const Dsmpu = await DSMPU.find({}).sort({ _id: 1 });
    const Bbmku = await BBMKU.find({}).sort({ _id: 1 });
    const Npu = await NPU.find({}).sort({ _id: 1 });
    const Ru = await RU.find({}).sort({ _id: 1 });
    const Skmu = await SKMU.find({}).sort({ _id: 1 });

    await res.render('University', {
        vbuCollege: vbucollege,
        kolhanUniv: koluniv,
        jrsu: Jrsu,
        jrw: Jrw,
        dsmpu: Dsmpu,
        bbmku: Bbmku,
        npu: Npu,
        ru: Ru,
        skmu: Skmu
    });
});


app.listen(port, () => {
    console.log(`we are listening at port number ${port}`);
})