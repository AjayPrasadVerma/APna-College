require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connectBD = require('./config');
const { vbuCollege, KolhanUniv, JRSU, JWU, DSMPU, BBMKU, NPU, RU, SKMU, application } = require("./views/models/college_model");
const SIGNUP = require('./views/models/studentLogin_model');
const { clgLoginModel, clgAppliModel } = require("./views/models/collegeLogin_model");
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const moment = require('moment-timezone');
const multer = require('multer');
const path = require('path');
const port = process.env.PORT;

connectBD();

const staticPath = path.join(__dirname, "./Public");
const uploadPath = path.join(__dirname, "./upload");

app.use(express.static(staticPath));
app.use(express.static(uploadPath));
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

const Storage = multer.diskStorage({
    destination: "../upload",
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
})

const upload = multer({ storage: Storage });

app.get('/refresh', (req, res) => {

    if (req.session.signupErr) {

        delete req.session.signupErr;
    }
    res.redirect('/signup');
});

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
        const stuApp = await application.find({ emailId: stud.username })

        if (req.isAuthenticated()) {
            res.render('Dashboard', {
                username: stud.name,
                useremail: stud.username,
                usermobile: stud.mobileno,
                userprofile: stud.profile,
                appDetails: stuApp
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

        const collName = clgFound.coll_name;

        const ugAppFound = await clgAppliModel.find({ collegeName: collName, courseType: "UG" });
        const pgAppFound = await clgAppliModel.find({ collegeName: collName, courseType: "PG" });

        if (req.isAuthenticated()) {
            res.render("CollegeProfile", {
                username: clgFound.coll_name,
                userprofile: clgFound.profile,
                ugApplication: ugAppFound,
                pgApplication: pgAppFound,
            });
        } else {
            res.redirect("/collegelogin")
        }
    } catch (err) {
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
        const collName = await clgLoginModel.findOne({ coll_name: req.body.instute });

        // console.log(req.body.instute);
        // console.log(collName);
        // console.log(req.body.univ,);

        if (collName) {
            req.session.clgSign = "Account already exist!";
            return res.redirect("/collegesignup");
        }
        else {
            await clgLoginModel.register(new clgLoginModel({
                university: req.body.university,
                coll_name: req.body.instute,
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
            res.render('collegeApplication', {
                username: clgFound.coll_name,
                year: year,
                university: clgFound.university
            });
        } else {
            res.redirect("/collegelogin")
        }
    } catch (err) {
        console.log(err);
    }

})

app.get("/college/collegeprofile/application/update", async (req, res) => {

    const id = req.query.id;
    try {
        const applcationFound = await clgAppliModel.findById(id);

        const fromDate = moment.tz(applcationFound.from, 'Asia/Kolkata');
        const from = fromDate.format('YYYY-MM-DD hh:mm A');

        const toDate = moment.tz(applcationFound.To, 'Asia/Kolkata');
        const to = toDate.format('YYYY-MM-DD hh:mm A');


        // console.log("from : " + from);
        // console.log("to : " + to);

        if (req.isAuthenticated()) {
            res.render('clgAppUpdate', {
                year: year,
                appDetails: applcationFound,
                start: applcationFound.from,
                end: applcationFound.To
            });
        } else {
            res.redirect("/collegelogin")
        }
    } catch (err) {
        console.log(err);
    }

});

app.post("/update/:id", async (req, res) => {

    const id = req.params.id;

    // convert to moment object and set the timezone to Indian Standard Time
    const fromDate = moment.tz(req.body.from, 'Asia/Kolkata');
    // format the date in 12-hour format with Indian time standard
    const from = fromDate.format('YYYY-MM-DD hh:mm A');

    const toDate = moment.tz(req.body.to, 'Asia/Kolkata');
    const to = toDate.format('YYYY-MM-DD hh:mm A');

    // console.log("from : " + from);
    // console.log("to : " + to);

    const updatedData = {
        ...req.body,
        from: from,
        To: to
    };

    try {
        const updatedApplication = await clgAppliModel.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
        console.log("Application Successfully Updated!");
        res.redirect("/college/collegeprofile");
    }
    catch (err) {
        console.log("Catched error : " + err);
        // res.status(500).send(err);
    }
});

app.get("/college/collegeprofile/studentapplication", async (req, res) => {

    try {
        const clgFound = await clgLoginModel.findOne({ username: req.session.clgusr });

        const collName = clgFound.coll_name;

        const ugAppFound = await application.find({ collegeName: collName, course: "UG" });
        const pgAppFound = await application.find({ collegeName: collName, course: "PG" });

        if (req.isAuthenticated()) {
            res.render("viewApplication", { ugApplication: ugAppFound, pgApplication: pgAppFound });
        } else {
            res.redirect("/collegelogin")
        }
    } catch (err) {
        console.log(err);
    }
})

app.post("/application/status/:id", async (req, res) => {

    const id = req.params.id;
    const update = (req.body.reject) === 'Rejected' ? 'Rejected' : 'Accept';

    try {
        await application.findByIdAndUpdate(id, { $set: { status: update } }, { new: true });
        console.log("status updated successfully!");
        res.redirect("/college/collegeprofile/studentapplication");
    } catch (err) {
        console.log(err);
    }



})

app.post("/clgapplication", async (req, res) => {
    // const value = req.body;
    // console.log("all data" + value);

    const fromDate = moment.tz(req.body.from, 'Asia/Kolkata');
    const from = fromDate.format('YYYY-MM-DD hh:mm A');

    const toDate = moment.tz(req.body.to, 'Asia/Kolkata');
    const to = toDate.format('YYYY-MM-DD hh:mm A');

    const openApplication = new clgAppliModel({
        university: req.body.universityName,
        collegeName: req.body.collegeName,
        courseType: req.body.courseType,
        from: from,
        To: to,
        course: req.body.course,
        notice: req.body.notice
    });

    try {
        if (req.isAuthenticated()) {
            await openApplication.save();
            req.session.appSuccess = "Application Successfully Submited!";
            res.redirect("/college/collegeprofile");
        } else {
            res.redirect("/collegelogin")
        }
    } catch (err) {
        console.log(err);
    }
})

app.post("/clgappdelete", (req, res) => {

    clgAppliModel.findByIdAndRemove(req.body.delInp, function (err) {
        if (err) {
            console.log(err);
            res.redirect("//college/collegeprofile");
        }
        else {
            console.log("Record Successfully deleted .......");
            res.redirect("/college/collegeprofile");
        }
    });
})

//------------------------- Instute part end ----------
//   ---------------------- application start -----------

app.get("/student/dashboard/applicatiion", async (req, res) => {

    const today = new Date();

    try {
        const stud = await SIGNUP.findOne({ username: req.session.usr });
        const college = await clgAppliModel.find({
            $and: [
                { from: { $lte: today } },
                { To: { $gte: today } }
            ]
        });

        if (req.isAuthenticated()) {
            res.render('Application', {
                username: stud.name,
                useremail: stud.username,
                usermobile: stud.mobileno,
                userprofile: stud.profile,
                Course: [req.session.course, req.session.crs],
                session: req.session.session,
                appNo: req.session.appNo,
                formNo: req.session.formNo,
                clgOpen: college
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

const year = new Date().getFullYear();

app.post("/application", (req, res) => {

    const formNo = generateRegistrationNumber() + generateRegistrationNumber();

    const Course = req.body.course;
    req.session.crs = Course;
    req.session.course = Course === "UG" ? `Under Graduate Admission ${year}` : `Post Graduate Admission ${year}`;
    req.session.session = Course === "UG" ? `${year}-${year + 3}` : `${year}-${year + 2}`;
    req.session.appNo = generateRegistrationNumber().toString().substring(4, 12);
    req.session.formNo = formNo.toString().substring(7, 12);

    res.redirect("/student/dashboard/applicatiion");
})

app.post("/stuapplication", upload.fields([
    { name: 'photofile', maxCount: 1 },
    { name: 'sigfile', maxCount: 1 }
]), (req, res) => {

    const { photofile, sigfile } = req.files;

    // console.log(photofile[0].filename);
    // console.log(sigfile[0].filename);

    const newApplication = new application({
        appliedSession: req.body.appliedSession,
        applicationNo: req.body.applicationNo,
        formNo: req.body.formNo,
        course: req.body.course,
        fName: req.body.fName,
        mName: req.body.mName,
        lName: req.body.lName,
        fatherName: req.body.FatherName,
        motherName: req.body.MotherName,
        mobileNo: req.body.mobileNo,
        emailId: req.body.emailId,
        gender: req.body.gender,
        cast: req.body.cast,
        dateOfBirth: req.body.dob,
        addressLine1: req.body.addL1,
        addressLine2: req.body.addL2,
        block: req.body.block,
        district: req.body.distric,
        pincode: req.body.pinCode,
        lastPassedExam: req.body.lastPassedExam,
        universityNameLastPassed: req.body.LPassUniversity,
        session: req.body.session,
        registrationNo: req.body.regNo,
        passingYear: req.body.passYear,
        courseTypeStudied: req.body.courseTypeStudied,
        subjectStudied: req.body.subject,
        cgpa: req.body.cgpa,
        percentageOfMarks: req.body.percentMarks,
        totalCredit: req.body.totalMarks,
        totalSecuredCredit: req.body.totalMarksSecured,
        university: req.body.univName,
        collegeName: req.body.clgName,
        stream: req.body.stream,
        courseType: req.body.courseType,
        status: "pending",
        photo: photofile[0].filename,
        signature: sigfile[0].filename
    })

    try {
        newApplication.save();
        res.redirect("/student/dashboard");
    } catch (err) {
        console.log(err);
    }
});

app.get("/student/print", async (req, res) => {

    const id = req.query.id;
    const stuDetails = await application.findById(id);
    res.render("./print", { details: stuDetails });
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

app.get("/notification", async (req, res) => {

    try {
        const college = await clgAppliModel.find({});
        res.render("notification", { clgNotice: college });

    } catch (err) {
        console.log(err);
    }
})

app.get("/contact", (req, res) => {
    res.render("contact");
})

app.listen(port, () => {
    console.log(`we are listening at port number ${port}`);
})