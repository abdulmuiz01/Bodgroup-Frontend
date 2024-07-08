'use client';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import classes from './page.module.css'; // Assicurati che questo import sia corretto

const HomePage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState({partnerName: '', contractCode: '', productCode: ''});
    const [filteredData, setFilteredData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchData('/api/getData?action=getInitialData', 1);
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

    const fetchData = async (url, page) => {
        setLoading(true);
        try {
            const response = await fetch(`${url}&page=${page}&limit=10`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            setData((prevData) => page === 1 ? result : [...prevData, ...result]);
            setFilteredData((prevData) => page === 1 ? result : [...prevData, ...result]);
            setLoading(false);
            setHasMore(result.length > 0);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchFilteredData = async (page) => {
        setLoading(true);
        try {
            const {partnerName, contractCode, productCode} = searchTerm;

            const params = new URLSearchParams({
                partnerName: partnerName ? encodeURIComponent(partnerName) : '',
                contractCode: contractCode ? encodeURIComponent(contractCode) : '',
                productCode: productCode ? encodeURIComponent(productCode) : '',
                page: page,
                limit: 10
            });

            const response = await fetch(`/api/getData?action=getFilteredData&${params}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setFilteredData((prevData) => page === 1 ? result : [...prevData, ...result]);
            setHasMore(result.length > 0);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setPage(1);
        await fetchFilteredData(1);
        setLoading(false);
    };

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setSearchTerm((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const resetFilters = async () => {
        setSearchTerm({partnerName: '', contractCode: '', productCode: ''});
        setLoading(true);
        setPage(1);
        setData([]);
        setFilteredData([]);
        await fetchData('/api/getData?action=getInitialData', 1);
    };

    const observer = useRef();
    const lastDataElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        if (page > 1) {
            if (searchTerm.partnerName || searchTerm.contractCode || searchTerm.productCode) {
                fetchFilteredData(page);
            } else {
                fetchData('/api/getData?action=getInitialData', page);
            }
        }
    }, [page]);

    if (loading && page === 1) return <div className={classes.loadingContainer}><p
        className={classes.loading}>Loading...</p></div>
    if (error) return <div className={classes.loadingContainer}><p className={classes.error}>Error: {error}</p></div>

    return (
        <>
            <div className={classes.logoutContainer}>
                <button className={classes.logoutButton} onClick={handleLogout}>Logout</button>
            </div>

            <div>
                <h1 className={classes.heading}>Partner Contracts</h1>
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
                    <button type="button" className={classes.button} onClick={resetFilters}>Reset</button>
                </form>
                <div className={classes.container}>
                    <div>
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
                                    <tr key={index} ref={index === filteredData.length - 1 ? lastDataElementRef : null}>
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

                                {!loading && filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className={classes.loadingMessage}>No results found.</td>
                                    </tr>
                                )}

                                {loading && filteredData.length > 0 && (
                                    <tr>
                                        <td colSpan="10" className={classes.loadingMessage}>Loading more data...</td>
                                    </tr>
                                )}

                                {!loading && filteredData.length > 0 && !hasMore && (
                                    <tr>
                                        <td colSpan="10" className={classes.loadingMessage}>End of results.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomePage;