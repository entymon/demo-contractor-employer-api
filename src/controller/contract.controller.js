const { Op } = require('sequelize');

const getContractById = async (req, res, next) => {
    const {Contract} = req.app.get('models')
    const {id} = req.params

    try {
        const contract = await Contract.findOne({where: {
            id,
            [Op.or]: [{ ContractorId: req.profile.id }, { ClientId: req.profile.id }],
        }})
        if(!contract) return res.status(404).end() 
        res.json(contract)
    } catch (error) {
        console.error('Error during fetching contract by ID', error)
        next(error)
    }
}

const getContracts = async (req, res, next) =>{
    const {Contract} = req.app.get('models')

    try {
        const contracts = await Contract.findAll({where: {
            [Op.or]: [{ ContractorId: req.profile.id }, { ClientId: req.profile.id }],
            status: {
                [Op.ne]: 'terminated'
            }
        }})
        res.json(contracts)
    } catch (error) {
        console.error('Error during fetching all contracts', error)
        next(error)
    }
}

module.exports = { 
    getContracts,
    getContractById
}