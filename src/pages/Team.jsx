import { useAuth } from "../lib/AuthContext.jsx";

export default function Team() {
  const { currentUser } = useAuth();
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Mitt lag: {currentUser}
      </h1>
      <p className="mt-2 text-stone-600">Kommer i nästa steg av ombyggnaden.</p>
    </div>
  );
}
