const { 
    getBestPaidProfession, 
    getTopPayingClients 
} = require('../service/job.service')

const bestProffesion = async (req, res, next) => {
    const { start, end } = req.query

    try {
        const profession = await getBestPaidProfession(start, end)
        res.json(profession);
    } catch (error) {
        console.error('Error fetching total price grouped by ContractId:', error);
        next(error)
    }
};

const topPayingClients = async (req, res, next) => {
    const { start, end, limit = 2 } = req.query;

    try {
        const topClients = await getTopPayingClients(start, end, limit)
        res.json(topClients);
    } catch (error) {
        console.error('Error fetching top paying clients:', error);
        next(error)
    }
};

module.exports = {
    bestProffesion,
    topPayingClients
}
