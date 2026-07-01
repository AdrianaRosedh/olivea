// lib/content/data/legal.ts

import type { LegalContent } from "../types";

const section = (
  slug: string,
  sortOrder: number,
  title: { es: string; en: string },
  body: { es: string; en: string },
) => ({ id: `legal-${slug}`, page: "legal", slug, title, body, sortOrder });

const legal: LegalContent = {
  meta: {
    title: {
      es: "Privacidad y Términos | OLIVEA",
      en: "Privacy & Terms | OLIVEA",
    },
    description: {
      es: "Aviso de Privacidad y Términos y Condiciones de Casa Olivea A.C. — Olivea Farm To Table, Casa Olivea y Olivea Café en Valle de Guadalupe.",
      en: "Privacy Notice and Terms & Conditions of Casa Olivea A.C. — Olivea Farm To Table, Casa Olivea and Olivea Café in Valle de Guadalupe.",
    },
    ogImage: "/images/seo/seo-og.jpg",
    keywords: ["aviso de privacidad", "privacy", "términos", "terms", "hospedaje", "PROFECO", "ARCO", "Olivea", "Casa Olivea"],
  },
  title: {
    es: "Privacidad y Términos",
    en: "Privacy & Terms",
  },
  description: {
    es: "Aviso de Privacidad y Términos y Condiciones de Casa Olivea A.C. · Última actualización: 29 de junio de 2026.",
    en: "Privacy Notice and Terms & Conditions of Casa Olivea A.C. · Last updated: June 29, 2026.",
  },
  sections: [
    // ─────────────── PRIVACY (Aviso de Privacidad) ───────────────
    section("privacidad", 0,
      { es: "Aviso de Privacidad", en: "Privacy Notice" },
      { es: "", en: "" }),

    section("responsable", 1,
      { es: "1. Responsable de tus datos", en: "1. Who is responsible for your data" },
      {
        es: `Casa Olivea A.C. («Olivea», «nosotros») es responsable del tratamiento de tus datos personales, conforme a la legislación mexicana de protección de datos personales en posesión de los particulares vigente (incluida la reforma de 2025) y demás normativa aplicable.

Domicilio: Carretera Ensenada–Tecate Km 92.5, Villa de Juárez, Ensenada, Baja California, C.P. 22766, México.
Contacto en materia de privacidad: hola@casaolivea.com · +52 646 388 2369.`,
        en: `Casa Olivea A.C. ("Olivea," "we," "us") is responsible for the processing of your personal data, in accordance with Mexico's current law on the protection of personal data held by private parties (including the 2025 reform) and other applicable rules.

Address: Carretera Ensenada–Tecate Km 92.5, Villa de Juárez, Ensenada, Baja California, 22766, Mexico.
Privacy contact: hola@casaolivea.com · +52 646 388 2369.`,
      }),

    section("datos", 2,
      { es: "2. Qué datos recabamos", en: "2. What data we collect" },
      {
        es: `Recabamos los datos que nos proporcionas y los que se generan al usar el sitio:

•  Identificación y contacto: nombre, correo electrónico y teléfono.
•  Reservaciones: fecha, número de comensales, preferencias y peticiones especiales (las reservaciones del restaurante se realizan a través de OpenTable).
•  Comunicaciones: los mensajes que nos envías y tu suscripción al boletín, si la solicitas.
•  Datos de navegación: dirección IP, tipo de dispositivo y navegador, y páginas visitadas, mediante cookies y herramientas de analítica.

No recabamos datos personales sensibles. Los datos de pago son procesados directamente por nuestros proveedores (por ejemplo, la plataforma de reservaciones); Olivea no almacena los números completos de tarjetas.`,
        en: `We collect the data you give us and the data generated when you use the site:

•  Identification and contact: name, email, and phone number.
•  Reservations: date, party size, preferences, and special requests (restaurant reservations are made through OpenTable).
•  Communications: the messages you send us and your newsletter subscription, if requested.
•  Browsing data: IP address, device and browser type, and pages visited, via cookies and analytics tools.

We do not collect sensitive personal data. Payment data is processed directly by our providers (for example, the reservations platform); Olivea does not store full card numbers.`,
      }),

    section("huespedes", 3,
      { es: "3. Huéspedes de Casa Olivea (hospedaje)", en: "3. Casa Olivea guests (lodging)" },
      {
        es: `Si te hospedas en Casa Olivea, por obligación legal y de seguridad recabamos datos adicionales:

•  Una identificación oficial vigente al registrar tu llegada (check-in) y los datos del registro de huéspedes: nombre, domicilio, fechas de entrada y salida y, en su caso, datos de acompañantes y de vehículo.
•  Imágenes de videovigilancia (CCTV) en áreas comunes, con fines de seguridad.

Conservamos el registro de huéspedes y los comprobantes durante el plazo que exige la normativa de hospedaje aplicable (al menos un año) y las grabaciones de videovigilancia por el periodo aplicable (alrededor de 90 días). Podemos compartir estos datos con autoridades competentes cuando la ley lo requiera. Aplicamos medidas de seguridad administrativas, técnicas y físicas para protegerlos.`,
        en: `If you stay at Casa Olivea, by legal and security obligation we collect additional data:

•  A valid official ID at check-in and the guest-registry data: name, address, entry and exit dates, and where applicable companion and vehicle details.
•  CCTV footage in common areas, for security purposes.

We keep the guest registry and records for the period required by applicable lodging rules (at least one year) and CCTV recordings for the applicable period (around 90 days). We may share this data with competent authorities when the law requires it. We apply administrative, technical, and physical security measures to protect it.`,
      }),

    section("finalidades", 4,
      { es: "4. Para qué usamos tus datos", en: "4. How we use your data" },
      {
        es: `Finalidades primarias (necesarias para brindarte el servicio):
•  Gestionar y confirmar tus reservaciones, tu hospedaje y tus solicitudes.
•  Atender tus dudas, comentarios y peticiones.
•  Cumplir con obligaciones legales, fiscales y de seguridad.

Finalidades secundarias (puedes oponerte sin que afecte el servicio):
•  Enviarte nuestro boletín, novedades y promociones.
•  Realizar analítica para mejorar el sitio y la experiencia.

Si no deseas que tus datos se usen para las finalidades secundarias, escríbenos a hola@casaolivea.com.`,
        en: `Primary purposes (necessary to provide the service):
•  Manage and confirm your reservations, your stay, and your requests.
•  Respond to your questions, comments, and requests.
•  Comply with legal, tax, and security obligations.

Secondary purposes (you may opt out without affecting the service):
•  Send you our newsletter, news, and promotions.
•  Perform analytics to improve the site and your experience.

If you do not want your data used for the secondary purposes, email us at hola@casaolivea.com.`,
      }),

    section("transferencias", 5,
      { es: "5. Con quién compartimos tus datos", en: "5. Who we share your data with" },
      {
        es: `Para operar, compartimos datos con proveedores que nos prestan servicios, únicamente para los fines descritos:
•  Plataforma de reservaciones (OpenTable).
•  Proveedores de correo electrónico y boletín.
•  Desarrollo y operación técnica del sitio (roseiies).
•  Hospedaje del sitio web y analítica (Vercel).
•  Mapas y ubicación (Google).

Estos proveedores actúan como encargados y solo tratan los datos según nuestras instrucciones. Algunos se encuentran fuera de México (por ejemplo, en Estados Unidos); en esos casos requerimos que protejan tus datos con un nivel equivalente al de este aviso. No vendemos tus datos personales. Podemos divulgarlos cuando lo exija la ley o una autoridad competente.`,
        en: `To operate, we share data with providers who serve us, solely for the purposes described:
•  Reservations platform (OpenTable).
•  Email and newsletter providers.
•  Website development and technical operation (roseiies).
•  Website hosting and analytics (Vercel).
•  Maps and location (Google).

These providers act as processors and handle data only on our instructions. Some are located outside Mexico (for example, in the United States); in those cases we require them to protect your data at a level equivalent to this notice. We do not sell your personal data. We may disclose it when required by law or a competent authority.`,
      }),

    section("conservacion", 6,
      { es: "6. Conservación de tus datos", en: "6. Data retention" },
      {
        es: `Conservamos tus datos personales únicamente durante el tiempo necesario para cumplir las finalidades para las que se recabaron y las obligaciones legales, fiscales y de seguridad aplicables. Cuando dejan de ser necesarios, los eliminamos o anonimizamos de forma segura. Para el hospedaje aplican los plazos descritos en la sección de huéspedes.`,
        en: `We keep your personal data only for as long as needed to fulfill the purposes for which it was collected and the applicable legal, tax, and security obligations. When it is no longer needed, we securely delete or anonymize it. For lodging, the periods described in the guests section apply.`,
      }),

    section("derechos-arco", 7,
      { es: "7. Tus derechos ARCO", en: "7. Your ARCO rights" },
      {
        es: `Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (derechos ARCO) al tratamiento de tus datos, así como a revocar tu consentimiento o limitar su uso y divulgación.

Para ejercerlos, envía tu solicitud a hola@casaolivea.com indicando tu nombre y medio de contacto, el derecho que deseas ejercer y una identificación que acredite tu titularidad. El ejercicio de estos derechos es gratuito; solo podríamos cobrar los costos justificados de reproducción o envío. Responderemos en los plazos que marca la ley. Si no quedas conforme, puedes acudir a la autoridad competente en materia de protección de datos personales.`,
        en: `You have the right to Access, Rectify, Cancel, or Object (ARCO rights) to the processing of your data, and to revoke your consent or limit its use and disclosure.

To exercise them, send your request to hola@casaolivea.com stating your name and contact method, the right you wish to exercise, and identification proving you are the data owner. Exercising these rights is free; we may only charge justified reproduction or shipping costs. We will respond within the timeframes required by law. If you are not satisfied, you may turn to the competent data-protection authority.`,
      }),

    section("internacional", 8,
      { es: "8. Visitantes internacionales", en: "8. International visitors" },
      {
        es: `Operamos desde México, pero recibimos visitantes de todo el mundo. Si nos contactas desde la Unión Europea, el Reino Unido o California, podrías tener derechos adicionales bajo la normativa de tu jurisdicción (por ejemplo, GDPR o CCPA/CPRA), como el acceso, la portabilidad o la eliminación de tus datos. Para ejercerlos, escríbenos a hola@casaolivea.com y atenderemos tu solicitud conforme a la ley aplicable.`,
        en: `We operate from Mexico but welcome visitors worldwide. If you contact us from the European Union, the United Kingdom, or California, you may have additional rights under your jurisdiction's rules (for example, GDPR or CCPA/CPRA), such as access, portability, or deletion of your data. To exercise them, email hola@casaolivea.com and we will handle your request under applicable law.`,
      }),

    section("cookies", 9,
      { es: "9. Cookies y analítica", en: "9. Cookies and analytics" },
      {
        es: `Usamos cookies y tecnologías similares para que el sitio funcione (por ejemplo, recordar tu idioma) y para entender de forma agregada cómo se usa (analítica). Puedes deshabilitar las cookies desde la configuración de tu navegador; algunas funciones podrían no operar correctamente.`,
        en: `We use cookies and similar technologies to make the site work (for example, remembering your language) and to understand, in aggregate, how it is used (analytics). You can disable cookies in your browser settings; some features may not work correctly.`,
      }),

    section("cambios-privacidad", 10,
      { es: "10. Cambios a este aviso", en: "10. Changes to this notice" },
      {
        es: `Podemos actualizar este Aviso de Privacidad para reflejar cambios legales u operativos. La versión vigente siempre estará disponible en esta página, con su fecha de actualización; los cambios sustanciales no se aplicarán de forma retroactiva en tu perjuicio.`,
        en: `We may update this Privacy Notice to reflect legal or operational changes. The current version will always be available on this page, with its update date; material changes will not apply retroactively to your detriment.`,
      }),

    // ─────────────── TERMS (Términos y Condiciones) ───────────────
    section("terminos", 11,
      { es: "Términos y Condiciones", en: "Terms & Conditions" },
      { es: "", en: "" }),

    section("aceptacion", 12,
      { es: "1. Aceptación", en: "1. Acceptance" },
      {
        es: `Al acceder y usar oliveafarmtotable.com (el «Sitio») aceptas estos Términos y Condiciones. Si no estás de acuerdo, te pedimos no utilizar el Sitio.`,
        en: `By accessing and using oliveafarmtotable.com (the "Site") you accept these Terms and Conditions. If you do not agree, please do not use the Site.`,
      }),

    section("uso", 13,
      { es: "2. Uso del sitio", en: "2. Use of the site" },
      {
        es: `El Sitio y su contenido se ofrecen con fines informativos y para facilitar reservaciones y contacto. Te comprometes a usarlo de forma lícita y a no interferir con su funcionamiento, seguridad o disponibilidad.`,
        en: `The Site and its content are provided for informational purposes and to facilitate reservations and contact. You agree to use it lawfully and not to interfere with its operation, security, or availability.`,
      }),

    section("reservaciones", 14,
      { es: "3. Reservaciones y hospedaje", en: "3. Reservations and lodging" },
      {
        es: `Las reservaciones del restaurante se gestionan a través de OpenTable y están sujetas a disponibilidad y confirmación. Antes de confirmar, se te informan los precios, el costo total y las políticas de cancelación, cambios o depósito que apliquen. El hospedaje en Casa Olivea se reserva por los canales señalados en el Sitio y se rige por el contrato de prestación de servicios de hospedaje correspondiente.`,
        en: `Restaurant reservations are managed through OpenTable and are subject to availability and confirmation. Before you confirm, you are informed of prices, the total cost, and any cancellation, change, or deposit policies that apply. Stays at Casa Olivea are booked through the channels indicated on the Site and are governed by the applicable lodging service contract.`,
      }),

    section("consumidor", 15,
      { es: "4. Derechos del consumidor (PROFECO)", en: "4. Consumer rights (PROFECO)" },
      {
        es: `Como negocio de hospitalidad en México, nuestros servicios de restaurante y hospedaje están sujetos a la Ley Federal de Protección al Consumidor y a la supervisión de la PROFECO. Te informamos de forma clara los precios y el costo total antes de contratar, sin cláusulas abusivas. El servicio de hospedaje se documenta mediante el contrato de adhesión correspondiente. Puedes presentar dudas o quejas ante la PROFECO.`,
        en: `As a hospitality business in Mexico, our restaurant and lodging services are subject to the Federal Consumer Protection Law and PROFECO oversight. We clearly inform you of prices and total cost before you contract, with no abusive clauses. Lodging is documented through the applicable adhesion contract. You may raise questions or complaints with PROFECO.`,
      }),

    section("propiedad-intelectual", 16,
      { es: "5. Propiedad intelectual", en: "5. Intellectual property" },
      {
        es: `Los textos, imágenes, diseño, marcas y logotipos —incluyendo «Olivea», «Olivea Farm To Table», «Casa Olivea» y «Olivea Café»— son propiedad de Casa Olivea A.C. o se utilizan con autorización. Las referencias a la Guía MICHELIN y otras marcas pertenecen a sus respectivos titulares. No está permitido reproducirlos sin autorización previa por escrito.`,
        en: `The texts, images, design, trademarks, and logos —including "Olivea," "Olivea Farm To Table," "Casa Olivea," and "Olivea Café"— are the property of Casa Olivea A.C. or used with permission. References to the MICHELIN Guide and other trademarks belong to their respective owners. They may not be reproduced without prior written authorization.`,
      }),

    section("enlaces", 17,
      { es: "6. Enlaces de terceros", en: "6. Third-party links" },
      {
        es: `El Sitio puede enlazar a servicios de terceros (por ejemplo, OpenTable, redes sociales y Google Maps). No controlamos ni somos responsables de sus contenidos, prácticas o políticas; te recomendamos revisar sus términos y avisos.`,
        en: `The Site may link to third-party services (for example, OpenTable, social media, and Google Maps). We do not control and are not responsible for their content, practices, or policies; we recommend reviewing their terms and notices.`,
      }),

    section("responsabilidad", 18,
      { es: "7. Limitación de responsabilidad", en: "7. Limitation of liability" },
      {
        es: `Procuramos que la información del Sitio sea correcta y esté actualizada, pero se ofrece «tal cual», sin garantía de que esté libre de errores o interrupciones. En la medida que lo permita la ley aplicable, Casa Olivea A.C. no será responsable por daños o perjuicios derivados del uso del Sitio.`,
        en: `We strive to keep the Site's information accurate and current, but it is provided "as is," without warranty that it is free of errors or interruptions. To the extent permitted by applicable law, Casa Olivea A.C. shall not be liable for any damages arising from use of the Site.`,
      }),

    section("ley-aplicable", 19,
      { es: "8. Ley aplicable y jurisdicción", en: "8. Governing law and jurisdiction" },
      {
        es: `Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de Ensenada, Baja California, sin perjuicio de los derechos que la ley reconoce a los consumidores.`,
        en: `These Terms are governed by the laws of the United Mexican States. For any dispute, the parties submit to the jurisdiction of the competent courts of Ensenada, Baja California, without prejudice to the rights that the law grants to consumers.`,
      }),

    section("contacto", 20,
      { es: "Contacto", en: "Contact" },
      {
        es: `¿Dudas sobre privacidad o estos términos? Escríbenos:
Casa Olivea A.C. · Carretera Ensenada–Tecate Km 92.5, Villa de Juárez, Ensenada, Baja California, C.P. 22766, México.
hola@casaolivea.com · +52 646 388 2369.`,
        en: `Questions about privacy or these terms? Contact us:
Casa Olivea A.C. · Carretera Ensenada–Tecate Km 92.5, Villa de Juárez, Ensenada, Baja California, 22766, Mexico.
hola@casaolivea.com · +52 646 388 2369.`,
      }),
  ],
};

export default legal;
