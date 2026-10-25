// app/(main)/[lang]/cafe/ArticleEs.tsx
// Server-rendered semantic article (Spanish) for crawlers, AI assistants, and no-JS clients.

import Image from "next/image";

export default function ArticleEs() {
  return (
    <article aria-label="Olivea Café Wine Bar" className="ssr-article" lang="es" itemScope itemType="https://schema.org/CafeOrCoffeeShop">
      <meta itemProp="name" content="Olivea Café Wine Bar" />
      <meta itemProp="servesCuisine" content="Café de Especialidad, Desayuno del Huerto, Pan de Casa" />

      <header>
        <h1>Olivea Café Wine Bar</h1>
        <p><em>Donde el huerto es la esencia</em></p>
        <Image src="/images/cafe/hero.jpg" alt="Olivea Café Wine Bar — café de especialidad y desayuno del huerto en Valle de Guadalupe" width={1200} height={630} priority className="ssr-article-hero" />
      </header>

      {/* ── Experiencia ── */}
      <section id="experiencia-es" aria-labelledby="exp-heading-es">
        <h2 id="exp-heading-es">El ritmo diario de Olivea</h2>
        <p>Café lento. Comida lenta. Energía calmada — práctica cotidiana, disciplina suave.</p>
        <p>Olivea Café Wine Bar es la expresión más relajada del ecosistema Olivea — donde la mañana se despliega con calma sobre un café, la tarde se asienta con una copa de vino del Valle de Guadalupe, el movimiento se siente humano, y el huerto sigue marcando el rumbo. Comparte los mismos líderes, los mismos estándares y la misma filosofía que Casa Olivea y Olivea Farm To Table.</p>

        <dl>
          <dt>Horario</dt><dd>Diario · 7:15 am – 4:00 pm</dd>
          <dt>Café</dt><dd>Origen México · técnica cuidada</dd>
          <dt>Cocina</dt><dd>Conectada a Farm To Table · sistema compartido</dd>
          <dt>Ritmo</dt><dd>Café · brunch · vino</dd>
        </dl>

        <p>Nuestro café proviene exclusivamente de México. Lo elegimos por balance, claridad y un final limpio — diseñado para sentirse sereno y sin prisa. El tueste en casa vive como una fase futura, incorporada cuando el sistema esté listo.</p>
        <p>La técnica vive en silencio. Espresso afinado para estructura. Filtrado con transparencia. Constancia y contención guían cada taza — excelencia que se siente natural.</p>
        <p>Servimos matcha ceremonial, preparado con el mismo cuidado que el café. Y jugamos con el huerto — creando jarabes que mantienen el menú estacional, con sabor expresivo y claridad.</p>

        <aside>
          <p>En Olivea, la sustentabilidad es eficiencia: respeto hecho práctico. El café comparte ingredientes, trabajo de fermentación y un ciclo continuo con Farm To Table — huerto → cocina → composta → regreso a la tierra.</p>
        </aside>

        <p>Cuando la luz de la tarde baja, el café se vuelve wine bar. La carta abre con Valle de Guadalupe y Baja California — los productores que son, literalmente, nuestros vecinos — junto a nuestro vino de la casa y algunas botellas seleccionadas de otras regiones, servidas con tapas del huerto. El café y el vino comparten una misma ética: lento, preciso, arraigado a la tierra. Del huerto a la mesa, del Valle de Guadalupe a la copa — una continuación calmada del día, del primer espresso de la mañana a la última copa de la tarde.</p>
      </section>

      {/* ── Desayuno ── */}
      <section id="desayuno-es" aria-labelledby="desayuno-heading-es">
        <h2 id="desayuno-heading-es">Desayuno hogareño y preciso</h2>
        <p>El desayuno en Olivea Café Wine Bar se vive con calma. La intención es el ritmo: platos que se sienten cálidos y familiares, con ejecución limpia y cuidada.</p>
        <p>El estilo es mayormente salado, con alma mexicana — comida sencilla, hecha con cariño, guiada por lo que el huerto y la temporada están ofreciendo.</p>
        <p>Compartimos ingredientes y preparaciones con Olivea Farm To Table cuando aporta coherencia al sistema. Un ecosistema: eficiencia práctica, continuidad real.</p>
        <p>En Casa Olivea, el día comienza en Olivea Café Wine Bar. Quienes visitan por el día también son bienvenidos — el café funciona como puerta de entrada al ritmo Olivea.</p>
      </section>

      {/* ── Pan ── */}
      <section id="pan-es" aria-labelledby="pan-heading-es">
        <h2 id="pan-heading-es">Pan como rito</h2>
        <p>La harina es estructura. La elegimos por sabor y desempeño en fermentación — una miga ligera y completa, pensada para sentirse limpia y equilibrada.</p>
        <p>Las recetas se componen para claridad: capas limpias, sazón balanceada y textura intencional. La meta es precisión que se siente suave.</p>
        <p>Olivea Café Wine Bar comparte liderazgo con Farm To Table — guiado por el Chef Daniel Nates — junto con un chef dedicado a pan y pastelería que sostiene ambas cocinas. Coherencia por encima de uniformidad: una visión, muchas expresiones.</p>
        <p>El pan acompaña naturalmente el café lento de la mañana y sostiene el mismo estándar que vive en todo Olivea. La fermentación es inteligencia del tiempo: extiende la temporada con elegancia, preserva momentos en su punto, y mantiene continuidad — integrando lo que queda al ciclo del sistema a través de la composta.</p>
      </section>

      {/* ── Menú ── */}
      <section id="menu-info-es" aria-labelledby="menu-heading-es">
        <h2 id="menu-heading-es">El menú</h2>
        <p>Un <strong>menú de café + café</strong> curado, diseñado con claridad y ritmo — espresso con estructura, filtrado con transparencia, té en calma y bebidas frías con brillo. El café proviene exclusivamente de <strong>México</strong>. El matcha es ceremonial. Los jarabes evolucionan con el huerto.</p>
        <h3>Café · origen México</h3>
        <p>Espresso y filtrado afinados para claridad y balance. El tueste en casa vive como una fase futura, incorporada cuando el sistema esté listo.</p>
        <h3>Matcha · jarabes del huerto</h3>
        <p>Matcha ceremonial, preparado con técnica. Jarabes estacionales que evolucionan con el huerto — expresivos, con claridad.</p>
        <h3>Wine Bar · Valle de Guadalupe</h3>
        <p>Cuando el día baja, el café se vuelve wine bar — Valle de Guadalupe y Baja California por copa, nuestro vino de la casa y tapas del huerto. Del huerto a la mesa, del Valle de Guadalupe a la copa.</p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq-es" aria-labelledby="faq-heading-es">
        <h2 id="faq-heading-es">Para tener en cuenta</h2>
        <h3>¿Para quién es Olivea Café Wine Bar?</h3>
        <p>En Casa Olivea, el día comienza aquí. Quienes visitan por el día también son bienvenidos — el café es una puerta de entrada al ritmo Olivea.</p>
        <h3>¿Cuál es el horario de Olivea Café Wine Bar?</h3>
        <p>Olivea Café Wine Bar abre todos los días de 7:15 am a 4:00 pm. La cocina va de 8 am a 4 pm, con el menú disponible durante el día, y el vino se sirve a partir de las 10 am.</p>
        <h3>¿Qué estilo de desayuno ofrecen?</h3>
        <p>El desayuno es mayormente salado, con alma mexicana — pensado para sentirse calmado, nutritivo e intencional.</p>
        <h3>¿Cómo funciona el desayuno para huéspedes de Casa Olivea?</h3>
        <p>El desayuno no está incluido en la estancia, pero los huéspedes pueden disfrutarlo en Olivea Café Wine Bar cada mañana.</p>
        <h3>¿De dónde proviene el café?</h3>
        <p>El café proviene exclusivamente de México, trabajado con técnica y constancia.</p>
        <h3>¿Sirven matcha?</h3>
        <p>Sí — matcha ceremonial, preparado con cuidado. Los jarabes estacionales evolucionan con el huerto.</p>
        <h3>¿Las mascotas son bienvenidas?</h3>
        <p>Sí — las áreas del café son pet friendly.</p>
        <h3>¿Tienen wine bar?</h3>
        <p>Sí. Cuando el día baja, el café se vuelve wine bar, con Valle de Guadalupe y Baja California a la cabeza, nuestro vino de la casa y tapas del huerto. Sin reservación: llega directo.</p>
        <h3>¿Ofrecen descorche?</h3>
        <p>Sí — el descorche es $500 MXN por botella, o $900 MXN por mágnum.</p>
        <h3>¿Puedo pedir vino por copa?</h3>
        <p>Sí. Buena parte de la carta se sirve por copa, para recorrer el Valle de Guadalupe.</p>
      </section>
    </article>
  );
}
