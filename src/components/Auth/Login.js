import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Login component for user authentication
const Login = ({ setUser }) => {
    // State for email and password input fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // State for handling error messages
    const [error, setError] = useState('');
    // Hook to navigate programmatically
    const navigate = useNavigate();

    // Helper function to get the XSRF-TOKEN from cookies.
    // Laravel Sanctum uses this for CSRF protection.
    const getXsrfToken = () => {
        const name = 'XSRF-TOKEN=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        setError(''); // Clear any previous errors

        try {
            // First, get the CSRF cookie from Laravel. This is a crucial step for Sanctum.
            await axios.get('/sanctum/csrf-cookie');

            // Send login request to the Laravel backend.
            const response = await axios.post('/api/login', { email, password }, {
                headers: {
                    // Include the X-XSRF-TOKEN in the request headers.
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                withCredentials: true, // This ensures cookies (like the session and Sanctum token) are sent
            });

            // If login is successful, the user data will be returned.
            // Update the user state in the App component.
            setUser(response.data.user);

            // Redirect based on user role.
            if (response.data.user.role === 'teacher') {
                navigate('/teacher-dashboard');
            } else if (response.data.user.role === 'student') {
                navigate('/student-dashboard');
            }
        } catch (err) {
            // Handle errors during login.
            console.error('Login error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); // Display error message from backend
            } else {
                setError('Login failed. Please check your credentials.'); // Generic error message
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;