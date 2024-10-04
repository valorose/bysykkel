document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([60.3913, 5.3221], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let selectedStartStation = null;
    let selectedEndStation = null;
    let ridesData = []; // To store ride data from the JSON file

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
                
                marker.on('click', () => handleStationClick(station));
            });
        })
        .catch(error => console.error('Error fetching station data:', error));

    // Handle station click event to select start and end stations
    function handleStationClick(station) {
        if (!selectedStartStation) {
            selectedStartStation = station;
            console.log(`Start Station Selected: ${station.name}`);
            alert(`Start Station Selected: ${station.name}`);
        } else if (!selectedEndStation) {
            selectedEndStation = station;
            console.log(`End Station Selected: ${station.name}`);
            alert(`End Station Selected: ${station.name}`);
            showFastestTimes(selectedStartStation.station_id, selectedEndStation.station_id);
        } else {
            // Reset selection if both stations are already selected
            selectedStartStation = station;
            selectedEndStation = null;
            console.log(`New Start Station Selected: ${station.name}`);
            alert(`New Start Station Selected: ${station.name}`);
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

            let resultText = `<strong>Fastest Times from ${selectedStartStation.name} to ${selectedEndStation.name}:</strong><br>`;
            topRides.forEach((ride, index) => {
                resultText += `${index + 1}. ${ride.duration} seconds<br>`;
            });

            alert(resultText); // You can also display this in a dedicated sidebar or div
        } else {
            alert(`No ride data available between ${selectedStartStation.name} and ${selectedEndStation.name}.`);
        }
    }
});
