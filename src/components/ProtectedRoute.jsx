import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If a specific role is required, check it
    if (allowedRole && user?.role !== allowedRole) {
        // Redirect to the correct dashboard
        const redirect = user?.role === 'teacher' ? '/teacher-dashboard' : user?.role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
        return <Navigate to={redirect} replace />;
    }

    return children;
}
