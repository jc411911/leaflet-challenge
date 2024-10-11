// Initialize the map and set its view to a chosen geographical coordinates and zoom level
var map = L.map('map').setView([20, 0], 2); // More global view

// Define base layers (tile layers) for different map options
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var satelliteMap = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.fr/">OpenStreetMap</a>'
});

// Add streetMap as the default base map
streetMap.addTo(map);

// Create layer groups for earthquakes and tectonic plates
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// Fetch the earthquake data using fetch API
var earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

fetch(earthquakeUrl)
    .then(response => response.json())
    .then(data => {
        console.log("Earthquake Data: ", data); // Log the fetched data

        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                var coords = feature.geometry.coordinates;
                return L.circleMarker([coords[1], coords[0]], styleFeature(feature)); // Swap latlng
            },
            onEachFeature: onEachFeature
        }).addTo(earthquakes); // Add to the earthquake layer
    })
    .catch(error => console.error("Error fetching earthquake data:", error));

// Fetch the tectonic plates data
var tectonicPlatesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

fetch(tectonicPlatesUrl)
    .then(response => response.json())
    .then(data => {
        console.log("Tectonic Plates Data: ", data); // Log the tectonic plates data
        L.geoJSON(data, {
            style: {
                color: "#FF5733",
                weight: 2
            }
        }).addTo(tectonicPlates); // Add to the tectonic plates layer
    })
    .catch(error => console.error("Error fetching tectonic plates data:", error));

// Define marker style based on magnitude and depth
function styleFeature(feature) {
    var magnitude = feature.properties.mag;
    var depth = feature.geometry.coordinates[2];
    var color = depth > 90 ? '#d73027' :
                depth > 70 ? '#fc8d59' :
                depth > 50 ? '#fee08b' :
                depth > 30 ? '#d9ef8b' :
                depth > 10 ? '#91cf60' : '#1a9850';
    
    var size = magnitude * 6; // Magnitude affects marker size
    return {
        radius: size,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Popups 
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.place) {
        layer.bindPopup('<h3>' + feature.properties.place + '</h3>' +
                        '<p>Magnitude: ' + feature.properties.mag + '<br>Depth: ' + feature.geometry.coordinates[2] + ' km</p>');
    }
}

// Add a legend to the map for earthquake depth
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend'),
        grades = [0, 10, 30, 50, 70, 90],
        labels = [];
    
    div.innerHTML += '<strong>Depth (km)</strong><br>';
    
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};

legend.addTo(map);

function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' : '#1a9850';
}

// Add base maps and overlay layers to the layer control
var baseMaps = {
    "Street Map": streetMap,
    "Satellite Map": satelliteMap
};

var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Add layer controls to the map
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Add earthquakes and tectonic plates layers to the map
earthquakes.addTo(map);
tectonicPlates.addTo(map); // Ensure this line exists to add the plates layer initially
