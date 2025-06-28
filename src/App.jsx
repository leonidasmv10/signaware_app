import "./App.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import { ROUTES } from "./config/routes";

import Login from "./components/Login";
import Register from "./components/Register";
import RecoverPassword from "./components/RecoverPassword";
import Chat from "./components/Chat";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    return <Navigate to={ROUTES.HOME} />;
  }

  return children;
};

const ProtectedProviders = ({ children }) => {
  return <AudioProvider>{children}</AudioProvider>;
};

function RequireAuthOrRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to={ROUTES.LOGIN} />;
  return <Navigate to={ROUTES.HOME} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta principal protegida */}
          <Route
            path={ROUTES.HOME}
            element={
              <PrivateRoute>
                <ProtectedProviders>
                  <Chat />
                </ProtectedProviders>
              </PrivateRoute>
            }
          />

          {/* Rutas públicas */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.RECOVER_PASSWORD} element={<RecoverPassword />} />

          {/* Catch-all route for any other path */}
          <Route path="*" element={<RequireAuthOrRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
