import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Ange er lagkod.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await login(trimmed);
      navigate("/team");
    } catch {
      setError("Vi kunde inte hitta ett lag med den koden. Kontrollera stavningen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-65px)] max-w-5xl items-center">
      <div className="grid grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[2fr_3fr] md:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Logga in
        </h1>
        <p className="mt-3 text-stone-600">
          Använd koden ni fick när laget skapades. Den som registrerade
          laget har den sparad.
        </p>
        <p className="mt-4 text-sm text-stone-500">
          Inget lag ännu?{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Skapa ett här
          </Link>
          .
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-lg border border-stone-200 bg-white p-6"
      >
        <label htmlFor="lagkod" className="block text-sm font-medium text-stone-700">
          Lagkod
        </label>
        <input
          id="lagkod"
          type="text"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="T.ex. AB12CD"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "lagkod-error" : undefined}
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {error && (
          <p id="lagkod-error" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Loggar in…" : "Logga in"}
        </button>
      </form>
      </div>
    </div>
  );
}
