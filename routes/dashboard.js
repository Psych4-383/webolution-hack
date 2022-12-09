const router = require('express').Router();
const {ensureAuth} = require('../middleware/authenticate.js')

router.get('/home', ensureAuth, (req, res)=> {
    console.log(req.user)
    res.render('dashboard/home', {title: 'Dashboard | Home', user:req.user})
})

router.get('/find-hospitals', (req, res)=> {
    res.render('dashboard/findhospitals', {title: 'Find Hospitals', user:req.user})
})

module.exports = router