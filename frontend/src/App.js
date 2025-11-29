import React from 'react';

function App() {
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