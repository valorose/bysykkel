document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([60.3913, 5.3221], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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
});
