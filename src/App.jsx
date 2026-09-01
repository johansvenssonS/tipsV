import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext.jsx";
import { ToastProvider } from "./lib/ToastContext.jsx";
import RequireAuth from "./lib/RequireAuth.jsx";
import Nav from "./components/Nav.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Team from "./pages/Team.jsx";
import Game from "./pages/Game.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <Nav />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/team"
              element={
                <RequireAuth>
                  <Team />
                </RequireAuth>
              }
            />
            <Route
              path="/play"
              element={
                <RequireAuth>
                  <Game />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
