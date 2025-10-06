export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CAFE_EN: NavSection[] = [
  {
    id: "experiencia",
    title: "Experience",
    subs: [
      { id: "origin", title: "Origin" },
      { id: "bean",   title: "Bean" },
      { id: "roast",  title: "Roast" },
      { id: "water",  title: "Water" },
      { id: "bar",    title: "Bar" },
    ],
  },
  {
    id: "desayuno",
    title: "Breakfast",
    subs: [
      { id: "flavor",      title: "Flavor" },
      { id: "source",      title: "Source" },
      { id: "sustainable", title: "Sustainable" },
      { id: "morning",     title: "Morning" },
    ],
  },
  {
    id: "pan",
    title: "Bread",
    subs: [
      { id: "flours",  title: "Flours" },
      { id: "recipes", title: "Recipes" },
      { id: "bakers",  title: "Bakers" },
      { id: "ritual",  title: "Ritual" },
    ],
  },
  {
    id: "padel",
    title: "Padel",
    subs: [
      { id: "courts", title: "Courts" },
      { id: "lights", title: "Lights" },
      { id: "play",   title: "Play" },
      { id: "life",   title: "Life" },
    ],
  },
  {
    id: "bebidas",
    title: "Drinks",
    subs: [
      { id: "espresso", title: "Espresso" },
      { id: "filter",   title: "Filter" },
      { id: "tea",      title: "Tea" },
      { id: "cold",     title: "Cold" },
    ],
  },
];