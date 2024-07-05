import sql from 'mssql';

const config = {
    user: process.env.DB_USER, // Windows username
    password: process.env.DB_PASSWORD, // Windows password (se necessario)
    server: process.env.DB_SERVER, // Connettersi a localhost
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};



const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config:', err);
        throw err;
    });

export { sql, poolPromise };