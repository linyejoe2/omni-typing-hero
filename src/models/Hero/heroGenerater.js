import { Defender } from "./Defender.js";
import { Mage } from "./Mage.js";

export const heroGenerator = (charData) => {
  switch (charData.job) {
    case 'mage':
      return new Mage(charData);
    case 'defender':
      return new Defender(charData);
    default:
      return new Defender(charData);
  }
}