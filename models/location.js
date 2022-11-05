const GeoJSON = require("geojson");

class Location {
  constructor(location) {
    this.set(location);
  }

  set(location) {
    if (!location) {
      throw new Error("undefined location");
    }
    const { lat, lon } = location;
    if (lat === undefined || lon === undefined) {
      throw new Error("malformed location");
    }
    this.location = new GeoJSON.parse(location, { Point: ["lat", "lon"] });
  }

  get() {
    return this.location.geometry;
  }
}

module.exports = Location;
