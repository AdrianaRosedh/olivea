// app/[lang]/(main)/carreras/estado/[token]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { loadLocale } from "@/lib/i18n";
import { getApplicationStatus } from "@/lib/supabase/careers-actions";
import type { JobApplication } from "@/lib/supabase/careers-actions";

type Params = { params: Promise<{ lang: string; token: string }> };

// The page is a secret URL showing a person's standing. It must never be
// indexed, and it must never be served from a cache — HR changes a stage and
// the applicant should see that stage, not the one from the last build.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await loadLocale({ lang: (await params).lang });
  return {
    title: lang === "en" ? "Your application · Olivea" : "Tu solicitud · Olivea",
    robots: { index: false, follow: false, nocache: true },
    // Deliberately no `alternates`: a canonical or hreflang tag on a private
    // URL is an invitation to crawl it.
  };
}

/** The five stages an application walks through, in order. */
const TRACK = ["applied", "reviewing", "interview", "offer", "hired"] as const;

const STAGE: Record<
  (typeof TRACK)[number],
  { es: [string, string]; en: [string, string] }
> = {
  applied: {
    es: ["Recibida", "Tu solicitud está con nosotros."],
    en: ["Received", "Your application is with us."],
  },
  reviewing: {
    es: ["En revisión", "La está leyendo una persona del equipo."],
    en: ["In review", "Someone on the team is reading it."],
  },
  interview: {
    es: ["Entrevista", "Queremos conocerte. Te escribimos para agendar."],
    en: ["Interview", "We'd like to meet you. We'll write to arrange a time."],
  },
  offer: {
    es: ["Oferta", "Te hicimos una propuesta."],
    en: ["Offer", "We've made you an offer."],
  },
  hired: {
    es: ["Te damos la bienvenida", "Nos da gusto tenerte en Olivea."],
    en: ["Welcome", "We're glad to have you at Olivea."],
  },
};

function fmtDate(iso: string, lang: "es" | "en") {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Tijuana",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

const shell = "mx-auto w-full max-w-2xl px-6 sm:px-8 pt-14 pb-20 md:pt-20 md:pb-28";
const kicker = "text-[12px] uppercase tracking-[0.24em] text-(--olivea-olive)/85";

/** Shown for an unknown, mistyped, or retired token. */
function NotFoundCard({ lang }: { lang: "es" | "en" }) {
  const es = lang === "es";
  return (
    <main className="w-full">
      <div className={shell}>
        <div className={kicker}>{es ? "Estado de tu solicitud" : "Your application"}</div>
        <h1 className="mt-4 text-[30px] md:text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-(--olivea-ink)">
          {es ? "No encontramos esta solicitud" : "We couldn't find this application"}
        </h1>
        <p className="mt-5 text-[15.5px] leading-[1.9] text-(--olivea-ink)/74">
          {es
            ? "El enlace puede estar incompleto. Ábrelo directamente desde el correo que te enviamos al aplicar, sin copiarlo a mano."
            : "The link may be incomplete. Open it straight from the email we sent when you applied, rather than copying it by hand."}
        </p>
        <Link
          href={`/${lang}/carreras`}
          className="mt-8 inline-flex rounded-full px-7 py-3 text-[12px] tracking-[0.22em] uppercase font-semibold bg-(--olivea-olive) text-white hover:bg-(--olivea-clay) ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-px"
        >
          {es ? "Ver vacantes" : "See openings"}
        </Link>
      </div>
    </main>
  );
}

export default async function ApplicationStatusPage({ params }: Params) {
  const p = await params;
  const { lang } = await loadLocale({ lang: p.lang });
  const L = (lang === "en" ? "en" : "es") as "es" | "en";
  const es = L === "es";

  const app = await getApplicationStatus(p.token);
  if (!app) return <NotFoundCard lang={L} />;

  const status = app.status as JobApplication["status"];
  const rejected = status === "rejected";
  const currentIndex = TRACK.indexOf(status as (typeof TRACK)[number]);
  const date = fmtDate(app.appliedAt, L);

  return (
    <main className="w-full">
      <div className={shell}>
        <div className={kicker}>{es ? "Estado de tu solicitud" : "Your application"}</div>

        <h1 className="mt-4 text-[30px] md:text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-(--olivea-ink)">
          {app.roleTitle ?? (es ? "Solicitud abierta" : "Open application")}
        </h1>

        {date && (
          <p className="mt-2 text-[13px] tracking-[0.06em] text-(--olivea-ink)/55">
            {es ? `Enviada el ${date}` : `Submitted ${date}`}
          </p>
        )}

        <div className="mt-9 rounded-[28px] bg-white/22 backdrop-blur-sm ring-1 ring-black/8 shadow-[0_26px_70px_-50px_rgba(0,0,0,0.45)] p-6 md:p-9">
          {rejected ? (
            /* The honest, warm close. No progress rail — a greyed-out track
               reads as a scoreboard of a loss, which is not the message. */
            <>
              <div className="flex items-start gap-4">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-(--olivea-ink)/30" />
                <div>
                  <div className="text-[17px] md:text-[18px] font-semibold text-(--olivea-ink)">
                    {es
                      ? "No seguimos adelante esta vez"
                      : "We didn't move forward this time"}
                  </div>
                  <p className="mt-3 text-[15.5px] leading-[1.9] text-(--olivea-ink)/74">
                    {es
                      ? "Gracias por el tiempo que nos diste. Nos quedamos con tu perfil y te escribiremos si abre algo que encaje."
                      : "Thank you for the time you gave us. We're keeping your profile on file and will write if something opens that fits."}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <ol className="relative">
              {TRACK.map((s, i) => {
                const done = i < currentIndex;
                const now = i === currentIndex;
                const [label, note] = STAGE[s][L];
                return (
                  <li key={s} className="relative flex gap-4 pb-7 last:pb-0">
                    {/* Connector — drawn between dots, not after the last one. */}
                    {i < TRACK.length - 1 && (
                      <span
                        aria-hidden
                        className={
                          "absolute left-[5px] top-[18px] bottom-0 w-px " +
                          (done ? "bg-(--olivea-olive)/55" : "bg-(--olivea-ink)/20")
                        }
                      />
                    )}

                    <span
                      aria-hidden
                      className={
                        "relative z-1 mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full " +
                        (now
                          ? "bg-(--olivea-olive) ring-4 ring-(--olivea-olive)/18"
                          : done
                            ? "bg-(--olivea-olive)/55"
                            : "bg-black/15")
                      }
                    />

                    <div className={now ? "" : "opacity-70"}>
                      <div
                        className={
                          "text-[15.5px] " +
                          (now
                            ? "font-semibold text-(--olivea-ink)"
                            : "text-(--olivea-ink)/70")
                        }
                      >
                        {label}
                      </div>
                      {now && (
                        <p className="mt-2 text-[15px] leading-[1.85] text-(--olivea-ink)/74">
                          {note}
                        </p>
                      )}
                    </div>

                    {/* Screen readers get the state that colour alone carries. */}
                    <span className="sr-only">
                      {now
                        ? es
                          ? " — etapa actual"
                          : " — current stage"
                        : done
                          ? es
                            ? " — completada"
                            : " — complete"
                          : es
                            ? " — pendiente"
                            : " — upcoming"}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <p className="mt-7 text-[14px] leading-[1.85] text-(--olivea-ink)/60">
          {es ? (
            <>
              Esta página se actualiza sola. Si tienes una pregunta, escríbenos a{" "}
              <a
                href="mailto:rrhh@casaolivea.com"
                className="text-(--olivea-olive) underline underline-offset-4 hover:text-(--olivea-clay)"
              >
                rrhh@casaolivea.com
              </a>
              .
            </>
          ) : (
            <>
              This page updates on its own. If you have a question, write to us at{" "}
              <a
                href="mailto:rrhh@casaolivea.com"
                className="text-(--olivea-olive) underline underline-offset-4 hover:text-(--olivea-clay)"
              >
                rrhh@casaolivea.com
              </a>
              .
            </>
          )}
        </p>

        <Link
          href={`/${L}/carreras`}
          className="mt-8 inline-flex text-[12px] uppercase tracking-[0.22em] text-(--olivea-olive)/85 hover:text-(--olivea-clay)"
        >
          {es ? "← Ver todas las vacantes" : "← See all openings"}
        </Link>
      </div>
    </main>
  );
}
