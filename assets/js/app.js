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

  var HoopIcon = L.Icon.extend({
    options: {
      iconUrl: 'assets/images/hoop-marker-icon.png',
      shadowUrl: 'assets/images/hoop-marker-shadow.png',

      iconSize:     [48, 38], // size of the icon
      shadowSize:   [58, 28], // size of the shadow
      iconAnchor:   [20, 16], // point of the icon which will correspond to marker's location
      shadowAnchor: [17, 12],  // the same for the shadow
      popupAnchor:  [0, -16] // point from which the popup should open relative to the iconAnchor
    }
  });
  var hoopIcons = [new HoopIcon()];

  for (var i = 1; i <= 9; i++) {
    hoopIcons.push(new HoopIcon({
      iconUrl: 'assets/images/hoop-marker-icon-' + i + '.png'
    }));
  }

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
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors. <a href="http://thenounproject.com/noun/basketball-hoop/#icon-No2711" target="_blank">Basketball Hoop</a> designed by <a href="http://thenounproject.com/Gabriele Fumero" target="_blank">Gabriele Fumero</a> from The Noun Project'
    }).addTo(map);

    // BOOKMARK
    // TODO: Check display of basketball courts.  See if performance issue breaks on heftier
    // machine than my netbook
    // TODO: Basic styling of markers
    $.getJSON('data/basketball_courts.geojson', function(data) {
      L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
          var numHoops = feature.properties.count || 0;
          return L.marker(latlng, {icon: hoopIcons[numHoops]});
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(popupText(feature));
        }
      }).addTo(map);
    });
  });
});
