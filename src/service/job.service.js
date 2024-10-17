const { 
    getJobByIdWithContract, 
    getUnpaidJobsWithinActiveContract,
    getTotalPriceForUnpaidJobs,
    getTotalPaidPerContractorInDateRange,
    getClientsPaidMostForJobsInDateRange
} = require('../repository/job.repository')
const { getContractorById } = require('../repository/profile.repository')

/**
 * 
 * @param {Profile} clientId 
 * @returns 
 */
const getUnpaidJobs = async (clientId) => {
    return getUnpaidJobsWithinActiveContract(clientId)
}

/**
 * 
 * @param {String} startDate 
 * @param {String} endDate 
 * @param {Number} limit 
 * @returns 
 */
const getTopPayingClients = async (startDate, endDate, limit) => {
    return getClientsPaidMostForJobsInDateRange(startDate, endDate, limit)
}

/**
 * 
 * @param {Profile} client 
 * @param {Number} jobId 
 * @returns 
 */
const payForContractor = async (client, jobId) => {
    const job = await getJobByIdWithContract(client.id, jobId)
    if (!job) {
        return {
            code: 1001,
            message: 'There is no contract for given job ID'
        }
    }

    if (client.balance >= job.price) {
        const contractor = await getContractorById(job.Contract.ContractorId)
        _updateBalance(client, contractor, job.price)
    } else {
        return {
            code: 1002,
            message: 'Balance is to low to pay for this job'
        }
    }

    return null
}

/**
 * 
 * @param {String} startDate 
 * @param {String} endDate 
 * @returns 
 */
const getBestPaidProfession = async (startDate, endDate) => {
    const totalPrices = await getTotalPaidPerContractorInDateRange(startDate, endDate);

    const maxTotalPrice = totalPrices.reduce((max, item) => {
        return item.total_price > max.total_price ? item : max;
    }, { total_price: 0 });

    return maxTotalPrice['Contract.Contractor.profession'];
}

/**
 * 
 * @param {Profile} client 
 * @param {Number} money 
 * @returns 
 */
const depositMoney = async (client, money) => {
    const total = await getTotalPriceForUnpaidJobs(client.id)
    const quartOfTotal = Math.round(0.25 * total)
    const depositOfMoney = parseInt(money)

    if (quartOfTotal < depositOfMoney) {
        client.balance = client.balance + quartOfTotal
        await client.save()
        return depositOfMoney - quartOfTotal // rest which cannot be deposit
    } else {
        client.balance = client.balance + depositOfMoney
        await client.save()
        return 0
    }
}

/**
 * 
 * @param {Profile} client 
 * @param {Profile} contractor 
 * @param {Number} price 
 */
const _updateBalance = async (client, contractor, price) => {
    const { balanceBackup } = { ...client }
    client.balance = parseFloat(client.balance) - parseFloat(price)
    await client.save()

    try {
        contractor.balance = parseFloat(contractor.balance) + parseFloat(price)
        await contractor.save()
    } catch (error) {
        console.error('Error during update contractor balance. Rollback client')
        client.balance = balanceBackup
        await client.save()

        throw error
    }
}

module.exports = {
    getUnpaidJobs,
    payForContractor,
    depositMoney,
    getBestPaidProfession,
    getTopPayingClients
}