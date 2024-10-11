// Initialize the map 
var map = L.map('map').setView([37.7749, -122.4194], 5); 

// Add a tile layer to the map 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch the earthquake data using fetch API
var earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

fetch(earthquakeUrl)
    .then(response => response.json())
    .then(data => {
        console.log("Earthquake Data: ", data); // Log the fetched data

        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                var coords = feature.geometry.coordinates;
                console.log("Coordinates: ", coords); // Log coordinates
                var magnitude = feature.properties.mag;
                var depth = feature.geometry.coordinates[2];
                console.log("Magnitude: ", magnitude, " Depth: ", depth); // Log magnitude and depth

                return L.circleMarker([coords[1], coords[0]], styleFeature(feature));
            },
            onEachFeature: onEachFeature
        }).addTo(map);
    })
    .catch(error => console.error("Error fetching earthquake data: ", error));

// Define based on magnitude and depth
function styleFeature(feature) {
    var magnitude = feature.properties.mag;
    var depth = feature.geometry.coordinates[2];
    var color = depth > 90 ? '#d73027' :
                depth > 70 ? '#fc8d59' :
                depth > 50 ? '#fee08b' :
                depth > 30 ? '#d9ef8b' :
                depth > 10 ? '#91cf60' : '#1a9850';
    
    var size = magnitude * 6; // Magnitude 
    return {
        radius: size,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Add popups 
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.place) {
        layer.bindPopup('<h3>' + feature.properties.place + '</h3>' +
                        '<p>Magnitude: ' + feature.properties.mag + '<br>Depth: ' + feature.geometry.coordinates[2] + ' km</p>');
    }
}

// Add a legend
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
