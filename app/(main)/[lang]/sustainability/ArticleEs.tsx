// app/(main)/[lang]/sustainability/ArticleEs.tsx
// Server component — semantic HTML for crawlers, AI assistants, and no-JS clients.

import Image from "next/image";

export default function ArticleEs() {
  return (
    <article
      aria-label="Filosofía OLIVEA"
      className="ssr-article"
      lang="es"
      itemScope
      itemType="https://schema.org/Article"
    >
      <meta itemProp="author" content="OLIVEA" />
      <meta itemProp="publisher" content="OLIVEA" />

      <header>
        <h1 itemProp="headline">Filosofía — OLIVEA</h1>
        <p>
          <em>
            Origen, identidad, eficiencia, innovación, gastronomía y comunidad
            — del huerto a la mesa.
          </em>
        </p>
        <Image
          src="/images/farm/garden.jpg"
          alt="El huerto de OLIVEA en Valle de Guadalupe — olivos, camas de cultivo y el paisaje desértico de Baja California."
          width={1200}
          height={630}
          className="ssr-article-hero"
          priority={false}
        />
      </header>

      {/* ── 1. Orígenes ── */}
      <section aria-label="Orígenes">
        <h2>Orígenes</h2>
        <p>
          Olivea abrió a finales del verano de 2023. Inicialmente fue
          concebido como un lugar tranquilo y fácil de operar, con poca
          mercadotecnia. Pero el proyecto evolucionó y pidió más intención.
          Lo que surgió no fue solo una propiedad sino un sistema vivo con
          responsabilidad distribuida.
        </p>
        <p>
          Ange Joy, fundadora y diseñadora, dio forma al espacio físico y
          a la atmósfera — el diseño como lectura consciente del lugar.
          Cristina, psicóloga al frente de RRHH, construyó la cultura
          interna, tratándola como verdadera infraestructura. Adriana Rose,
          CEO con formación en ciencias de la computación y un MBA, aportó
          alineación y pensamiento sistemático: urgencia que organiza sin
          presionar.
        </p>
        <p>
          Juntas establecieron una base donde las decisiones de diseño están
          arraigadas en la realidad operativa, la cultura es infraestructura
          y la claridad viene antes que la expansión.
        </p>
      </section>

      {/* ── 2. Visión ── */}
      <section aria-label="Visión">
        <h2>Visión e Identidad</h2>
        <p>
          Olivea es un ecosistema — no un hotel, un restaurante y un café
          que comparten propiedad. Una filosofía unificada conecta cada
          expresión: Farm To Table, Café y Casa Olivea.
        </p>
        <p>
          El símbolo central es un alebrije — una criatura híbrida
          mitológica mexicana — específicamente un insecto con cuerpo de
          oliva, alas de hoja de olivo y cabeza de rábano. Representa
          huerto, crecimiento y nutrición. El mismo alebrije aparece en las
          tres propiedades en distintas posiciones, enfatizando coherencia
          sobre uniformidad.
        </p>
      </section>

      {/* ── 3. Sustentabilidad ── */}
      <section aria-label="Sustentabilidad">
        <h2>Sustentabilidad</h2>
        <p>
          En Valle de Guadalupe — donde el agua es finita y la electricidad
          inestable — la sustentabilidad no es ideología; es eficiencia y
          respeto practicado a diario. Es infraestructura.
        </p>
        <ul>
          <li>Energía solar para garantizar la continuidad operativa.</li>
          <li>Reutilización de aguas grises para riego.</li>
          <li>
            Los vegetales se lavan con agua corriente que luego se recolecta
            y dirige a irrigar áreas específicas del huerto.
          </li>
          <li>
            Las plantas de centro de mesa funcionan como viveros vivos —
            regresan al huerto cuando su tiempo en la mesa termina.
          </li>
          <li>Cocinas conectadas que comparten recursos entre propiedades.</li>
          <li>
            Un ciclo continuo: huerto → Farm To Table → Café → fermentación →
            composta → de vuelta al huerto.
          </li>
        </ul>
        <p>
          La búsqueda es cero desperdicio — no se afirma como perfecto, pero
          se mide y ajusta constantemente.
        </p>
      </section>

      {/* ── 4. Tecnología ── */}
      <section aria-label="Tecnología">
        <h2>Tecnología e Innovación</h2>
        <p>
          La tecnología en Olivea es intencionalmente silenciosa e invisible.
          Existe para aportar claridad, consistencia y mejora — no
          espectáculo. Vive en la organización de tareas, el monitoreo de
          energía, los sistemas de conocimiento y los ciclos de
          retroalimentación que reducen la fricción y aumentan el enfoque.
        </p>
        <p>
          Innovar no es buscar novedad; es preguntar mejor. ¿Cómo pueden los
          equipos trabajar con más inteligencia? ¿Cómo pueden los sistemas
          apoyar a las personas sin reemplazarlas? ¿Cómo puede la
          hospitalidad volverse más serena, más clara y más humana?
        </p>
      </section>

      {/* ── 5. Gastronomía ── */}
      <section aria-label="Gastronomía">
        <h2>Gastronomía</h2>
        <p>
          El huerto es la esencia pero no la única voz. La cocina en Olivea
          enfatiza el origen y la mesura — usa lo que el territorio de Valle
          de Guadalupe, Baja California ofrece, sin forzar.
        </p>
        <p>
          Olivea funciona como un ecosistema gastronómico completo: los
          huéspedes se hospedan donde se cultiva la comida y comen ahí
          mañana y noche. El Chef Daniel Nates encarna la filosofía —
          curioso, disciplinado, preciso — entiende el origen y la mesura.
          Cada platillo lleva una estación, una decisión y un lugar: huerto
          y costa, técnica y memoria, Baja y México.
        </p>
        <p>
          La gastronomía se convierte en un diálogo entre huerto, mar,
          cocina y huésped.
        </p>
      </section>

      {/* ── 6. Comunidad ── */}
      <section aria-label="Comunidad">
        <h2>Comunidad</h2>
        <p>
          Quienes llegan a Olivea se convierten en <em>Colibríes</em> —
          representando precisión, generosidad y movimiento con propósito.
          La cultura se trata como un sistema vivo que exige atención y
          cuidado diario.
        </p>
        <p>
          El enfoque promueve ritmos de trabajo saludables, alimentación
          consciente, descanso real y bienestar emocional como parte del
          sistema — no como beneficios adyacentes. Comunidad es
          reciprocidad: &laquo;Tú me cuidas. Yo te cuido. Y juntos,
          cuidamos el lugar que compartimos.&raquo;
        </p>
        <p>
          La hospitalidad es coreografía — cada movimiento intencional,
          cada rol conectado al todo.
        </p>
      </section>
    </article>
  );
}
