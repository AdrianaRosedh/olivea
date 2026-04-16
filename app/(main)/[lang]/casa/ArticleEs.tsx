// app/(main)/[lang]/casa/ArticleEs.tsx
// Server-rendered semantic article (Spanish) for crawlers, AI assistants, and no-JS clients.

import Image from "next/image";

export default function ArticleEs() {
  return (
    <article aria-label="Casa Olivea" className="ssr-article" lang="es" itemScope itemType="https://schema.org/Hotel">
      <meta itemProp="name" content="Casa Olivea" />

      <header>
        <h1>Casa Olivea</h1>
        <p><em>Donde el huerto es la esencia</em></p>
        <Image src="/images/casa/hero.jpg" alt="Casa Olivea — hospedaje del huerto en Valle de Guadalupe" width={1200} height={630} priority className="ssr-article-hero" />
      </header>

      {/* ── Habitaciones ── */}
      <section id="habitaciones" aria-labelledby="habitaciones-heading">
        <h2 id="habitaciones-heading">Habitaciones</h2>
        <p>Catorce suites — cada una nombrada en honor a una planta o árbol aromático — ofrecen espacio, calidez y una sensación de regreso. Aquí tu ritmo se reinicia.</p>
        <p>Camas king-size, cortinas blackout y texturas de fibras naturales invitan al descanso profundo. Todas las habitaciones están diseñadas para dos adultos — silenciosas, llenas de luz y pensadas con cuidado.</p>
        <p>La luz cambia a lo largo del día. Por la mañana, se filtra suave a través de las cortinas. Por la noche, se asienta — cálida, indirecta, que conecta con la tierra.</p>
      </section>

      {/* ── Diseño ── */}
      <section id="diseno" aria-labelledby="diseno-heading">
        <h2 id="diseno-heading">Diseño que se siente</h2>
        <p><em>Diseño concebido por Ange Joy, fundadora de Olivea.</em></p>
        <p>La luz guía la arquitectura. Por la mañana, suave e indirecta. Por la tarde, cálida y envolvente. Cada superficie evita el reflejo, favoreciendo la calma.</p>
        <p>Usamos piedra, madera, algodón y barro — materiales que envejecen bien y conservan calidez. Nada llama la atención. Todo invita al tacto.</p>
        <p>Agua en vidrio. Amenidades rellenables. Energía solar. La sustentabilidad está integrada — no señalizada.</p>
      </section>

      {/* ── Patio ── */}
      <section id="patio" aria-labelledby="patio-heading">
        <h2 id="patio-heading">Espacios para respirar</h2>
        <p>Inspirado en la naturaleza, el patio se abre en el corazón de la propiedad. Dos pasillos largos conectan tu habitación con el aire libre y el ritmo.</p>
        <p>Una sensación de calma vive en el patio — caminos de grava, plantas aromáticas y una alberca que sigue el ritmo de las estaciones. La luz se filtra con naturalidad. El sonido se asienta suave.</p>
        <p>De la mañana a la noche, el patio mantiene una presencia constante — invitándote a salir o simplemente a hacer una pausa y observar.</p>
      </section>

      {/* ── Mañanas ── */}
      <section id="mananas" aria-labelledby="mananas-heading">
        <h2 id="mananas-heading">Mañanas en Olivea</h2>
        <h3>Desayuno</h3>
        <p>Los huéspedes comienzan el día con un desayuno continental cuidadosamente diseñado por la cocina de Olivea. Pan de casa, verduras de nuestro huerto y una selección de preparaciones locales e internas se sirven con sencillez — frescas, equilibradas y enraizadas en el huerto.</p>
        <p>El servicio de café incluido con el desayuno consiste en un americano o té.</p>
        <h3>Café y Olivea Café</h3>
        <p>Para huéspedes que buscan una experiencia matutina más amplia o expresiva, Olivea Café ofrece un menú de desayuno expandido junto con una selección completa de bebidas de café preparadas. Bebidas a base de espresso, preparaciones especiales y platos adicionales de desayuno están disponibles directamente en el café.</p>
      </section>

      {/* ── Servicios ── */}
      <section id="servicios" aria-labelledby="servicios-heading">
        <h2 id="servicios-heading">Lo esencial, elegido con cuidado</h2>
        <h3>Conectividad</h3>
        <p>Wi-Fi disponible en toda la propiedad, incluyendo habitaciones, patios y la cancha de pádel. Los enchufes están ubicados con cuidado en espacios compartidos y privados.</p>
        <h3>Confort</h3>
        <p>Cortinas blackout, ventilación natural y control de temperatura — cada detalle pensado para proteger tu descanso.</p>
        <h3>Detalles de habitación</h3>
        <p>Agua filtrada en vidrio, amenidades rellenables y nuestro aroma de casa — botánico, equilibrado y discreto.</p>
        <h3>Diseño accesible</h3>
        <p>Todas las habitaciones de Casa Olivea están ubicadas en planta baja, asegurando acceso fácil sin escalones ni cambios de nivel.</p>
        <h3>Conserjería</h3>
        <p>Contáctanos en cualquier momento por WhatsApp o a través de nuestro portal de huéspedes. Con gusto asistimos con reservaciones, transporte o recomendaciones locales.</p>
        <h3>Conexión local</h3>
        <p>¿Buscas un viñedo o un lugar tranquilo para explorar? Compartimos nuestras recomendaciones personales — desde almuerzos de mesa larga hasta rincones escondidos.</p>
      </section>

      {/* ── Info práctica ── */}
      <section id="info-practica" aria-labelledby="info-heading-es">
        <h2 id="info-heading-es">Información de estancia</h2>
        <h3>Check-In / Check-Out</h3>
        <p>Check-in desde las 3:00 pm. Check-out a las 11:00 am.</p>
        <h3>Desayuno e inclusiones</h3>
        <p>El desayuno continental está incluido diariamente para dos personas. Canchas de pádel, acceso a la alberca y limpieza diaria también forman parte de la estancia.</p>
        <h3>Cómo llegar</h3>
        <p>No ofrecemos servicio de transporte al aeropuerto, pero con gusto coordinamos con conductores locales de confianza o te ayudamos a organizar el traslado.</p>
        <h3>Conserjería</h3>
        <p>Escríbenos en cualquier momento por WhatsApp. Asistimos con reservaciones, itinerarios personalizados y sugerencias en Valle de Guadalupe.</p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq-es" aria-labelledby="faq-heading-es">
        <h2 id="faq-heading-es">Antes de reservar</h2>
        <h3>¿El desayuno está incluido?</h3>
        <p>Sí — un desayuno continental de temporada está incluido diariamente para dos personas, diseñado por la cocina de Olivea.</p>
        <h3>¿Aceptan niños o mascotas?</h3>
        <p>Casa Olivea es solo para adultos (18+). Los perros son bienvenidos en áreas designadas.</p>
        <h3>¿Puedo usar las canchas de pádel?</h3>
        <p>Sí — los huéspedes pueden usar las canchas durante horas de luz, hasta el atardecer, con reservación.</p>
        <h3>¿Ofrecen transporte al aeropuerto?</h3>
        <p>Podemos coordinar conductores locales de confianza bajo solicitud.</p>
        <h3>¿Son parte de la Guía Michelin?</h3>
        <p>Casa Olivea aparece en la Guía Michelin, y nuestro restaurante Olivea Farm To Table tiene una Estrella Michelin y una Estrella Verde.</p>
      </section>
    </article>
  );
}
