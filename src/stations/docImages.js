// Obrázky dokumentů důkazů – klíč v stations.js (evidence.docImage) → obrázek. Používá karta důkazu i sbírka ve spisu.
import defaultDoc from "../assets/ev/doc_02.webp";
import doc03 from "../assets/ev/doc_03.webp";
import doc04 from "../assets/ev/doc_04.webp";
import doc05 from "../assets/ev/doc_05.webp";

export const DOC_IMAGES = { statement: doc03, letter: doc04, timeline: doc05 };
export const docSrc = (ev) => DOC_IMAGES[ev?.docImage] || ev?.docImage || defaultDoc;
export const docIsWide = (ev) => ev?.docImage === "statement";
export const evTitle = (ev) => ev?.displayTitle || (ev ? ev.title.charAt(0) + ev.title.slice(1).toLocaleLowerCase("cs") : "");
