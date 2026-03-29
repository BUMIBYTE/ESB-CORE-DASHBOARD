import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsValid(false);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/verifySessions");

        if (res.data.code === 200) {
          setIsValid(true);
        } else {
          setIsValid(false);
          localStorage.removeItem("accessToken");
        }
      } catch (err) {
        console.error("Session invalid:", err);
        setIsValid(false);
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        Checking session...
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;