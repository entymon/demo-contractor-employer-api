const { 
    getUnpaidJobs, 
    payForContractor, 
    depositMoney,
} = require('../service/job.service')

const getUnpaid = async (req, res, next) => {
    try {
        const jobs = await getUnpaidJobs(req.profile.id)
        res.json(jobs)
    } catch (error) {
        console.error('Error fetching total price grouped by ContractId:', error);
        next(error)
    }
}

const payForJob = async (req, res, next) => {
    const { job_id } = req.params
    const client = req.profile
    
    try {
        const validation = await payForContractor(client, job_id)
        if (validation) {
            res.status(400).json(validation)
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error during paying for contract')
        next(error)
    }
}

const deposit = async (req, res, next) => {
    const client = req.profile
    const { money } = req.body

    if (!money || isNaN(money)) res.status(400).json({ 
        message: 'check the body request `money` is requeired and it has to be number'
    })

    try {
        const data = await depositMoney(client, money)
        let message = 'All requested money was deposited'
        if (data) {
            message = `This cannot be deposit ${data}`
        }
        res.json({ message })
    } catch (error) {
        console.error('Error fetching total price grouped by ContractId:', error);
        next(error)
    }
}



module.exports = { 
    getUnpaid,
    payForJob,
    deposit
}