import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Register component for new user registration
const Register = () => {
    // State for name, email, password, confirm password, and role input fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('student'); // Default role to 'student'
    // State for handling error messages
    const [error, setError] = useState('');
    // State for handling success messages
    const [success, setSuccess] = useState('');
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

        setError('');    // Clear any previous errors
        setSuccess('');  // Clear any previous success messages

        try {
            // First, get the CSRF cookie from Laravel.
            await axios.get('/sanctum/csrf-cookie');

            // Send registration request to the Laravel backend.
            const response = await axios.post('/api/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation, // Laravel expects 'password_confirmation'
                role,
            }, {
                headers: {
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                withCredentials: true,
            });

            setSuccess('Registration successful! You can now log in.'); // Set success message
            // Optionally, navigate to login page after successful registration
            navigate('/login');

        } catch (err) {
            // Handle errors during registration.
            console.error('Registration error:', err);
            if (err.response && err.response.data && err.response.data.errors) {
                // Laravel validation errors are typically nested under 'errors'
                const errors = err.response.data.errors;
                let errorMessages = [];
                for (const key in errors) {
                    errorMessages = [...errorMessages, ...errors[key]];
                }
                setError(errorMessages.join('\n')); // Join multiple error messages
            } else if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); // Display general error message from backend
            } else {
                setError('Registration failed. Please try again.'); // Generic error message
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            {error && <p style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</p>} {/* Display error message */}
            {success && <p style={{ color: 'green' }}>{success}</p>} {/* Display success message */}
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
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
            <div>
                <label>Confirm Password:</label>
                <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
            </div>
            <button type="submit">Register</button>
        </form>
    );
};

export default Register;