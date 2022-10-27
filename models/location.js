var GeoPoint = require("geopoint");

const NEARBY_DIFF_KM = 10;

class Location {
  constructor(location) {
    this.set(location);
  }

  set(location) {
    const { lat, lon } = location;
    if (!lat || !lon) {
      throw new Error("malformed location");
    }
    this.geopoint = new GeoPoint(lat, lon);
  }

  nearby(geopoint) {
    if (!this.geopoint) {
      throw new Error("location is not defined");
    }
    return this.geopoint.distanceTo(geopoint, true) < NEARBY_DIFF_KM;
  }

  get() {
    return {
      latitude: this.geopoint.latitude() ?? -1,
      longitude: this.geopoint.longitude() ?? -1,
    };
  }
}

module.exports = Location;
