require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("./config");
const passport = require('passport'); 
const session = require('express-session');
const { vbuCollege, KolhanUniv, JRSU, JWU, DSMPU, BBMKU, NPU, RU, SKMU, SIGNUP } = require("./module");
const path = require('path');
const { escape } = require('querystring');
const port = 3000;

const staticPath = path.join(__dirname, "../Public");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(staticPath));
app.set('view engine', 'ejs');

app.use(session({
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(SIGNUP.serializeUser());
passport.deserializeUser(SIGNUP.deserializeUser());

app.get("/", (req, res) => {

    res.render('home', { logmessage: " " });
});

app.post("/", async (req, res) => {
    const InpEmail = req.body.email;
    const InpPassword = req.body.password;

    try {
        const user = await SIGNUP.findOne({ email: InpEmail });
            if (user) 
            {
                if (InpEmail == user.email && InpPassword == user.password) {

                    app.get("/student/:userid", (req, res) => {

                        res.render('Dashboard',{
                            username : user.name
                            // useremail : user.email,
                            // usermobile : user.mobileno
                        });
                    });

                        const url = escape(`${user._id}r8rhvyu98p7h9jp974w4mab34oh7kl`);
                        res.redirect(`/student/${url}`);
                } else {
                    res.status(400).render('home', { logmessage: "invalid email and password!" });
                }
            }else{
                res.status(400).render('home', { logmessage: "User doesn't exists" });
            }
    }catch (error) {
    res.status(400).render('home', { logmessage: "User doesn't exists" });
}
});

//   ---------------------- signup start -------------
app.get("/signup", (req, res) => {
    res.render('signup', { message: " " });
});

app.post("/signup", async (req, res) => {

    try{
        const newSignup = new SIGNUP({
            name: req.body.name,
            email: req.body.email,
            mobileno: req.body.mobile,
            password: req.body.password
        });

        const user = await SIGNUP.findOne({ email: req.body.email });
        const mobileuser = await SIGNUP.findOne({ mobileno: req.body.mobile });

        if(user){
            if(user.email === req.body.email){
                res.status(401).render('signup', {message: "email id already exists!"});
            }
        }
        else if(mobileuser){
            res.status(401).render('signup', {message: "mobile no already exists!"});
        }
        else{
            const registered = await newSignup.save();
            res.status(201).redirect("/signup");
        }
    }catch(err){
        console.log(err);
    }
});

//   ---------------------- signup end -------------

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