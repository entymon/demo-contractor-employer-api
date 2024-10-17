const adminOnly = async (req, res, next) => {
    console.log(req.profile)
    if (req.profile.role === 'admin') {
        next()
    } else {
        return res.status(401).end()
    }
}
module.exports = {adminOnly}