import User from "./User";
import Company from "./Company";
import Map from "./Map";

const map = new Map("map");

for (let i = 0; i < 10; i++) {
  map.addMarker(new User());
  map.addMarker(new Company());
}
