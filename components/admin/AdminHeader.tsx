"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useAdminLocale, type B } from "@/lib/admin/i18n";

const pageTitles: Record<string, B> = {
  // Main sections
  "/admin": { es: "Panel", en: "Dashboard" },
  "/admin/menu": { es: "Menús y Enlaces", en: "Menus & Links" },
  "/admin/press": { es: "Prensa y Reconocimientos", en: "Press Coverage" },
  "/admin/audit-log": { es: "Registro de Cambios", en: "Audit Log" },
  "/admin/secure-docs": { es: "Documentos Seguros", en: "Secure Documents" },
  "/admin/journal": { es: "Cuaderno", en: "Journal" },
  "/admin/media": { es: "Biblioteca de Medios", en: "Media Library" },
  "/admin/hours": { es: "Horarios y Disponibilidad", en: "Hours & Availability" },
  "/admin/team": { es: "Equipo", en: "Team" },
  "/admin/banners": { es: "Banners", en: "Banners" },
  "/admin/popups": { es: "Anuncios Emergentes", en: "Popups" },
  // Hub pages
  "/admin/pages": { es: "Páginas", en: "Pages" },
  "/admin/content-hub": { es: "Contenido", en: "Content" },
  "/admin/site-settings": { es: "Configuración", en: "Settings" },
  // Content editors
  "/admin/content/homepage": { es: "Página de Inicio", en: "Homepage" },
  "/admin/content/farm-to-table": { es: "Farm to Table", en: "Farm to Table" },
  "/admin/content/casa": { es: "Casa", en: "Casa" },
  "/admin/content/cafe": { es: "Café", en: "Café" },
  "/admin/content/contact": { es: "Contacto", en: "Contact" },
  "/admin/content/sustainability": { es: "Filosofía", en: "Sustainability" },
  "/admin/content/press": { es: "Página de Prensa", en: "Press" },
  "/admin/content/careers": { es: "Trabaja con Nosotros", en: "Careers" },
  "/admin/content/legal": { es: "Legal", en: "Legal" },
  "/admin/content/team": { es: "Página del Equipo", en: "Team Page" },
  "/admin/content/not-found": { es: "Página 404", en: "404 Page" },
  "/admin/content/casa-faq": { es: "Preguntas de Casa", en: "Casa FAQ" },
  "/admin/content/drawer": { es: "Navegación", en: "Navigation" },
  "/admin/content/footer": { es: "Pie de Página", en: "Footer" },
  "/admin/content/global": { es: "Configuración Global", en: "Global Settings" },
  "/admin/content/innovation": { es: "Innovación", en: "Innovation" },
  "/admin/content/roseiies": { es: "roseiies", en: "roseiies" },
};

const pageDescriptions: Record<string, B> = {
  "/admin": { es: "Bienvenida de vuelta. Esto es lo que está pasando.", en: "Welcome back. Here’s what’s happening." },
  "/admin/menu": { es: "Los menús en vivo — edita enlaces sin necesidad de un deploy.", en: "The live menu embeds — edit links without a deploy." },
  "/admin/press": { es: "Premios y menciones en la página pública de prensa.", en: "Awards & mentions on the public press page." },
  "/admin/audit-log": { es: "Quién editó qué, y cuándo.", en: "Who edited what, and when." },
  "/admin/secure-docs": { es: "Gestiona documentos seguros y revisa accesos.", en: "Manage secure documents and review access." },
  "/admin/journal": { es: "Historias desde el huerto.", en: "Stories from the garden." },
  "/admin/media": { es: "Sube y administra imágenes.", en: "Upload and manage images." },
  "/admin/hours": { es: "Horarios de operación y cierres especiales.", en: "Operating hours and special closures." },
  "/admin/team": { es: "Administra miembros del equipo y sus permisos.", en: "Manage team members and roles." },
  "/admin/banners": { es: "Banners promocionales en todo el sitio.", en: "Promotional banners across the site." },
  "/admin/popups": { es: "Anuncios emergentes del sitio.", en: "Site popup announcements." },
  "/admin/pages": { es: "Edita textos e imágenes de todo el sitio.", en: "Edit text and images across the site." },
  "/admin/content-hub": { es: "Cuaderno, anuncios, banners, preguntas y medios.", en: "Journal, popups, banners, FAQ, and media." },
  "/admin/site-settings": { es: "Configuración global, navegación y pie de página.", en: "Global settings, navigation, and footer." },
  "/admin/content/homepage": { es: "Video principal y contenido del inicio.", en: "Hero video and homepage content." },
  "/admin/content/farm-to-table": { es: "Contenido de la página del restaurante.", en: "Restaurant page content." },
  "/admin/content/casa": { es: "Contenido de la página del hospedaje.", en: "Farm stay page content." },
  "/admin/content/cafe": { es: "Contenido de la página del café.", en: "Café page content." },
  "/admin/content/contact": { es: "Información de contacto y formulario.", en: "Contact info and form settings." },
  "/admin/content/sustainability": { es: "Página de filosofía y sostenibilidad.", en: "Sustainability page." },
  "/admin/content/press": { es: "Textos de la página de prensa.", en: "Press features and mentions." },
  "/admin/content/careers": { es: "Vacantes y página de carreras.", en: "Job openings and careers page." },
  "/admin/content/legal": { es: "Aviso de privacidad y términos.", en: "Privacy policy and terms." },
  "/admin/content/team": { es: "Página pública del equipo.", en: "Team members page." },
  "/admin/content/not-found": { es: "Página personalizada de no encontrado.", en: "Custom not-found page." },
  "/admin/content/casa-faq": { es: "Preguntas frecuentes de Casa.", en: "Frequently asked questions for Casa." },
  "/admin/content/drawer": { es: "Enlaces del menú de navegación principal.", en: "Main navigation drawer links." },
  "/admin/content/footer": { es: "Contenido y enlaces del pie de página.", en: "Footer content and links." },
  "/admin/content/global": { es: "Configuración y valores de todo el sitio.", en: "Site-wide settings and defaults." },
  "/admin/content/innovation": { es: "Contenido de la página de innovación.", en: "The innovation page content." },
  "/admin/content/roseiies": { es: "Contenido de la página del estudio roseiies.", en: "The roseiies studio page content." },
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { t } = useAdminLocale();
  const title = pageTitles[pathname];
  const description = pageDescriptions[pathname];

  return (
    <header className="
      sticky top-0 z-30
      flex items-center justify-between px-8 py-5
      border-b border-[var(--olivea-olive)]/[0.06]
      bg-white/40 backdrop-blur-xl
    ">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="text-xl font-semibold text-[var(--olivea-ink)]">
          {title ? t(title) : "Admin"}
        </h1>
        {description && (
          <p className="text-sm text-[var(--olivea-clay)] mt-0.5">{t(description)}</p>
        )}
      </motion.div>

      <div className="flex items-center gap-2">
        {/* EN VIVO — live site preview */}
        <a
          href="https://oliveafarmtotable.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            group flex items-center gap-2 px-3.5 py-2 rounded-xl
            text-xs font-medium
            text-[var(--olivea-olive)] hover:text-[var(--olivea-ink)]
            bg-white/50 hover:bg-white/80
            border border-[var(--olivea-olive)]/[0.06] hover:border-[var(--olivea-olive)]/10
            transition-all duration-200
          "
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">EN VIVO</span>
          <ExternalLink size={11} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* NOTE: the previous "Add new" and notification-bell buttons were
            removed — they had no click handlers (dead affordances). Add-new
            lives inside each editor; re-add a bell only with a real inbox. */}
      </div>
    </header>
  );
}
