import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import TeacherDashboard from './components/Dashboards/TeacherDashboard';
import StudentDashboard from './components/Dashboards/StudentDashboard';
import Home from './Home';
// If you had an App.css import, remove it here:
// import './App.css'; // <--- REMOVE THIS LINE IF IT EXISTS

// Main App component
function App() {
    // State to store the authenticated user's data
    const [user, setUser] = useState(null);
    // State to indicate if user data is currently being loaded
    const [loading, setLoading] = useState(true);

    // Effect hook to check user authentication status on component mount
    useEffect(() => {
        // Function to fetch the authenticated user's data
        const fetchUser = async () => {
            try {
                // Attempt to get user data from the backend using Sanctum's /api/user endpoint
                const response = await axios.get('/api/user', {
                    headers: {
                        // Include CSRF token for security. Laravel Sanctum requires it.
                        'X-XSRF-TOKEN': getXsrfToken(),
                    },
                    withCredentials: true // Important for sending cookies (including session/Sanctum tokens)
                });
                // If successful, set the user state
                setUser(response.data);
            } catch (error) {
                // If there's an error (e.g., 401 Unauthorized), the user is not logged in.
                console.error('Failed to fetch user:', error);
                setUser(null); // Clear user state
            } finally {
                setLoading(false); // Loading is complete
            }
        };

        fetchUser(); // Call the fetchUser function
    }, []); // Empty dependency array means this effect runs once after the initial render

    // Helper function to get the XSRF-TOKEN from cookies
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

    // Handle user logout
    const handleLogout = async () => {
        try {
            await axios.post('/api/logout', {}, {
                headers: {
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                withCredentials: true
            });
            setUser(null); // Clear user state on successful logout
            // Optionally, redirect to login page after logout
            window.location.href = '/login'; // Simple redirect
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Show a loading message while user data is being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            {/* Removed inline styles and applied 'nav' class */}
            <nav>
                <div>
                    {/* Removed inline styles from Links */}
                    <Link to="/">Home</Link>
                    {!user && <Link to="/login">Login</Link>}
                    {!user && <Link to="/register">Register</Link>}
                </div>
                {user && (
                    <div>
                        {/* Removed inline styles from span */}
                        <span>Welcome, {user.name} ({user.role})</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </nav>

            {/* Removed inline styles and applied 'main-content-area' class */}
            <div className="main-content-area">
                <Routes>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/register" element={<Register />} />
                    {/* Conditional rendering based on user role */}
                    {user && user.role === 'teacher' && (
                        <Route path="/teacher-dashboard" element={<TeacherDashboard user={user} />} />
                    )}
                    {user && user.role === 'student' && (
                        <Route path="/student-dashboard" element={<StudentDashboard user={user} />} />
                    )}
                    {/* Redirect authenticated users to their respective dashboards if they try to access login/register */}
                    {user && (
                        <Route path="/login" element={user.role === 'teacher' ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />} />
                    )}
                    {user && (
                        <Route path="/register" element={user.role === 'teacher' ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />} />
                    )}
                </Routes>
            </div>
        </Router>
    );
}

export default App;