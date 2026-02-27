import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
    children: React.ReactElement;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;

