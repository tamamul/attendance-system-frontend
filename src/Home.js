import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Home component that redirects users based on their role after login.
const Home = ({ user }) => {
    const navigate = useNavigate(); // Hook to navigate programmatically

    useEffect(() => {
        // Check if a user is logged in
        if (user) {
            // If the user is a teacher, redirect to the teacher dashboard
            if (user.role === 'teacher') {
                navigate('/teacher-dashboard');
            }
            // If the user is a student, redirect to the student dashboard
            else if (user.role === 'student') {
                navigate('/student-dashboard');
            }
        }
        // If no user is logged in, the component simply displays a welcome message
        // and the navigation bar will show login/register links.
    }, [user, navigate]); // Rerun this effect whenever 'user' or 'navigate' changes

    return (
        <div>
            <h1>Welcome to the Attendance System!</h1>
            {!user && <p>Please login or register to continue.</p>}
            {user && <p>You are logged in as {user.name} ({user.role}).</p>}
        </div>
    );
};

export default Home;