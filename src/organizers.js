// E-maily organizátorů (administrace, úkoly, přehled odpovědí).
// POZOR: stejný seznam musí být i ve firestore.rules (funkce isOrganizer). Tohle je jen pro to,
// aby se cizímu přihlášenému účtu místo rozbité stránky ukázala srozumitelná hláška.
const ORGANIZER_EMAILS = [
  "tereza.luner@gmail.com",
  "lunerova.tereza@seznam.cz",
  "lukassnopek113@gmail.com",
];

export const isOrganizerEmail = (email) =>
  !!email && ORGANIZER_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
