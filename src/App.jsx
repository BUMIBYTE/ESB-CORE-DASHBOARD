import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Layout from "./components/Layout";

import Dashboard from "./pages/admin/Dashboard";
import Canvas from "./pages/admin/Canvas";
import Routing from "./pages/admin/Routing";
import Account from "./pages/admin/Account";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* PROTECTED */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="canvas" element={<Canvas />} />
        <Route path="routing" element={<Routing />} />
        <Route path="account" element={<Account />} />
      </Route>
    </Routes>
  );
}

export default App;