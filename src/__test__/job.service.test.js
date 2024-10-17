const { 
    getBestPaidProfession, 
    depositMoney,
    payForContractor,
} = require('../service/job.service');
const { 
    getTotalPaidPerContractorInDateRange, 
    getTotalPriceForUnpaidJobs,
    getJobByIdWithContract, 
} = require('../repository/job.repository');
const { 
    getContractorById,
} = require('../repository/profile.repository');

jest.mock('../repository/job.repository');
jest.mock('../repository/profile.repository');

describe('Job Service', () => {
    describe('getBestPaidProfession', () => {
        it('should return the profession with the highest total price', async () => {
            const mockData = [
                { 'Contract.Contractor.profession': 'Engineer', total_price: 5000 },
                { 'Contract.Contractor.profession': 'Designer', total_price: 7000 },
                { 'Contract.Contractor.profession': 'Manager', total_price: 3000 },
            ];

            getTotalPaidPerContractorInDateRange.mockResolvedValue(mockData);

            const result = await getBestPaidProfession('2022-01-01', '2022-12-31');
            expect(result).toBe('Designer');
        });

        it('should return null if no data is available', async () => {
            getTotalPaidPerContractorInDateRange.mockResolvedValue([]);

            const result = await getBestPaidProfession('2022-01-01', '2022-12-31');
            expect(result).toBeUndefined();
        });
    });

    describe('depositMoney', () => {
        let client;
    
        beforeEach(() => {
            client = {
                id: 1,
                balance: 100,
                save: jest.fn().mockResolvedValue(true)
            };
        });
    
        it('should deposit the full amount if it is less than or equal to 25% of the total unpaid jobs', async () => {
            getTotalPriceForUnpaidJobs.mockResolvedValue(1000);
            const result = await depositMoney(client, 200);
    
            expect(client.balance).toBe(300);
            expect(client.save).toHaveBeenCalled();
            expect(result).toBe(0);
        });
    
        it('should deposit only 25% of the total unpaid jobs if the deposit amount is greater', async () => {
            getTotalPriceForUnpaidJobs.mockResolvedValue(1000);
    
            const result = await depositMoney(client, 300);
    
            expect(client.balance).toBe(350);
            expect(client.save).toHaveBeenCalled();
            expect(result).toBe(50);
        });
    
        it('should handle non-integer deposit amounts correctly', async () => {
            getTotalPriceForUnpaidJobs.mockResolvedValue(1000);
    
            const result = await depositMoney(client, '200.50');
    
            expect(client.balance).toBe(300);
            expect(client.save).toHaveBeenCalled();
            expect(result).toBe(0);
        });
    
        it('should handle edge case where deposit amount is exactly 25% of the total unpaid jobs', async () => {
            getTotalPriceForUnpaidJobs.mockResolvedValue(1000);
    
            const result = await depositMoney(client, 250);
    
            expect(client.balance).toBe(350);
            expect(client.save).toHaveBeenCalled();
            expect(result).toBe(0);
        });
    });

    describe('payForContractor', () => {
        let client;
    
        beforeEach(() => {
            client = {
                id: 1,
                balance: 1000,
                save: jest.fn().mockResolvedValue(true)
            };
        });
    
        it('should return an error if the job does not exist', async () => {
            getJobByIdWithContract.mockResolvedValue(null);
    
            const result = await payForContractor(client, 1);
    
            expect(result).toEqual({
                code: 1001,
                message: 'There is no contract for given job ID'
            });
        });
    
        it('should return an error if the client balance is insufficient', async () => {
            const job = {
                id: 1,
                price: 1500,
                Contract: {
                    ContractorId: 2
                }
            };
            getJobByIdWithContract.mockResolvedValue(job);
    
            const result = await payForContractor(client, 1);
    
            expect(result).toEqual({
                code: 1002,
                message: 'Balance is to low to pay for this job'
            });
        });
    
        it('should update the balance if the client balance is sufficient', async () => {
            const _updateBalance = jest.fn()
            const job = {
                id: 1,
                price: 500,
                Contract: {
                    ContractorId: 2
                }
            };
            const contractor = {
                id: 2,
                balance: 1000,
                save: jest.fn().mockResolvedValue(true)
            };
            getJobByIdWithContract.mockResolvedValue(job);
            getContractorById.mockResolvedValue(contractor);
            _updateBalance.mockImplementation((client, contractor, amount) => {
                client.balance -= amount;
                contractor.balance += amount;
            });
    
            const result = await payForContractor(client, 1);
    
            expect(client.balance).toBe(500); // 1000 - 500
            expect(contractor.balance).toBe(1500); // 1000 + 500
            expect(client.save).toHaveBeenCalled();
            expect(contractor.save).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });
});