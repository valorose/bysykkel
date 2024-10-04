document.addEventListener("DOMContentLoaded", () => {
  const stationDataUrl = "cleaned_leaderboard.json";  
  let routesData = [];
  let selectedStartStation = null;
  let selectedEndStation = null;
  const markers = new Map();

  // Initialize the map centered on Bergen
  const map = L.map('map').setView([60.3913, 5.3221], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  console.log("Map initialized successfully");

  // Load the JSON file and parse the data
  fetch(stationDataUrl)
    .then(response => response.json())
    .then(data => {
      console.log("Data Loaded:", data);  // Check if data is correctly loaded
      routesData = data;
      displayStationsOnMap(routesData);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

  // Display stations on the map
  function displayStationsOnMap(routes) {
    const uniqueStations = new Map();

    routes.forEach(route => {
      if (!uniqueStations.has(route.start_station_id)) {
        uniqueStations.set(route.start_station_id, {
          name: route.start_station_name,
          latitude: route.start_station_latitude,
          longitude: route.start_station_longitude,
        });
      }
      if (!uniqueStations.has(route.end_station_id)) {
        uniqueStations.set(route.end_station_id, {
          name: route.end_station_name,
          latitude: route.end_station_latitude,
          longitude: route.end_station_longitude,
        });
      }
    });

    console.log("Unique stations identified:", uniqueStations);

    uniqueStations.forEach((station, stationId) => {
      if (station.latitude && station.longitude) {
        console.log(`Adding marker: ${station.name} [${station.latitude}, ${station.longitude}]`);
        const marker = L.marker([station.latitude, station.longitude]).addTo(map);
        marker.bindPopup(`<strong>${station.name}</strong>`);
        marker.on('click', () => handleStationClick(stationId, station.name, marker));
        markers.set(stationId, marker);
      } else {
        console.error(`Missing coordinates for station: ${station.name}`);
      }
    });
  }

  // Function to handle station clicks
  function handleStationClick(stationId, stationName, marker) {
    console.log(`Station Clicked: ${stationName}, ID: ${stationId}`);
    // Your existing logic for handling clicks...
  }
});
