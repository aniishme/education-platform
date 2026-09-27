import { Navigate, useLocation } from "react-router-dom";
import { getRole, isLoggedIn } from "../utils/auth";

function ProtectedRoute({ children, role }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && getRole() !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
