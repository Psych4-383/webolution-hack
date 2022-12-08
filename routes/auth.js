const router = require('express').Router()
const User = require('../schemas/userSchema.js')
const { uuid } = require('uuidv4'),
    passport = require('passport'),
    bcrypt = require('bcrypt')

router.post('/register', (req, res) => {
    let errors = [];
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password) {
        errors.push({ msg: "All fields are required" })
    };
    if (password != confirmPassword) {
        errors.push({ msg: "Passwords do not match" });
    }
    if (errors.length > 0) {
        res.send(errors);
    } else {
        User.findOne({ email: email }).then((user) => {
            if (user) {
                errors.push({ msg: "User already exists, try logging in instead." })
                return res.send(errors)
            }
            const userId = uuid();
            const newUser = new User({
                name: name,
                email: email,
                password: password,
                userId: userId,
            });
            bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then((user) => {
                        passport.authenticate('local', (err, user, info) => {
                            if (err) throw err;
                            if (!user) res.send({ "msg": `${info.message}` });
                            else {
                                req.logIn(user, (err) => {
                                    if (err) throw err;
                                    res.redirect('/')
                                });
                            }
                        })(req, res);

                    }).catch((err) => console.log(err));
                })
            );
        });
    }
})

router.get('/login', (req, res) => {
    res.render('login', { title: "Login" })
})

router.post('/login', async (req, res, next) => {
    passport.authenticate('local', { session: true }, (err, user, info) => {
        if (err) throw err;
        if (!user) {
            console.log(info.message)
            res.send({ "msg": `${info.message}` })
        } else {
            req.logIn(user, (err) => {
                if (err) throw err;
                res.redirect('/dashboard/home');
            });
        }
    })(req, res, next);
})

router.get('/user', (req, res) => {
    res.send(req.user)
})

router.get('/logout', function (req, res, next) {
    req.logout(function (err) {  // do this
        if (err) { return next(err); }// do this
        res.redirect('/auth/login');
    });
});

module.exports = router;