document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([60.3913, 5.3221], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let selectedStartStation = null;
    let selectedEndStation = null;
    let ridesData = []; // To store ride data from the JSON file
    let startMarker = null;
    let endMarker = null;

    // Load rides data from JSON file
    fetch('rides_data.json')
        .then(response => response.json())
        .then(data => {
            ridesData = data;
        })
        .catch(error => console.error('Error fetching rides data:', error));

    // Fetch and display bike stations
    fetch('https://gbfs.urbansharing.com/bergenbysykkel.no/station_information.json')
        .then(response => response.json())
        .then(data => {
            const stations = data.data.stations;
            stations.forEach(station => {
                const marker = L.marker([station.lat, station.lon]).addTo(map);
                marker.bindPopup(`<strong>${station.name}</strong><br>${station.address}`);

                marker.on('click', () => handleStationClick(station, marker));
            });
        })
        .catch(error => console.error('Error fetching station data:', error));

    // Handle station click event to select start and end stations
    function handleStationClick(station, marker) {
        if (!selectedStartStation) {
            selectedStartStation = station;
            if (startMarker) startMarker.setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png' }));
            startMarker = marker;
            startMarker.setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-red.png' }));
        } else if (!selectedEndStation) {
            selectedEndStation = station;
            if (endMarker) endMarker.setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png' }));
            endMarker = marker;
            endMarker.setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-blue.png' }));
            showFastestTimes(selectedStartStation.station_id, selectedEndStation.station_id);
        } else {
            // Reset selection if both stations are already selected
            if (startMarker) startMarker.setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png' }));
            if (endMarker) endMarker.setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png' }));
            selectedStartStation = station;
            selectedEndStation = null;
            startMarker = marker;
            startMarker.setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-red.png' }));
        }
    }

    // Display fastest ride times between selected start and end stations
    function showFastestTimes(startId, endId) {
        const matchingRides = ridesData.filter(ride =>
            ride.start_station_id === startId && ride.end_station_id === endId
        );

        if (matchingRides.length > 0) {
            const sortedRides = matchingRides.sort((a, b) => a.duration - b.duration);
            const topRides = sortedRides.slice(0, 3);
            updateFastestTimesDisplay(topRides);
        } else {
            document.getElementById('podium').innerHTML = `<p>No ride data available between ${selectedStartStation.name} and ${selectedEndStation.name}.</p>`;
        }
    }

    // Update the podium display for fastest times
    function updateFastestTimesDisplay(topRides) {
        const podiumContainer = document.getElementById('podium');
        podiumContainer.innerHTML = '';

        const podiumLabels = ['gold', 'silver', 'bronze'];

        topRides.forEach((ride, index) => {
            const durationInMinutes = (ride.duration / 60).toFixed(2);
            const podiumItem = document.createElement('div');
            podiumItem.className = `podium-item ${podiumLabels[index]}`;
            podiumItem.innerHTML = `
                <span>${index + 1}.</span>
                ${durationInMinutes} minutes
            `;
            podiumContainer.appendChild(podiumItem);
        });
    }
});
