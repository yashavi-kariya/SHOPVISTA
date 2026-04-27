import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (user?.role !== "admin") {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;