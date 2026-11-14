// Všechny důkazy případu na jednom místě: Důkaz 01 z domácího úkolu + důkazy ze stanovišť.
import { STATIONS } from "../stations/stations.js";
import { STORY as HT } from "../hometask/config.js";
import ticketImg from "../assets/ht/ticket_qm.webp";
import { docSrc, docIsWide, evTitle } from "../stations/docImages.js";

const ms = (t) => (t?.toMillis ? t.toMillis() : typeof t === "number" ? t : null);

// members = hráči týmu (kvůli Důkazu 01, který řeší každý doma sám)
export function collectEvidence({ team, members = [], player }) {
  const people = members.length ? members : player ? [player] : [];
  const homeSolvers = people.filter((p) => p.homeClueSolved);
  const first = homeSolvers
    .map((p) => ({ p, at: ms(p.homeTask?.solvedAt) }))
    .sort((a, b) => (a.at ?? Infinity) - (b.at ?? Infinity))[0];
  const list = [{
    id: "e01", number: "01", source: "Domácí úkol",
    title: "Palubní lístek R.M.S. Queen Mary", image: ticketImg, wide: true,
    found: homeSolvers.length > 0, foundBy: first?.p?.name || null, foundAt: first?.at ?? null,
    text: `${HT.file.finding} Lístek na jméno Eliška Vránová, kajuta C-07, nesl neviditelným inkoustem zašifrovanou zprávu.`,
    question: "Kdo z pěti hostů přišel do sídla bez pozvání?",
    summary: HT.file.finding,
  }];
  STATIONS.forEach((s, i) => {
    const ev = s.evidence;
    const done = !!team?.stationsDone?.[i];
    list.push({
      id: `s${i}`, stationIndex: i, number: ev?.number || String(i + 2).padStart(2, "0"),
      source: `Stanoviště ${i + 1}`,
      title: ev ? evTitle(ev) : done ? `Stopa ze stanoviště ${i + 1}` : "Zatím nenalezeno",
      image: ev ? docSrc(ev) : null, wide: docIsWide(ev),
      found: done, foundBy: team?.stationsSolvedBy?.[i] || null, foundAt: ms(team?.stationsSolvedAt?.[i]),
      text: ev?.text || (done ? "Obsah tohoto důkazu ještě připravujeme." : ""), question: ev?.question || "",
      summary: ev?.summary || (done ? `Stopa ze stanoviště ${i + 1} (obsah připravujeme).` : ""), label: ev?.label,
    });
  });
  return list;
}
