var myMap = L.map("map", {
    center: [37.773972, -122.431297], // Adjust center as needed
    zoom: 5
});


//adding tile layer, which is centered on San Francisco
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

// based on the url, we can use the fetch function to collect earthquake data from the server
fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                var geojsonMarkerOptions = {
                    radius: 4 * feature.properties.mag, // Size based on magnitude
                    fillColor: getColor(feature.geometry.coordinates[2]), // Color based on depth
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };
                return L.circleMarker(latlng, geojsonMarkerOptions);
            },
            onEachFeature: function(feature, layer) { //adding magnitude and depth based on where the earthquake happened to the popup
                layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "</h3><hr><p>" +
                    new Date(feature.properties.time) + "</p><p>Depth: " +
                    feature.geometry.coordinates[2] + " km</p>");
            }
        }).addTo(myMap);
    });


    // creating a function which uses conditionals to assign color based on depth
function getColor(depth) {
    if (depth < 10 && depth >= -10) {
        return "#b6d7a8"; // very shallow
    } else if (depth < 30 && depth >= 10) {
        return "#6aa84f"; // shallow
    } else if (depth < 50 && depth >= 30) {
        return "#ffd966"; // moderate
    } else if (depth < 70 && depth >= 50) {
        return "#f1c232"; // deep
    } else if (depth < 90 && depth >= 70) {
        return "#e06666"; // very deep
    } else return "#990000"; // extremely deep
}

var legend = L.control({position: 'bottomright'}); //initiating legend and putting it on the bottom right of the page

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        depths = [-10, 10, 30, 50, 70, 90];
    div.innerHTML = '<strong>Depth (km)</strong><br>';
    depths.forEach(function(depth, index) {
        var nextDepth = depths[index + 1];
        var range = nextDepth ? depth + '&ndash;' + nextDepth + ' km' : depth + '+ km';
        div.innerHTML += '<i style="background:' + getColor(depth + 1) + '"></i> ' + range + '<br>';
    });
    return div;
};

legend.addTo(myMap);