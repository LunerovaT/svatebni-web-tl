// Údaje o místě a termínu na jednom místě (používá web, patička i odpočet).
export const VENUE = {
  name: "Opajda",
  web: "https://www.opajda.cz/",
  street: "Horní Rožínka 4",
  zip: "592 51",
  town: "Dolní Rožínka",
  region: "Vysočina",
  lat: 49.499455,
  lng: 16.193394,
};
VENUE.address = `${VENUE.street}, ${VENUE.zip} ${VENUE.town}`;
VENUE.addressFull = `${VENUE.address}, kraj ${VENUE.region}`;
VENUE.googleMaps = `https://www.google.com/maps/search/?api=1&query=${VENUE.lat},${VENUE.lng}`;
VENUE.mapyCz = `https://mapy.cz/zakladni?x=${VENUE.lng}&y=${VENUE.lat}&z=17&source=coor&id=${VENUE.lng}%2C${VENUE.lat}`;

export const DATES = {
  label: "31. 7. – 1. 8. 2027",
  long: "31. července – 1. srpna 2027",
  start: "2027-07-31T00:00:00+02:00", // odpočet: den svatby (sobota)
  rentEnd: "1. 8. 2027 v 12:00",
};
