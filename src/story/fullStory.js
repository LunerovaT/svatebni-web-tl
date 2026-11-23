import { INTRO_SCENES } from "./intro.js";
import { SUSPECT_SCENES } from "./suspectsIntro.js";
import { STATION_STORY } from "./stationStory.js";

// Testovací přehrání celého příběhu v kuse (jen v testovacím režimu): úvod → podezřelí → intra a outra stanovišť 1–4.
export const FULL_STORY_SCENES = [...INTRO_SCENES, ...SUSPECT_SCENES, ...["s01", "s02", "s03", "s04"].flatMap((id) => [STATION_STORY[id].intro, STATION_STORY[id].outro])];
