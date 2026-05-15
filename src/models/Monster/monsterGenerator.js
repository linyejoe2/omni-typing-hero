import { Kooni } from "./Kooni";
import { Tengu } from "./Tengu";
import { Oni } from "./Oni";

export const monsterGenerator = (name, config = {}) => {
  switch (name) {
    case "Kooni":
      return new Kooni(config);
    case "Tengu":
      return new Tengu(config);
    case "Oni":
      return new Oni(config);
    default:
      return new Kooni(config);
  }
}