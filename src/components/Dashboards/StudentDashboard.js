import React, { useState, useEffect } from 'react';
import axios from 'axios';

// StudentDashboard component to display student's own attendance
const StudentDashboard = ({ user }) => {
    // State to store the student's attendance history
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    // State to hold error messages
    const [error, setError] = useState('');
    // State to indicate if data is being loaded
    const [loading, setLoading] = useState(true);

    // Helper function to get the XSRF-TOKEN from cookies.
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

    // Effect hook to fetch student's attendance history on component mount
    useEffect(() => {
        const fetchMyAttendance = async () => {
            setError('');
            try {
                // Make an API call to get the authenticated student's attendance.
                // The backend automatically knows which user is logged in via the session/Sanctum token.
                const response = await axios.get('/api/my-attendance', {
                    headers: { 'X-XSRF-TOKEN': getXsrfToken() },
                    withCredentials: true,
                });
                setAttendanceHistory(response.data); // Set the fetched attendance data
            } catch (err) {
                console.error('Error fetching attendance:', err);
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Failed to fetch attendance history.');
                }
            } finally {
                setLoading(false); // Loading is complete
            }
        };

        fetchMyAttendance(); // Call the fetch function
    }, []); // Empty dependency array means this effect runs once after the initial render

    if (loading) {
        return <div>Loading attendance...</div>;
    }

    return (
        <div className="dashboard-container">
            <h2>Student Dashboard</h2>
            {user && <p>Welcome, {user.name}!</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h3>My Attendance History</h3>
            {attendanceHistory.length > 0 ? (
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceHistory.map(record => (
                            <tr key={record.id}>
                                <td>{record.date}</td>
                                <td>{record.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No attendance records found yet.</p>
            )}
        </div>
    );
};

export default StudentDashboard;