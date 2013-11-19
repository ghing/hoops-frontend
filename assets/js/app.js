requirejs.config({
  paths: {
    "leaflet": "vendor/leaflet-0.6.4/leaflet",
    "topojson": "vendor/topojson"
  },
  shim: {
    'topojson': {
      exports: 'topojson'
    }
  }
});

require([
  "leaflet",
  "topojson"
], function(L, topojson) {
  // TopoJSON layer for Leaflet
  // from http://bl.ocks.org/rclark/5779673
  L.TopoJSON = L.GeoJSON.extend({
    addData: function(jsonData) {    
      if (jsonData.type === "Topology") {
        for (var key in jsonData.objects) {
          geojson = topojson.feature(jsonData, jsonData.objects[key]);
          L.GeoJSON.prototype.addData.call(this, geojson);
        }
      }    
      else {
        L.GeoJSON.prototype.addData.call(this, jsonData);
      }
    }  
  });

  L.topoJson = function (geojson, options) {
    return new L.TopoJSON(geojson, options);
  };

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

  var breaks = [0.05, 0.10, 0.15, 0.20];
  var colors = ['#edf8fb', '#b2e2e2', '#66c2a4', '#2ca2f5', '#006d2c'];

  /**
   * Get HTML of a Leaflet popup from a hoop feature's properties
   */
  function popupText(feature) {
    return "<p>" + feature.properties.name + "</p>" +
           "<p>" + feature.properties.count + " hoops</p>";
  }

  function getColor(d) {
    var i;

    for (i = 0; i < breaks.length; i++) {
      if (d <= breaks[i]) {
        return colors[i];
      }
    }

    return colors[i];
  }

  (function() {
    var map = L.map('map').setView(CHICAGO_CENTER, 13);
    var legend = L.control({position: 'bottomright'});
    var lower, upper, sep;

    legend.onAdd = function(map) {
      var el = L.DomUtil.create('div', 'info legend');

      el.innerHTML += '<i class="hoop"></i> Park District hoop<br />';

      el.innerHTML += '<h3>Kids, ages 10-17, as percent of total population</h3>';

      for (var i = 0; i <= breaks.length; i++) {
        lower = (i === 0) ? 0 : breaks[i - 1] * 100;
        upper = (i === breaks.length) ? '+' : breaks[i] * 100;
        sep = (i === breaks.length) ? '' : '-'; 
        el.innerHTML += '<i style="background:' + colors[i] + '"></i> ' + lower + sep + upper + ' %<br />';
      }

      return el;
    };

    legend.addTo(map);

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors. <a href="http://thenounproject.com/noun/basketball-hoop/#icon-No2711" target="_blank">Basketball Hoop</a> designed by <a href="http://thenounproject.com/Gabriele Fumero" target="_blank">Gabriele Fumero</a> from The Noun Project'
    }).addTo(map);

    var courtsXhr = new XMLHttpRequest();
    courtsXhr.onload = function() {
      var data = JSON.parse(this.responseText);

      L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
          var numHoops = feature.properties.count || 0;
          return L.marker(latlng, {icon: hoopIcons[numHoops]});
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(popupText(feature));
        }
      }).addTo(map);
    };
    courtsXhr.open('get', 'data/basketball_courts.geojson');
    courtsXhr.send();

    var tractsXhr = new XMLHttpRequest();
    tractsXhr.onload = function() {
      var tracts = JSON.parse(this.responseText);
      L.topoJson(tracts, {
        style: function(feature) {
          return {
            fillColor: getColor(feature.properties.pct_older_kids),
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
          };
        }
      }).addTo(map);
    };
    tractsXhr.open('get', 'data/tracts.json');
    tractsXhr.send();
  })();
});
