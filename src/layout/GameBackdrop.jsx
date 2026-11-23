import deskInk from "../assets/ev/ink.webp";
import deskBooks from "../assets/ev/books.webp";
import deskLamp from "../assets/ht/lamp.webp";
import deskTag from "../assets/ht/tag.webp";
import deskPostcard from "../assets/ht/postcard.webp";

// Pozadí herních obrazovek: tmavý stůl s předměty (jen dekorace).
export default function GameBackdrop() {
  return (
  <div className="game-bg-fixed"><div className="grain" />
    <img className="game-decor hide-sm" src={deskLamp} alt="" style={{ top: "-7vh", left: "-3vw", height: "44vh", transform: "rotate(8deg)" }} />
    <img className="game-decor hide-sm" src={deskPostcard} alt="" style={{ bottom: "-6vh", left: "6vw", height: "24vh", transform: "rotate(9deg)", opacity: 0.9 }} />
    <img className="game-decor hide-sm" src={deskInk} alt="" style={{ top: "14vh", left: "2vw", width: "7vw", opacity: 0.95 }} />
    <img className="game-decor hide-sm" src={deskBooks} alt="" style={{ bottom: "-4vh", right: "12vw", width: "20vw", opacity: 0.95 }} />
    <img className="game-decor hide-sm" src={deskTag} alt="" style={{ bottom: "-5vh", right: "-2vw", height: "20vh", transform: "rotate(-18deg)", opacity: 0.85 }} />
  </div>
  );
}
