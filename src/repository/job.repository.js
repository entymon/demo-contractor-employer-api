const { Op, Sequelize } = require('sequelize');
const { Job, Contract, Profile } = require('../model');

const getJobByIdWithContract = async (clientId, jobId) => {
    return Job.findOne(
        {
            attributes: ['price'],
            where: {
                id: jobId,
                [Op.or]: [
                    { 
                        paid: {
                            [Op.eq]: false
                        }
                    },
                    { 
                        paid: {
                            [Op.eq]: null
                        }
                    }
                ]
            },
            include:
            [
                {
                    model: Contract,
                    where: {
                        ClientId: clientId,
                        status: {
                            [Op.eq]: 'in_progress'
                        }
                    }
                }
            ]
        }
    )
}

const getUnpaidJobsWithinActiveContract = async (profileId) => {
    return Contract.findAll(
        {
            attributes: [
                'id',
            ],
            where: {
                [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
                status: {
                    [Op.eq]: 'in_progress'
                }
            },
            include:
            [
                {
                    model: Job,
                    where: {
                        [Op.or]: [
                            { 
                                paid: {
                                    [Op.eq]: false
                                }
                            },
                            { 
                                paid: {
                                    [Op.eq]: null
                                }
                            }
                        ]
                    }
                }
            ]
        }
    )
}

const getTotalPriceForUnpaidJobs = async (profileId) => {
    const records = await Job.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('price')), 'totalPrice'],
        ],
        raw: true,
        where: {
            [Op.or]: [
                { 
                    paid: {
                        [Op.eq]: false
                    }
                },
                { 
                    paid: {
                        [Op.eq]: null
                    }
                }
            ]
        },
        include: [
            {
                model: Contract,
                attributes: [],
                where: {
                    ClientId: profileId,
                    status: {
                        [Op.eq]: 'in_progress'
                    }
                }
            },
        ]
    })
    return records[0].totalPrice
}

const getTotalPaidPerContractorInDateRange = async (startDate, endDate) => {
    let dateRangeCondition = {};

    if (startDate && endDate) {
        dateRangeCondition = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    if (!startDate) {
        dateRangeCondition = {
            [Op.lte]: new Date(endDate)
        };
    }

    if (!endDate) {
        dateRangeCondition = {
            [Op.gte]: new Date(startDate)
        };
    }

    return Job.findAll({
        attributes: [
            'ContractId',
            [Sequelize.fn('SUM', Sequelize.col('price')), 'total_price']
        ],
        include: [
            {
                model: Contract,
                required: false,
                include: [
                    {
                        model: Profile,
                        as: 'Contractor',
                        required: false,
                        attributes: ['profession'],
                        where: {
                            type: 'contractor'
                        }
                    }
                ]
            }
        ],
        where: {
            paymentDate: dateRangeCondition
        },
        group: ['ContractId', 'Contract.id', 'Contract.Contractor.id'],
        raw: true,
        subQuery: false
    });
}

const getClientsPaidMostForJobsInDateRange = async (startDate, endDate, limit = 2) => {
    let dateRangeCondition = {};
    
    if (startDate && endDate) {
        dateRangeCondition = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }
    
    if (!startDate) {
        dateRangeCondition = {
            [Op.lte]: new Date(endDate)
        };
    }
    
    if (!endDate) {
        dateRangeCondition = {
            [Op.gte]: new Date(startDate)
        };
    }

    const topClients = await Job.findAll({
        attributes: [
            [Sequelize.col('Contract.Client.id'), 'id'],
            [Sequelize.fn('CONCAT', Sequelize.col('Contract.Client.firstname'), ' ', Sequelize.col('Contract.Client.lastname')), 'fullName'],
            [Sequelize.fn('SUM', Sequelize.col('price')), 'paid']
        ],
        include: [
            {
                model: Contract,
                attributes: [],
                required: true,
                include: [
                    {
                        model: Profile,
                        as: 'Client',
                        required: true,
                        attributes: []
                    }
                ]
            }
        ],
        where: {
            paid: true,
            paymentDate: dateRangeCondition
        },
        group: ['Contract.Client.id'],
        order: [[Sequelize.fn('SUM', Sequelize.col('price')), 'DESC']],
        limit: parseInt(limit, 10),
        raw: true
    });

    return topClients
}

module.exports = {
    getJobByIdWithContract,
    getUnpaidJobsWithinActiveContract,
    getTotalPriceForUnpaidJobs,
    getTotalPaidPerContractorInDateRange,
    getClientsPaidMostForJobsInDateRange
}