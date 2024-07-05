// app/page.js

'use client';
import React, { useEffect, useState } from 'react';

export default function HomePage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState({ partnerName: '', contractCode: '', productCode: '' });
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/getData?action=getInitialData');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                console.log('Data fetched from API:', result);
                setData(result);
                setFilteredData(result); // Initialize filteredData with all data initially
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const fetchFilteredData = async () => {
        try {
            const { partnerName, contractCode, productCode } = searchTerm;
            let queryParams = `?partnerName=${encodeURIComponent(partnerName)}&contractCode=${encodeURIComponent(contractCode)}&productCode=${encodeURIComponent(productCode)}`;
            const response = await fetch(`/api/getData?action=getFilteredData${queryParams}`);
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

    const handleSearchSubmit = async event => {
        event.preventDefault();
        setLoading(true);
        await fetchFilteredData();
        setLoading(false);
    };

    const handleInputChange = event => {
        const { name, value } = event.target;
        setSearchTerm(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Debugging: Log data to verify state
    console.log('Data:', data);
    console.log('Filtered Data:', filteredData);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Data from Database</h1>
            <form onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    name="partnerName"
                    value={searchTerm.partnerName}
                    onChange={handleInputChange}
                    placeholder="Search by Partner Name"
                    className="input"
                />
                <input
                    type="text"
                    name="contractCode"
                    value={searchTerm.contractCode}
                    onChange={handleInputChange}
                    placeholder="Search by Contract Code"
                    className="input"
                />
                <input
                    type="text"
                    name="productCode"
                    value={searchTerm.productCode}
                    onChange={handleInputChange}
                    placeholder="Search by Product Code"
                    className="input"
                />
                <button type="submit">Search</button>
            </form>
            <table>
                <thead>
                <tr>
                    <th>PartnerCode</th>
                    <th>PartnerName</th>
                    <th>ContractCode</th>
                    <th>ContractDescription</th>
                    <th>ContractStart</th>
                    <th>ContractEnd</th>
                    <th>FinalPriceExcludingVAT</th>
                    <th>ProductCode</th>
                    <th>ProductName</th>
                    <th>Time</th>
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
    );
}
