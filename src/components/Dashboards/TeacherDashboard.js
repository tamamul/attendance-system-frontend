import React, { useState, useEffect } from 'react';
import axios from 'axios';

// TeacherDashboard component for managing student attendance
const TeacherDashboard = ({ user }) => {
    // State to store the list of students
    const [students, setStudents] = useState([]);
    // State to store attendance data for a specific date
    const [attendanceData, setAttendanceData] = useState({});
    // State to manage the date for which attendance is being viewed/marked
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
    // State to hold error messages
    const [error, setError] = useState('');
    // State to hold success messages
    const [success, setSuccess] = useState('');

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

    // Effect hook to fetch students and attendance data when the component mounts or selectedDate changes
    useEffect(() => {
        const fetchStudentsAndAttendance = async () => {
            setError('');
            setSuccess('');
            try {
                // Fetch all students (role: 'student') for the teacher
                const studentsResponse = await axios.get('/api/students', {
                    headers: { 'X-XSRF-TOKEN': getXsrfToken() },
                    withCredentials: true,
                });
                setStudents(studentsResponse.data);

                // Fetch attendance data for the selected date
                const attendanceResponse = await axios.get(`/api/attendance/${selectedDate}`, {
                    headers: { 'X-XSRF-TOKEN': getXsrfToken() },
                    withCredentials: true,
                });
                // Transform attendance data into an object for easier lookup by student_id
                const transformedAttendance = attendanceResponse.data.reduce((acc, current) => {
                    acc[current.student_id] = current.status;
                    return acc;
                }, {});
                setAttendanceData(transformedAttendance);

            } catch (err) {
                console.error('Error fetching data:', err);
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Failed to fetch students or attendance data.');
                }
            }
        };

        fetchStudentsAndAttendance(); // Call the fetch function
    }, [selectedDate]); // Rerun effect when selectedDate changes

    // Handle attendance status change for a specific student
    const handleAttendanceChange = (studentId, status) => {
        // Update the attendanceData state for the specific student
        setAttendanceData(prevData => ({
            ...prevData,
            [studentId]: status,
        }));
    };

    // Handle saving attendance for all students on the selected date
    const handleSaveAttendance = async () => {
        setError('');
        setSuccess('');
        try {
            // Iterate through each student to send attendance data
            for (const student of students) {
                await axios.post('/api/attendance/mark', {
                    user_id: student.id,
                    date: selectedDate,
                    status: attendanceData[student.id] || 'absent', // Default to 'absent' if not explicitly marked
                }, {
                    headers: { 'X-XSRF-TOKEN': getXsrfToken() },
                    withCredentials: true,
                });
            }
            setSuccess('Attendance saved successfully!');
        } catch (err) {
            console.error('Error saving attendance:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to save attendance.');
            }
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Teacher Dashboard</h2>
            {user && <p>Welcome, {user.name}!</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <div className="mark-attendance-section">
                <h3>Mark Attendance for Date:</h3>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
                />

                <ul className="student-list">
                    {students.length > 0 ? (
                        students.map(student => (
                            <li key={student.id}>
                                <span>{student.name}</span>
                                <select
                                    value={attendanceData[student.id] || 'absent'} // Default to 'absent' if no status
                                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="leave">Leave</option>
                                </select>
                            </li>
                        ))
                    ) : (
                        <p>No students found.</p>
                    )}
                </ul>
                <button onClick={handleSaveAttendance}>Save Attendance</button>
            </div>
        </div>
    );
};

export default TeacherDashboard;