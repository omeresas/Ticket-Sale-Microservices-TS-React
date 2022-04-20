export default class Map {
  private map: google.maps.Map;
  private infowindow = new google.maps.InfoWindow();

  constructor(elementID: string) {
    this.map = new google.maps.Map(document.getElementById(elementID), {
      center: {
        lat: 0,
        lng: 0,
      },
      zoom: 1,
    });
  }

  addMarker(item: Mappable) {
    const marker = new google.maps.Marker({
      map: this.map,
      position: {
        lat: item.location.lat,
        lng: item.location.lng,
      },
    });

    marker.addListener("click", () => {
      this.infowindow.setContent(item.markerContent());
      this.infowindow.open({
        anchor: marker,
        map: this.map,
        shouldFocus: false,
      });
    });
  }
}

export interface Mappable {
  location: {
    lat: number;
    lng: number;
  };
  markerContent(): string;
}
