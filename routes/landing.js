const router = require('express').Router()

router.get('/', (req, res)=> {
    console.log(req.user)
    res.render('landing.ejs', {title: 'landing', user:req.user})
})

module.exports = router;