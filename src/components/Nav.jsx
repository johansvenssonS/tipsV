import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { asset } from "../lib/asset.js";

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent/10 text-accent"
      : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
  }`;

export default function Nav() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <NavLink to="/" className="flex items-center">
          <img
            src={asset("static/logo/tipsvänner.png")}
            alt="Tipsvänner"
            className="h-10 w-auto"
          />
        </NavLink>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Hem
          </NavLink>
          {isLoggedIn && (
            <>
              <NavLink to="/team" className={linkClass}>
                Mitt lag
              </NavLink>
              <NavLink to="/play" className={linkClass}>
                Kupong
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-md px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
              >
                Logga ut
              </button>
            </>
          )}
          {!isLoggedIn && (
            <NavLink to="/login" className={linkClass}>
              Logga in
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
