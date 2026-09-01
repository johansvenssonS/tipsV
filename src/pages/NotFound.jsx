import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">
        Sidan hittades inte
      </h1>
      <p className="text-stone-600">
        Det finns ingen sida på den här adressen.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
      >
        Till startsidan
      </Link>
    </div>
  );
}
