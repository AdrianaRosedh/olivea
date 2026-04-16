// app/(main)/[lang]/farmtotable/ArticleEs.tsx
// Server-rendered semantic article (Spanish) for crawlers, AI assistants, and no-JS clients.
// The client-rendered ContentEs provides the visual experience with animations.
// This component is hidden via CSS once JS hydrates.

import Image from "next/image";

export default function ArticleEs() {
  return (
    <article
      aria-label="Olivea Farm To Table"
      className="ssr-article"
      lang="es"
      itemScope
      itemType="https://schema.org/Restaurant"
    >
      <meta itemProp="name" content="Olivea Farm To Table" />
      <meta itemProp="servesCuisine" content="Menú Degustación, Del Huerto a la Mesa, Baja Mediterráneo" />

      {/* ── Hero ── */}
      <header>
        <h1>Olivea Farm To Table</h1>
        <p>
          <em>Donde el huerto es la esencia</em>
        </p>
        <Image
          src="/images/farm/hero.jpg"
          alt="Olivea Farm To Table — restaurante con estrella MICHELIN en Valle de Guadalupe"
          width={1200}
          height={630}
          priority
          className="ssr-article-hero"
        />
      </header>

      {/* ── Experiencia ── */}
      <section id="experiencia" aria-labelledby="experiencia-heading">
        <h2 id="experiencia-heading">
          Un recorrido gastronómico guiado por el huerto
        </h2>
        <p>
          Un solo menú degustación, compuesto por estaciones — guiado por la
          tierra, el clima y el tiempo.
        </p>
        <p>
          Olivea Farm To Table es un <strong>menú degustación</strong> nacido
          del huerto. La cocina interpreta la tierra y el clima; la mesa traduce
          ese paisaje en memoria, a través del tiempo, la técnica y la
          contención.
        </p>

        <dl>
          <dt>Formato</dt>
          <dd>Menú degustación · 9 tiempos</dd>
          <dt>Temporada</dt>
          <dd>Cambia cada 5–6 semanas · guiado por el huerto</dd>
          <dt>Origen</dt>
          <dd>Huerto privado · Valle de Guadalupe</dd>
          <dt>Duración</dt>
          <dd>~3 horas · concebido para desplegarse con calma</dd>
        </dl>

        <p>
          El Valle ofrece tierra, mar y campo en diálogo constante. Buscamos
          equilibrio — acidez y profundidad, amargor y dulzor, temperatura y
          textura — guiados por lo que el huerto y los productores cercanos
          ofrecen en su punto natural.
        </p>

        <aside>
          <p>
            El huerto es un sistema vivo con retorno completo: cosecha → cocina
            → composta → suelo → cosecha. Con <strong>aviso previo</strong>,
            adaptamos cuidadosamente el menú para alergias importantes o
            restricciones alimentarias, preservando siempre la esencia del
            recorrido.
          </p>
        </aside>

        <p>
          La trazabilidad, el cuidado del agua y el pensamiento circular guían
          nuestras decisiones. La sustentabilidad se practica como disciplina
          diaria — medida, concreta y anclada a la realidad del territorio. La
          experiencia se vive con calma, pensada para adultos que pueden dedicar{" "}
          <strong>~3 horas</strong> a la mesa.
        </p>
      </section>

      {/* ── Cocina ── */}
      <section id="cocina" aria-labelledby="cocina-heading">
        <h2 id="cocina-heading">Técnica al servicio del origen</h2>
        <p>
          El producto marca el camino. La cocina nace del huerto y de
          productores cercanos — capas limpias, control preciso del calor y
          métodos que respetan cada ingrediente en su punto natural.
        </p>
        <p>
          <strong>Bajo la dirección del Chef Ejecutivo Daniel Nates,</strong> la
          cocina trabaja en diálogo cercano con el territorio — leyendo el
          suelo, el clima y la temporada como punto de partida de cada plato.
        </p>
        <p>
          Trabajamos con un solo menú degustación de temporada. La creatividad
          vive dentro del ciclo: lo abundante, lo delicado y aquello que merece
          continuar su camino.
        </p>
        <p>
          La técnica existe para aclarar el sabor y mantener el equilibrio.
          Fondos, reducciones y una sazón medida construyen profundidad sin
          ocultar el origen. La fermentación extiende la temporada — permitiendo
          continuidad con elegancia y contención.
        </p>
        <p>
          El equipo cocina leyendo clima, huerto y servicio como un solo sistema
          — entendiendo qué está en su punto, qué se conserva y qué evoluciona
          en silencio dentro de la despensa.
        </p>
      </section>

      {/* ── Mesa / Hospitalidad ── */}
      <section id="mesa" aria-labelledby="mesa-heading">
        <h2 id="mesa-heading">Hospitalidad como calibración</h2>
        <p>
          Recibimos como a amigos. El servicio está presente, es discreto y se
          calibra al ritmo de cada mesa.
        </p>
        <p>
          Cuidamos tiempos y temperatura para que cada plato llegue en su
          momento ideal — compuesto, claro y vivo.
        </p>
        <p>
          Cada tiempo tiene contexto: su origen, las manos que lo cuidan y la
          intención detrás de cada maridaje. La narrativa se mantiene honesta y
          precisa.
        </p>
        <p>
          Contamos con una <strong>terraza con vista al huerto</strong> y
          espacios interiores cálidos. Asignamos mesas según sus preferencias y
          el flujo de servicio. Aceptamos perros en áreas designadas de la
          terraza y, con planeación previa, podemos coordinar{" "}
          <strong>celebraciones o eventos especiales</strong>.
        </p>
      </section>

      {/* ── Ecosistema / Despensa ── */}
      <section id="despensa" aria-labelledby="despensa-heading">
        <h2 id="despensa-heading">El Ecosistema de Olivea</h2>
        <p>El huerto es la esencia. Pero con un huerto, ¿qué se crea?</p>
        <p>
          La comida convoca compañía. La compañía transforma el momento en
          experiencia.
        </p>
        <p>
          En Olivea, el huerto es el origen — pero no es la única voz. La
          sustentabilidad aquí también es contención: cocinar con lo que el
          territorio da, sin forzarlo.
        </p>

        <h3>Territorio</h3>
        <p>
          Cocinamos desde el lugar: Valle de Guadalupe, Baja California,
          México. Tierra y sal. Luz de desierto, viento costero y una temporada
          que puede cambiar de un día a otro.
        </p>

        <h3>Un solo sistema de cocina</h3>
        <p>
          Nuestras cocinas están profundamente conectadas. Lo que una no puede
          usar, la otra muchas veces sí — permitiendo que ingredientes,
          preparaciones e ideas encuentren su contexto correcto.
        </p>

        <h3>El ciclo continuo</h3>
        <p>
          El ciclo es continuo: huerto → Olivea Farm To Table → Olivea Café →
          fermentación → composta → regreso al huerto. Nada existe aislado;
          todo regresa.
        </p>

        <h3>Fermentación como inteligencia del tiempo</h3>
        <p>
          La fermentación extiende la temporada sin reemplazarla. Conserva
          momentos en su punto, construye profundidad con procesos vivos y
          mantiene activa la memoria dentro del menú.
        </p>

        <h3>Comité de Investigación</h3>
        <p>
          Cada temporada se estudia. Documentamos, probamos, refinamos y
          decidimos — alineando la realidad del huerto, la técnica de cocina y
          el ritmo del servicio en un estándar preciso y repetible.
        </p>

        <h3>Estándar compartido</h3>
        <p>
          Esta visión se comparte profundamente con el Chef Daniel Nates —
          curioso, disciplinado y exacto. Con él, la gastronomía se vuelve
          diálogo: huerto y costa, técnica y memoria, Baja y México, traducidos
          con cuidado.
        </p>

        <h3>Narrativa como oficio</h3>
        <p>
          Aquí importan los ingredientes. Importa la narrativa. Cada plato
          carga una temporada, una decisión y un lugar — comunicados con
          honestidad, sin espectáculo.
        </p>
      </section>

      {/* ── Menú ── */}
      <section id="menu-info" aria-labelledby="menu-heading-es">
        <h2 id="menu-heading-es">El menú</h2>
        <p>
          Un <strong>menú degustación de 9 tiempos</strong>, concebido como un
          solo recorrido. El menú cambia con el huerto, guiado por lo que el
          huerto y la temporada ofrecen en su punto.
        </p>

        <h3>Maridajes y descorche</h3>
        <p>
          Un recorrido de vinos del Valle y un <em>maridaje sin alcohol</em>.
          Descorche: <strong>$350 MXN por botella</strong>.
        </p>

        <h3>Preferencias y alergias</h3>
        <p>
          Con aviso previo, adaptamos el menú con cuidado. Opción vegetariana
          disponible bajo solicitud.
        </p>

        <h3>El huerto al centro</h3>
        <p>
          Producto de temporada; técnica precisa. La experiencia dura{" "}
          <strong>~3 horas</strong>.
        </p>
      </section>

      {/* ── Galería (alt text) ── */}
      <section id="galeria-info" aria-label="Galería">
        <h2>Galería</h2>
        <ul>
          <li>Pato local</li>
          <li>Plato de Olivea</li>
          <li>Langosta de Baja California</li>
          <li>Curry del huerto</li>
          <li>Mejillón de choro</li>
          <li>Amuse-bouche</li>
        </ul>
      </section>

      {/* ── Preguntas frecuentes ── */}
      <section id="faq-es" aria-labelledby="faq-heading-es">
        <h2 id="faq-heading-es">Antes de reservar</h2>

        <h3>¿Qué tipo de experiencia es Olivea Farm To Table?</h3>
        <p>
          Olivea Farm To Table es un{" "}
          <strong>menú degustación estacional</strong> guiado por nuestro huerto
          y productores cercanos. El recorrido está diseñado como un solo viaje
          — con ritmo, profundidad y precisión.
        </p>

        <h3>¿Cuánto tiempo dura la cena?</h3>
        <p>
          La mayoría de los huéspedes disfrutan la experiencia completa en{" "}
          <strong>~3 horas</strong>. Cuidamos el ritmo para que cada tiempo
          llegue en su punto ideal.
        </p>

        <h3>¿Manejan platillos a la carta?</h3>
        <p>
          El menú se sirve como un{" "}
          <strong>solo recorrido degustación</strong>. Esta estructura permite
          cocinar con continuidad y precisión a lo largo de la temporada.
        </p>

        <h3>¿Pueden adaptarse a alergias o restricciones alimentarias?</h3>
        <p>
          Sí — con <strong>aviso previo al momento de reservar</strong>,
          adaptamos con cuidado ante alergias o restricciones importantes,
          preservando la intención del menú. En algunos casos existe una versión{" "}
          <strong>vegetariana</strong>, según la temporada.
        </p>

        <h3>¿La experiencia está pensada para niños?</h3>
        <p>
          El recorrido está diseñado principalmente para{" "}
          <strong>adultos</strong> que desean dedicar tiempo a la mesa. Si
          planeas una visita en familia, con gusto te ayudamos a elegir la
          experiencia Olivea más adecuada.
        </p>

        <h3>¿Reciben mascotas?</h3>
        <p>
          Recibimos perros en{" "}
          <strong>áreas designadas de terraza</strong>, según el flujo de
          servicio y el ritmo de la noche.
        </p>

        <h3>¿Ofrecen maridajes con vino y sin alcohol?</h3>
        <p>
          Sí. Ofrecemos un recorrido de vinos por el Valle y un{" "}
          <strong>maridaje sin alcohol</strong> diseñado con ciencia del sabor.
        </p>

        <h3>¿Tienen descorche?</h3>
        <p>
          Sí — el descorche está disponible en{" "}
          <strong>$350 MXN por botella</strong>.
        </p>

        <h3>¿Hay código de vestimenta?</h3>
        <p>
          Sugerimos <strong>smart casual</strong> — cómodo, cuidado y apropiado
          para una noche en Valle de Guadalupe.
        </p>

        <h3>¿Puedo solicitar terraza o cierta vista?</h3>
        <p>
          Tomamos en cuenta preferencias con cuidado y asignamos mesas según
          disponibilidad y flujo de servicio. Si tienes una solicitud
          específica, inclúyela en las notas de tu reserva.
        </p>

        <h3>¿Pueden ayudar con celebraciones o eventos especiales?</h3>
        <p>
          Sí — recibimos celebraciones con{" "}
          <strong>planeación previa</strong>. Compártenos tu intención al
          reservar y te guiaremos para honrar el momento con elegancia.
        </p>
      </section>
    </article>
  );
}
