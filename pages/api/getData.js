// pages/api/getData.js

import { poolPromise } from '../../lib/db';

export default async function handler(req, res) {
    const { method, query } = req;

    switch (method) {
        case 'GET':
            // GET /api/getData?action=getInitialData
            if (query.action === 'getInitialData') {
                return getInitialData(req, res);
            }

            // GET /api/getData?action=getFilteredData&partnerName=<partnerName>&contractCode=<contractCode>&productCode=<productCode>
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
        const result = await pool.request().query('SELECT TOP 20 * FROM dbo.PartnerContracts');
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
        let query = 'SELECT * FROM dbo.PartnerContracts WHERE 1=1';

        if (partnerName) {
            query += ` AND PartnerName LIKE '%${partnerName}%'`;
        }
        if (contractCode) {
            query += ` AND ContractCode LIKE '%${contractCode}%'`;
        }
        if (productCode) {
            query += ` AND ProductCode LIKE '%${productCode}%'`;
        }

        const result = await pool.request().query(query);
        console.log('Query executed successfully', result);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: error.message });
    }
}
