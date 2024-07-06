'use client';
import React, {useEffect, useState} from 'react';
import classes from './page.module.css'; // Assicurati che questo import sia corretto

const HomePage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState({partnerName: '', contractCode: '', productCode: ''});
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        fetchData('/api/getData?action=getInitialData');
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/logout', {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                console.log('Logout effettuato con successo');
                window.location.replace('/');
            } else {
                console.error('Errore durante il logout');
            }
        } catch (error) {
            console.error('Errore durante il logout:', error);
        }
    };

    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            setData(result);
            setFilteredData(result); // Inizialmente mostriamo tutti i dati filtrati
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchFilteredData = async () => {
        try {
            const {partnerName, contractCode, productCode} = searchTerm;

            const params = new URLSearchParams({
                partnerName: partnerName ? encodeURIComponent(partnerName) : '',
                contractCode: contractCode ? encodeURIComponent(contractCode) : '',
                productCode: productCode ? encodeURIComponent(productCode) : '',
            });

            const response = await fetch(`/api/getData?action=getFilteredData&${params}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Filtered Data fetched from API:', result);
            setFilteredData(result);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setError(error.message);
        }
    };

    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        console.log('Submitting search with terms:', searchTerm);
        await fetchFilteredData();
        setLoading(false);
    };

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setSearchTerm((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <div>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <div>
                <h1 className={classes.header}>Data from Database</h1>
                <form className={classes.form} onSubmit={handleSearchSubmit}>
                    <div className={classes.field}>
                        <input
                            type="text"
                            name="partnerName"
                            value={searchTerm.partnerName}
                            onChange={handleInputChange}
                            placeholder="Partner Name"
                            className={classes.input}
                        />
                        <div className={classes.line}></div>
                    </div>
                    <div className={classes.field}>
                        <input
                            type="text"
                            name="contractCode"
                            value={searchTerm.contractCode}
                            onChange={handleInputChange}
                            placeholder="Contract Code"
                            className={classes.input}
                        />
                        <div className={classes.line}></div>
                    </div>
                    <div className={classes.field}>
                        <input
                            type="text"
                            name="productCode"
                            value={searchTerm.productCode}
                            onChange={handleInputChange}
                            placeholder="Product Code"
                            className={classes.input}
                        />
                        <div className={classes.line}></div>
                    </div>

                    <button className={classes.button} type="submit">Search</button>
                </form>
                <div className={classes.container}>
                    <div className={classes.row}>
                        <div className="col-xs-12">
                            <div className={classes.tableContainer}>
                                <table className={classes.dataTable}>
                                    <thead>
                                    <tr>
                                        <th className={classes.th}>PartnerCode</th>
                                        <th className={classes.th}>PartnerName</th>
                                        <th className={classes.th}>ContractCode</th>
                                        <th className={classes.th}>ContractDescription</th>
                                        <th className={classes.th}>ContractStart</th>
                                        <th className={classes.th}>ContractEnd</th>
                                        <th className={classes.th}>FinalPriceExcludingVAT</th>
                                        <th className={classes.th}>ProductCode</th>
                                        <th className={classes.th}>ProductName</th>
                                        <th className={classes.th}>Time</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.PartnerCode}</td>
                                            <td>{item.PartnerName}</td>
                                            <td>{item.ContractCode}</td>
                                            <td>{item.ContractDescription}</td>
                                            <td>{item.ContractStart}</td>
                                            <td>{item.ContractEnd}</td>
                                            <td>{item.FinalPriceExcludingVAT}</td>
                                            <td>{item.ProductCode}</td>
                                            <td>{item.ProductName}</td>
                                            <td>{item.Time}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default HomePage;
