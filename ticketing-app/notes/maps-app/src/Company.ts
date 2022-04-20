import { faker } from "@faker-js/faker";
import { Mappable } from "./Map";

export default class Company implements Mappable {
  name: string;
  catchPhrase: string;
  location: {
    lat: number;
    lng: number;
  };

  constructor() {
    this.name = faker.company.companyName();
    this.catchPhrase = faker.company.catchPhrase();
    this.location = {
      lat: parseFloat(faker.address.latitude()),
      lng: parseFloat(faker.address.longitude()),
    };
  }

  markerContent(): string {
    return `
        <div>
          <h4>Company Name: ${this.name}</h1>
          <h5>Catch Phrase: ${this.catchPhrase}</h1>
        </div>
        `;
  }
}
