require("dotenv").config()
const express = require('express')
const app = express()
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passportInit = require('./middleware/passport.js')
const ejs = require('ejs');
passportInit(passport)

app.use(express.static('public'))
app.use(bodyparser.urlencoded({ extended: false }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs')
app.set('views', 'views')

// import routes
const landing = require('./routes/landing.js')
const auth = require('./routes/auth.js')
const dashboard = require('./routes/dashboard.js')

// add routes
app.use('/', landing)
app.use('/auth', auth)
app.use('/dashboard', dashboard)

const dbUri = process.env.MONGO_URI
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(console.log("Connected to mongodb"))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Connected on port ${PORT}`))