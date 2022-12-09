function ensureAuth (req, res, next) {
    if(req.user){
        next()
    } else {
        res.redirect('/auth/login')
    }
}

module.exports = {ensureAuth}