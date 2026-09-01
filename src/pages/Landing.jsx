import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { asset } from "../lib/asset.js";

export default function Landing() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-14">
      <section className="grid grid-cols-1 gap-10 md:grid-cols-[3fr_2fr] md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            Stryktipset, tillsammans
          </p>
          <h1 className="mt-3 max-w-lg text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-stone-900 text-balance">
            Dela matcherna. Dela äran. Hitta den svaga länken.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600">
            Tipsvänner föddes ur en gammal vana: mina bröder och jag delade
            upp Stryktipsets tretton matcher mellan oss, fyra var, och
            tippade tillsammans varje vecka. Den här appen bygger vidare på
            det — men nu kan vi faktiskt se, i siffror, vem som bar laget
            och vem som gissade.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {isLoggedIn ? (
              <Link
                to="/play"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                Till veckans kupong
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                >
                  Skapa ett lag
                </Link>
                <Link
                  to="/login"
                  className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                >
                  Logga in med lagkod
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="relative -mr-2 hidden aspect-[4/5] items-center justify-center overflow-hidden rounded-lg bg-accent/[0.06] p-10 md:flex">
          <img
            src={asset("static/icons/group.jpg")}
            alt="Vänner samlade för att lägga sitt tips"
            className="w-full max-w-[220px] object-contain"
          />
        </div>
      </section>

      <section className="mt-20 grid grid-cols-1 gap-10 md:grid-cols-[2fr_3fr]">
        <div className="order-2 flex aspect-[4/5] items-center justify-center rounded-lg bg-stone-100 p-10 md:order-1">
          <img
            src={asset("static/icons/graph.jpg")}
            alt="Statistik över lagets tidigare tips"
            className="w-full max-w-[200px] object-contain"
          />
        </div>
        <div className="order-1 flex flex-col justify-center md:order-2">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">
            Så funkar det
          </h2>
          <ul className="mt-4 space-y-3 text-stone-600">
            <li className="flex gap-3">
              <span className="mt-1 text-accent">01</span>
              <span>
                Skapa ett lag och bjud in dem du brukar tippa med — eller
                logga in med koden ni redan har.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-accent">02</span>
              <span>
                Fördela veckans tretton matcher mellan spelarna, så alla har
                ett tydligt ansvar.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-accent">03</span>
              <span>
                Följ upp resultaten över säsongen — och håll koll på vem som
                faktiskt levererar.
              </span>
            </li>
          </ul>
          <p className="mt-6 border-l-2 border-accent pl-4 text-sm font-medium text-stone-700">
            Inget lag är starkare än sin svagaste spelare.
          </p>
        </div>
      </section>
    </div>
  );
}
