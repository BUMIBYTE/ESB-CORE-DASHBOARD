import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Layout from "./components/Layout";

import Dashboard from "./pages/admin/Dashboard";
import Canvas from "./pages/admin/Canvas";
import Routing from "./pages/admin/Routing";
import Account from "./pages/admin/Account";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}

      {/* Admin Panel */}
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="canvas" element={<Canvas />} />
        <Route path="routing" element={<Routing />} />
        <Route path="account" element={<Account />} />
      </Route>
    </Routes>
  );
}

export default App;