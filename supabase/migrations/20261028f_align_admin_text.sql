-- 20261028f_align_admin_text.sql
--
-- Final sweep, Batch A. Several admin records already existed but the site
-- ignored them and showed text written in code; some of those records held
-- different or outdated text (the Press record described "Mesa del Valle",
-- another collective; Philosophy's Google description was an older one; the
-- mobile menu's links were a different set). Before the pages start reading
-- them, this copies what the site shows today into them, so nothing visible
-- changes and the admin becomes the one source.
--
--   global_settings.socials          the 6 accounts the footer and menu show
--   global_settings.organization     + founderId / leaderIds (Google's people,
--                                      from the Team roster)
--   drawer_content.more_links        the menu's 6 "more" links, in order
--   drawer_content.copyright         with {year}, filled at render time
--   press_content.meta / tagline     the Press page's Google text and intro;
--                                      the Mesa del Valle paragraphs are cleared
--   team_content.description         the Team page's description
--   sustainability_content.meta      the Philosophy page's Google text
--
-- Backed up before running (scratchpad backup-batchA-2026-10-28.json).

begin;

update public.global_settings
  set socials = $j$[
  {
    "platform": "youtube",
    "url": "https://www.youtube.com/@GrupoOlivea",
    "label": "YouTube"
  },
  {
    "platform": "instagram",
    "url": "https://instagram.com/oliveafarmtotable/",
    "label": "Instagram"
  },
  {
    "platform": "tiktok",
    "url": "https://www.tiktok.com/@familiaolivea",
    "label": "TikTok"
  },
  {
    "platform": "linkedin",
    "url": "https://www.linkedin.com/company/inmobiliaria-casa-olivea/",
    "label": "LinkedIn"
  },
  {
    "platform": "spotify",
    "url": "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8",
    "label": "Spotify"
  },
  {
    "platform": "pinterest",
    "url": "https://mx.pinterest.com/familiaolivea/",
    "label": "Pinterest"
  }
]$j$::jsonb,
      organization = organization || $j${
  "founderId": "ange",
  "leaderIds": [
    "adrianarose",
    "danielnates"
  ]
}$j$::jsonb
  where id = 'singleton';

update public.drawer_content
  set more_links = $j$[
  {
    "id": "nav-press",
    "href": "/press",
    "label": {
      "es": "Prensa",
      "en": "Press"
    },
    "section": "more",
    "visible": true,
    "sortOrder": 0
  },
  {
    "id": "nav-sustainability",
    "href": "/sustainability",
    "label": {
      "es": "Filosofía",
      "en": "Philosophy"
    },
    "section": "more",
    "visible": true,
    "sortOrder": 1
  },
  {
    "id": "nav-journal",
    "href": "/journal",
    "label": {
      "es": "Cuaderno",
      "en": "Journal"
    },
    "section": "more",
    "visible": true,
    "sortOrder": 2
  },
  {
    "id": "nav-team",
    "href": "/team",
    "label": {
      "es": "Equipo",
      "en": "Team"
    },
    "section": "more",
    "visible": true,
    "sortOrder": 3
  },
  {
    "id": "nav-contact",
    "href": "/contact",
    "label": {
      "es": "Contáctanos",
      "en": "Contact"
    },
    "section": "more",
    "visible": true,
    "sortOrder": 4
  },
  {
    "id": "nav-careers",
    "href": "/carreras",
    "label": {
      "es": "Carreras",
      "en": "Careers"
    },
    "section": "more",
    "visible": true,
    "sortOrder": 5
  }
]$j$::jsonb,
      copyright = $j${
  "es": "© {year} Inmobiliaria MYA by DH. Todos los derechos reservados.",
  "en": "© {year} Inmobiliaria MYA by DH. All rights reserved."
}$j$::jsonb
  where id = 'singleton';

update public.press_content
  set meta = coalesce(meta, '{}'::jsonb) || $j${
  "title": {
    "es": "Prensa | OLIVEA",
    "en": "Press | OLIVEA"
  },
  "description": {
    "es": "Reconocimientos, menciones en medios y recursos oficiales de prensa de Olivea — hospitalidad del huerto, restaurante con estrella MICHELIN y hospedaje en Valle de Guadalupe.",
    "en": "Awards, media coverage, and official press resources for Olivea — farm hospitality, MICHELIN-starred restaurant, and farm stay in Valle de Guadalupe."
  }
}$j$::jsonb,
      tagline = $j${
  "es": "Reconocimientos, menciones en medios y recursos de prensa de Olivea — hospitalidad del huerto, restaurante con estrella MICHELIN y hospedaje en Valle de Guadalupe.",
  "en": "Awards, media coverage, and press resources for Olivea — farm hospitality, MICHELIN-starred restaurant, and farm stay in Valle de Guadalupe."
}$j$::jsonb,
      description = '[]'::jsonb
  where id = 'singleton';

update public.team_content
  set description = $j${
  "es": "Nuestra historia, filosofía y las personas detrás de la visión.",
  "en": "Farm-to-table hospitality in Valle de Guadalupe—our story, philosophy, and the people behind the vision."
}$j$::jsonb
  where id = 'singleton';

update public.sustainability_content
  set meta = coalesce(meta, '{}'::jsonb) || $j${
  "title": {
    "es": "Filosofía | OLIVEA",
    "en": "Philosophy | OLIVEA"
  },
  "description": {
    "es": "Por qué Olivea se llama Olivea — del latín oliva, el olivo — y la filosofía detrás: origen, identidad, eficiencia, innovación, gastronomía y comunidad en Valle de Guadalupe, del huerto a la mesa.",
    "en": "Why Olivea is called Olivea — from the Latin oliva, the olive — and the philosophy behind it: origins, identity, efficiency, innovation, gastronomy, and community in Valle de Guadalupe, from garden to table."
  }
}$j$::jsonb
  where id = 'singleton';

commit;
