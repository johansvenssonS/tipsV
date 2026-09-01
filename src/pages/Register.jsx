import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast } from "../lib/ToastContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Ange ett lagnamn.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const data = await register(trimmed);
      setCreatedCode(data.code);
    } catch {
      setError("Registreringen misslyckades. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(createdCode);
      showToast("Lagkoden är kopierad.", "success");
    } catch {
      showToast("Kunde inte kopiera automatiskt — markera koden manuellt.", "error");
    }
  }

  if (createdCode) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-65px)] max-w-lg flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Laget är skapat
        </h1>
        <p className="mt-3 text-stone-600">
          Spara koden nedan — ni behöver den varje gång ni loggar in.
        </p>
        <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-stone-200 bg-stone-50 px-5 py-4">
          <span className="font-mono text-2xl font-semibold tracking-widest text-stone-900">
            {createdCode}
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-white"
          >
            Kopiera
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate("/team")}
          className="mt-6 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
        >
          Fortsätt till mitt lag
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-65px)] max-w-5xl items-center">
      <div className="grid grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[2fr_3fr] md:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Skapa ett lag
        </h1>
        <p className="mt-3 text-stone-600">
          Ge laget ett namn. Ni får en kod direkt efteråt som alla i laget
          använder för att logga in.
        </p>
        <p className="mt-4 text-sm text-stone-500">
          Redan ett lag?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Logga in här
          </Link>
          .
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-lg border border-stone-200 bg-white p-6"
      >
        <label htmlFor="lagnamn" className="block text-sm font-medium text-stone-700">
          Lagnamn
        </label>
        <input
          id="lagnamn"
          type="text"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="T.ex. Bröderna Svensson"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "lagnamn-error" : undefined}
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {error && (
          <p id="lagnamn-error" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Skapar lag…" : "Skapa lag"}
        </button>
      </form>
      </div>
    </div>
  );
}
