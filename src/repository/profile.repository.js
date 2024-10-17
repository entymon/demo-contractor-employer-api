const { Op } = require('sequelize');
const { Profile } = require('../model');

const getContractorById = async (id) => {
    return Profile.findOne({
        where: {
            id,
            type: {
                [Op.eq]: 'contractor'
            }
        }
    })
}

module.exports = {
    getContractorById
}