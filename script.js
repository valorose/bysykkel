document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([60.3913, 5.3221], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Define the tours
    const tours = [
        {
            name: "Tour 1: Bryggen",
            route: [
                [60.3923, 5.3242], // Starting point
                [60.3925, 5.3231], // Point 1
                [60.3917, 5.3220]  // Point 2
            ]
        },
        {
            name: "Tour 2: Fløyen",
            route: [
                [60.3923, 5.3242],
                [60.3961, 5.3250],
                [60.3969, 5.3301]
            ]
        }
    ];

    // Add the tours to the map
    tours.forEach(tour => {
        const polyline = L.polyline(tour.route, { color: 'blue' }).addTo(map);
        polyline.bindPopup(tour.name);
    });

    // Fetch and display bike stations
    fetch('https://gbfs.urbansharing.com/bergenbysykkel.no/station_information.json')
        .then(response => response.json())
        .then(data => {
            const stations = data.data.stations;
            stations.forEach(station => {
                const marker = L.marker([station.lat, station.lon]).addTo(map);
                marker.bindPopup(`<strong>${station.name}</strong><br>${station.address}`);
            });
        })
        .catch(error => console.error('Error fetching station data:', error));

    // Display tour info on click
    map.on('click', function(e) {
        const clickedLatLng = e.latlng;
        let info = 'You clicked the map at: ' + clickedLatLng.toString();
        document.getElementById('tour-info').innerText = info;
    });
});
