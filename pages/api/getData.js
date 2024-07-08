// pages/api/getData.js
import {sql, poolPromise} from '../../lib/db';

export default async function handler(req, res) {
    const {method, query} = req;

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
    const {page = 1, limit = 11} = req.query;

    try {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;

        const result = await pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .input('offset', sql.Int, offset)
            .query('SELECT * FROM dbo.PartnerContracts ORDER BY ContractStart OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({error: error.message});
    }
}

async function getFilteredData(req, res) {
    const {partnerName, contractCode, productCode, page = 1, limit = 11} = req.query;
    const offset = (page - 1) * limit;

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('partnerName', sql.NVarChar, partnerName ? `%${decodeURIComponent(partnerName)}%` : null)
            .input('contractCode', sql.NVarChar, contractCode ? `%${decodeURIComponent(contractCode)}%` : null)
            .input('productCode', sql.NVarChar, productCode ? `%${decodeURIComponent(productCode)}%` : null)
            .input('limit', sql.Int, parseInt(limit))
            .input('offset', sql.Int, offset)
            .query(`
                SELECT *
                FROM dbo.PartnerContracts
                WHERE (@partnerName IS NULL OR PartnerName LIKE @partnerName)
                  AND (@contractCode IS NULL OR ContractCode LIKE @contractCode)
                  AND (@productCode IS NULL OR ProductCode LIKE @productCode)
                ORDER BY ContractStart
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({error: error.message});
    }
}
