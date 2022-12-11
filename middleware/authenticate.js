function ensureAuth (req, res, next) {
    if(req.user){
        next()
    } else {
        res.redirect('/auth/login')
    }
}
function ensureDoc (req, res, next) {
    if(req.user && req.user.doctor){
        next()
    } else {
        res.redirect('/auth/login')
    }
}

module.exports = {ensureAuth, ensureDoc}