requirejs.config({
  paths: {
    "jquery": "vendor/jquery-2.0.3.min",
    "leaflet": "vendor/leaflet-0.6.4/leaflet"
  }
});

require([
  "jquery",
  "leaflet"
], function($, L) {
  var CHICAGO_CENTER = [41.881944, -87.627778];

  /**
   * Get HTML of a Leaflet popup from a hoop feature's properties
   */
  function popupText(feature) {
    return "<p>" + feature.properties.name + "</p>" +
           "<p>" + feature.properties.count + " hoops</p>";
  }

  $(function() {
    var map = L.map('map').setView(CHICAGO_CENTER, 13);
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // BOOKMARK
    // TODO: Check display of basketball courts.  See if performance issue breaks on heftier
    // machine than my netbook
    // TODO: Basic styling of markers
    $.getJSON('data/basketball_courts.geojson', function(data) {
      L.geoJson(data, {
        onEachFeature: function (feature, layer) {
          layer.bindPopup(popupText(feature));
        }
      }).addTo(map);
    });
  });
});
