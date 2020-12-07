//Module Dependences

require("dotenv").config();
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
// const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { time } = require('console');
const { getMaxListeners } = require('process');
const ejs = require("ejs");
var url = require('url');

// Auth dependencies

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { Strategy } = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");


//List of Variables
const app = express();
const hostname = '127.0.0.1';
const port = process.env.PORT || '80';

app.use(express.urlencoded({ extended: true }));

// Setting up view-engine
app.set("view engine", "ejs");

//body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// For Serving Static Files
app.use(express.static(__dirname + '/public'));

// For Setting session
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);


app.use(passport.initialize());

app.use(passport.session());

// Mongoose details
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Mongoose is connected!');
});


const userSchema = new mongoose.Schema({
    username: String,
    displayName: String,
    picture: String,
    email: {
        type: String,
        unique: false,
    },
    password: String,
    googleId: String,
    facebookId: String,
    authType: String
});

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    authType: String
});

const Admin = new mongoose.model("Admin", adminSchema);

const quizDataSchema = new mongoose.Schema({
    username: String,
    categoryId: Number,
    levelId: Number,
    question: String,
    option1: String,
    option2: String,
    option3: String,
    option4: String,
    correct: Number,
});

const QuizData = new mongoose.model("QuizData", quizDataSchema);

const progressDataSchema = new mongoose.Schema({
    username: String,
    uniqueId: String,
    cateId: Number,
    levelId: Number,
    score: Number,
    levelLength: Number
});

const ProgressData = new mongoose.model("ProgressData", progressDataSchema);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate); // for findandCreate

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

//Passport local mongoose
passport.serializeUser(function (user, done) {

    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {

        done(err, user);
    });
});


// for googleauth
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "https://quiztown.herokuapp.com/auth/google/home",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        function (accessToken, refreshToken, profile, cb) {

            console.log(profile);

            //create or find this user on our database
            User.findOrCreate({ googleId: profile.id, username: profile.displayName, picture: profile.photos[0].value, authType: "google" }, function (err, user) {
                return cb(err, user);
            });
        }
    )
);

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));//  if this is successfull then google makes request to the route below

// /auth/google/callback is actually the same url you give in developer console for redirecting
app.get(
    "/auth/google/home",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
        // here we will authenticate locally and then save the session of the user
        // Successful authentication, redirect home.
        res.redirect("/categories");
    }
);



// for facebook
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: "https://quiztown.herokuapp.com/auth/facebook/home",
        },
        function (accessToken, refreshToken, profile, cb) {
            console.log(profile);
            let profilePic = `https://graph.facebook.com/${profile.id}/picture?type=square`;
            User.findOrCreate({ facebookId: profile.id, username: profile.username, picture: profilePic, displayName: profile.displayName, authType: "facebook" }, function (err, user) {
                return cb(err, user);
            });
        }
    )
);

app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

app.get(
    "/auth/facebook/home",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/categories");
    }
);


app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/addnewquestions", function (req, res) {

    let quizData = new QuizData(req.body);
    quizData.save();

    res.redirect(url.format({
        pathname: `/admin`,
        query: {
            message: "Your data has been saved to database. Thanks for adding 😊."
        }
    }));

});

app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect(url.format({
                pathname: `/register`,
                query: {
                    message: "A user with same username already exists."
                }
            }));
        } else {
            passport.authenticate("local")(req, res, function () {
                console.log(user);
                res.redirect("/categories");
            });
        }
    });
});


app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/categories");
            });
        }
    });
});


app.post("/newsletter", (req, res) => {
    //Schema
    const Schema = mongoose.Schema;
    const newsletterSchema = new Schema({
        email: String
    });

    //Model
    const newsletter = mongoose.model('newsletter', newsletterSchema);
    var newsletter_email = new newsletter(req.body);

    //Newsletter
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });

    var mailOptions = {
        from: 'process.env.EMAIL',
        to: newsletter_email,
        subject: 'Sending Email using Node.js',
        text: '<p>Thanks for subscribing to our newletter. </p><br><p>Team QuizTown</p>'
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.send('Your email has been registered for newsletter!');
});

app.post("/contact", (req, res) => {
    //Schema
    //   const Schema = mongoose.Schema;
    const contactSchema = new Schema({
        name: String,
        email: String,
        phone: String,
        message: String
    });

    //Model
    const contact = mongoose.model('contact', contactSchema);
    var newContact = new contact(req.body);

    newContact.save().then((data) => {
        res.send('Hey, Your message is sent to QuizTown!');
    })
        .catch((error) => {
            res.status(400).send('Oops,Something wrong happened');
        });
});


//End points

app.get('/', (req, res) => {
    let pageTitle = "Brain storming quiz point";
    let myUser;
    if (req.user)
        myUser = req.user;
    res.render("index", { userData: myUser, pageTitle });
});
app.get('/about', (req, res) => {
    let pageTitle = "About";
    let myUser;
    if (req.user)
        myUser = req.user;
    res.render("about", { userData: myUser, pageTitle });
});
app.get('/instruction', (req, res) => {
    let pageTitle = "Instructions";
    let myUser;
    if (req.user)
        myUser = req.user;
    res.render("instruction", { userData: myUser, pageTitle });
});

app.get('/contact', (req, res) => {
    let pageTitle = "Contact";
    let myUser;
    if (req.user)
        myUser = req.user;
    res.render("contact", { userData: myUser, pageTitle });
});
app.get('/register', (req, res) => {
    let message = "";
    let pageTitle = "Register";
    if (req.query.message != "") {
        message = req.query.message;
    }
    res.render("register", { updateMessage: message, pageTitle });
});
app.get('/login', (req, res) => {
    let pageTitle = "Login";
    let message = "";
    if (req.query.message != "") {
        message = req.query.message;
    }
    res.render("login", { updateMessage: message, pageTitle });
});
app.get('/feedback', (req, res) => {
    let pageTitle = "Feedback";
    let myUser;
    if (req.user)
        myUser = req.user;
    res.render("feedback", { userData: myUser, pageTitle });
});

app.get('/admin', (req, res) => {
    let pageTitle = "admin";
    let message = "";
    if (req.query.message != "") {
        message = req.query.message;
    }

    if (req.isAuthenticated()) {
        let allAdmins;
        Admin.find({}, (err, admins) => {
            if (err)
                console.log(err);
            else {
                allAdmins = admins;
                console.log(allAdmins, "all");

                for (let i = 0; i < allAdmins.length; i++) {
                    console.log("all");
                    console.log(allAdmins[i].username, "372");
                    console.log(allAdmins[i].authType, "373");
                    console.log(req.user);

                    if ((req.user.username == allAdmins[i].username) && (allAdmins[i].authType == "local")) {
                        // this means local auth 
                        console.log(req.user);

                        let myUser = req.user;
                        res.render("admin", { updateMessage: message, userData: myUser, pageTitle });
                        break;
                        // this exits the for loop
                    }
                    else if ((req.user.username != allAdmins[i].username)) {
                        console.log(allAdmins[i].authType, "381");
                        res.redirect(url.format({
                            pathname: `/login`,
                            query: {
                                message: "Your are not allowed to visit this page.  If you are admin login using admin details."
                            }
                        }));
                        break;
                        // this exits the for loop
                    }
                }
            }
        });
    }
    else {
        res.redirect("/login");
    }
});

app.get('/categories', (req, res) => {
    let pageTitle = "Categories";
    if (req.isAuthenticated()) {
        console.log(req.user);
        res.render("categories", { userData: req.user, pageTitle });
    }
    else {
        res.redirect("/login");
    }
});
app.post("/quizlevels", (req, res) => {
    let pageTitle = "Levels";
    if (req.isAuthenticated()) {
        ProgressData.find({ username: req.user.username, uniqueId: req.user._id}, (err, data) => {
            if (err) console.log(err);
            else if (data) {
                console.log(data ,"443");
                let scoreData = data;
                res.render("quizlevels", { cateId: req.body.myCategory, userData: req.user, pageTitle, scoreData});
            } else if (!data) {
                console.log(data ,"447");
                let scoreData = "";
                res.render("quizlevels", { cateId: req.body.myCategory, userData: req.user, pageTitle, scoreData });
            }
        });
    }
    else {
        res.redirect("/login");
    }
});

app.use(express.json({
    type: ['application/json', 'text/plain']
}));

app.post("/saveprogress", (req, res) => {
    console.log(req.body, "req.body.a , b");
    let progressData = new ProgressData(req.body);

    ProgressData.findOneAndUpdate({ username: req.body.username, uniqueId: req.body.uniqueId, levelId: req.body.levelId, cateId: req.body.cateId }, req.body, (err, docs) => {
        if (!err) {
            // console.log(docs);
            // console.log("done update");
            if (!docs) {
                progressData.save();
            }
            res.send({
                "saved": true
            });
        } else {
            console.log(err);
            res.send("Server Error!!!")
        }
    });

});

app.post("/quiz", (req, res) => {
    let pageTitle = "Quiz";

    if (req.isAuthenticated()) {
        res.render("quiz", { cateId: req.body.myCategory, levelId: req.body.myLevel, userData: req.user, pageTitle });
    }
    else {
        res.redirect("/login");
    }
})

app.get("/getQuizData", (req, res) => {
    QuizData.find({}, (err, quizData) => {
        if (err)
            console.log(err);
        else {
            console.log(quizData);
            res.send(quizData);
        }
    });
})

// Feedback

const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    review: String,
    overall: Number,
    quality: Number,
    recommend: Number,
    appealing: Number,
});

const feedback = mongoose.model("feedback", feedbackSchema);

app.post("/feedback", (req, res) => {

    let myFeedback = new feedback(req.body);
    myFeedback.save();

    res.writeHead(200, { 'Content-Type': 'text/html' });
    let myResponse = `<img src='https://www.clipartkey.com/mpngs/m/14-142559_computer-science-thank-you-for-your-feedback-png.png' style='margin:60px 42%; width:200px;'><p style='text-align:center;font-size:1.8rem;margin-top:20px;'>Thanks for your feedback!<br>This means a lot to us.<br></p><a href='/'style='text-align:center;margin-left:42.5%;'><button style='font-size:1.3rem;padding:9px;border-radius:10px;border:2px solid #30475e;background-color:#d6e0f0;color:#30475e;cursor:pointer;'>Back to Jssconnect</button></a>`
    res.write(myResponse);
    res.send();
});

app.listen(port, () => {
    console.log(`Server running at  http://${hostname}:${port}/`);
});
