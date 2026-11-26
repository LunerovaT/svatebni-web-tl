// Lehká metadata stanovišť pro hlavní část webu (bez textů úloh a řešení, ty se načítají až ve hře).
// POZOR: STATION_COUNT musí odpovídat počtu stanovišť v stations.js (kontroluje se při npm run dev a v testech).
export const STATION_COUNT = 5;
export const FINAL_REQUIRES = STATION_COUNT; // všech 5 indicií
export const doneCountOf = (doneMap = {}) => Array.from({ length: STATION_COUNT }, (_, i) => i).filter((i) => doneMap[i]).length;
