import { sql, poolPromise } from '../../lib/db';

export default async function handler(req, res) {
    const { method, query } = req;

    switch (method) {
        case 'GET':
            if (query.action === 'getInitialData') {
                return getInitialData(req, res);
            }

            if (query.action === 'getFilteredData') {
                return getFilteredData(req, res);
            }

            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

async function getInitialData(req, res) {
    try {
        const pool = await poolPromise;
        console.log('Connected to the database');
        const result = await pool.request().query('SELECT TOP 10 * FROM dbo.PartnerContracts');
        console.log('Query executed successfully', result);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getFilteredData(req, res) {
    const { partnerName, contractCode, productCode } = req.query;

    try {
        const pool = await poolPromise;
        console.log('Connected to the database');

        const result = await pool.request()
            .input('partnerName', sql.NVarChar, partnerName ? `%${decodeURIComponent(partnerName)}%` : null)
            .input('contractCode', sql.NVarChar, contractCode ? `%${decodeURIComponent(contractCode)}%` : null)
            .input('productCode', sql.NVarChar, productCode ? `%${decodeURIComponent(productCode)}%` : null)
            .query(`
                SELECT * FROM dbo.PartnerContracts
                WHERE
                    (@partnerName IS NULL OR PartnerName LIKE @partnerName) AND
                    (@contractCode IS NULL OR ContractCode LIKE @contractCode) AND
                    (@productCode IS NULL OR ProductCode LIKE @productCode)
            `);

        console.log('Query executed successfully', result);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: error.message });
    }
}




