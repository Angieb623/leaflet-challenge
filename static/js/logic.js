// Adding a tile layer (the background map image) to our map:
// We use the addTo() method to add objects to our map.
let defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// create another map layer
let smoothMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

// make a basemap object
let basemaps = {
    Default: defaultMap,
    Smooth: smoothMap
};


//create map object
let myMap = L.map("map", {
    center: [37.16, -119.45],
    zoom: 5.9,
    layers: [defaultMap, smoothMap]
});


// add updates to myMap
defaultMap.addTo(myMap);




// gather earthquake data to add to map
// create variable to hold tectonic plates layer
let earthquakes = new L.layerGroup();

// call on USGS GeoJson API to get info for Earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
        console.log(earthquakeData)
        //plot circles where radius is dependent on magnitude and color on depth


        // make a function that chooses the color of the data point
        function dataColor(depth){
            if (depth > 90)
                return "red";
            else if(depth > 70)
                return "#fc4903";
            else if(depth > 50)
                return "#fc8403";
            else if(depth > 30)
                return "#fcad03";
            else if(depth > 10)
                return "#cafc03";
            else
                return "green";

        }

        // make a function that determines size of radius
        function radiusSize(mag){
            if (mag == 0)
                return 1; // includes mags of 0
            else
                return mag * 5; // pronounces the circles on the map
        }

        // add on the style for each data point
        function dataStyle(feature)
        {
            return {
                opacity: 0.5,
                fillOpacity: 0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: "000000",
                radius: radiusSize(feature.properties.mag),
                weight: 0.5,
                stroke: true
            }
        }

        // add Geojson Data to the earthquake layer group
        L.geoJson(earthquakeData, {
            // make each feature a circle marker on map
            pointToLayer: function(feature, latLng) {
                return L.circleMarker(latLng);
            },
            //set style for each marker
            style: dataStyle,
            // add popups
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                Location: <b>${feature.properties.place}</b>`);
            }
        }).addTo(earthquakes);

    }

);

// add earthquake layer to map
earthquakes.addTo(myMap);

//add overlay for earthquakes
let overlays = {
    "Earthquake Data": earthquakes
};



// Add the layer control to the map.
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);


// add legend to map
let legend = L.control({
    position: "bottomright"
});

// add properties for legend
legend.onAdd = function() {
    // make div for legend to populate on page
    let div = L.DomUtil.create("div", " legend");

    // set up the intervals
    let intervals = [-10, 10, 30, 50, 70, 90];
    // set colors for intervals to match dataColor function(from above)
    let colors = [
        "green", 
        "#cafc03", 
        "#fcad03", 
        "#fc8403", 
        "#fc4903", 
        "red"
    ];

    // loop through intervals and colors and generate a label with a 
    // colored square for each interval
    for (let i = 0; i < intervals.length; i++)
    {
        // inner html that sets the square for each interval and label
        div.innerHTML += "<i style='background:"
            + colors[i]
            + "'></i"
            + intervals[i]
            + (intervals[i + 1] ? "km &ndash km;" + intervals[i + 1] + "km<br>" : "+");

    };

    return div;
};

// add legend to map
legend.addTo(myMap);