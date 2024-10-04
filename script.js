document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([60.3913, 5.3221], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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

    tours.forEach(tour => {
        const polyline = L.polyline(tour.route, { color: 'blue' }).addTo(map);
        polyline.bindPopup(tour.name);
    });

    // Display tour info on click
    map.on('click', function(e) {
        const clickedLatLng = e.latlng;
        let info = 'You clicked the map at: ' + clickedLatLng.toString();
        document.getElementById('tour-info').innerText = info;
    });
});
