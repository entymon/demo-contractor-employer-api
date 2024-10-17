const clientOnly = async (req, res, next) => {
    if (req.profile.type === 'client') {
        next()
    } else {
        return res.status(401).end()
    }
}
module.exports = {clientOnly}
