// Srozumitelné české hlášky k chybám Firebase Authentication.
const AUTH_ERR = {
  "auth/invalid-credential": "Špatný e-mail nebo heslo.",
  "auth/wrong-password": "Špatný e-mail nebo heslo.",
  "auth/user-not-found": "Špatný e-mail nebo heslo.",
  "auth/invalid-email": "Zkontrolujte prosím tvar e-mailu.",
  "auth/weak-password": "Heslo musí mít aspoň 6 znaků.",
  "auth/email-already-in-use": "Pro tenhle e-mail už účet existuje. Přihlaste se.",
  "auth/too-many-requests": "Příliš mnoho pokusů, zkuste to prosím za chvíli.",
  "auth/network-request-failed": "Chybí připojení k internetu.",
  "auth/unauthorized-domain": "Tahle adresa webu není ve Firebase povolená (Authentication → Settings → Authorized domains).",
  "auth/operation-not-allowed": "Přihlášení e-mailem není ve Firebase zapnuté (Authentication → Sign-in method).",
};
export const authMsg = (e) => AUTH_ERR[e?.code] || `Něco se nepovedlo, zkuste to prosím znovu. (${e?.code || e?.message})`;
