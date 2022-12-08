const router = require('express').Router();

router.get('/home', (req, res)=> {
    console.log(req.user)
    res.render('dashboard/home', {title: 'Dashboard | Home', user:req.user})
})

module.exports = router