import { useEffect, useState } from "react";

// Jednoduché routování přes # v URL: vrací [aktuální stránka, go(id)].
export default function useHashRoute() {
  const [page, setPage] = useState(() => location.hash.replace("#/", "") || "home");
  useEffect(() => {
    const onHash = () => setPage(location.hash.replace("#/", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (id) => {
    location.hash = "#/" + (id === "home" ? "" : id);
    setPage(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return [page, go];
}
