import React, { useState, useEffect } from 'react';

function App() {
  const [apiData, setApiData] = useState({
    donors: [],
    requests: [],
    offers: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';
        
        // Load donors
        const donorsResponse = await fetch(`${backendUrl}/donors`);
        const donorsData = donorsResponse.ok ? await donorsResponse.json() : [];
        
        // Load requests
        const requestsResponse = await fetch(`${backendUrl}/requests`);
        const requestsData = requestsResponse.ok ? await requestsResponse.json() : [];
        
        // Load offers
        const offersResponse = await fetch(`${backendUrl}/offers`);
        const offersData = offersResponse.ok ? await offersResponse.json() : [];
        
        setApiData({
          donors: donorsData,
          requests: requestsData,
          offers: offersData,
          loading: false,
          error: null
        });
        
        console.log('API Data loaded:', { donors: donorsData.length, requests: requestsData.length, offers: offersData.length });
      } catch (error) {
        console.error('Error loading backend data:', error);
        setApiData(prev => ({ ...prev, loading: false, error: error.message }));
      }
    };

    loadBackendData();
  }, []);
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#0d9488' }}>Student Support Platform</h1>
      <p>Global community-driven platform for FREE meals and food assistance</p>
      <div style={{ marginTop: '20px' }}>
        <button 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#0d9488', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            marginRight: '10px'
          }}
          data-testid="student-login-btn"
          aria-label="Student Login - Access free meals"
          onClick={() => alert('Student login functionality would be implemented here')}
        >
          I'm a Student
        </button>
        <button 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#059669', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px'
          }}
          data-testid="donor-login-btn"
          aria-label="Donor Login - Help students"
          onClick={() => alert('Donor login functionality would be implemented here')}
        >
          I Want to Donate
        </button>
      </div>
      <div style={{ marginTop: '30px' }}>
        <h2>Features:</h2>
        <ul>
          <li>Student registration with .edu email verification</li>
          <li>Dietary preferences (Vegan, Halal, Kosher, etc.)</li>
          <li>Meal requests and offers</li>
          <li>Anonymous options available</li>
          <li>Donor transparency</li>
          <li>Admin moderation</li>
        </ul>
      </div>
    </div>
  );
}

export default App;