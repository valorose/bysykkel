document.addEventListener("DOMContentLoaded", () => {
  const stationDataUrl = "cleaned_leaderboard.json";  // Path to the JSON file
  let stations = [];
  let selectedStartStation = null;
  let selectedEndStation = null;

  const map = L.map('map').setView([60.3913, 5.3221], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Create a sidebar to show route info
  const sidebar = document.createElement('div');
  sidebar.id = 'routeInfo';
  sidebar.style.width = '300px';
  sidebar.style.height = '150px';
  sidebar.style.position = 'absolute';
  sidebar.style.top = '10px';
  sidebar.style.left = '10px';
  sidebar.style.backgroundColor = 'white';
  sidebar.style.padding = '10px';
  sidebar.style.border = '1px solid #ccc';
  document.body.appendChild(sidebar);

  // Load Station and Route Data
  fetch(stationDataUrl)
    .then(response => response.json())
    .then(data => {
      stations = data;
      displayStationsOnMap(data);
    });

  // Display stations on map
  function displayStationsOnMap(stations) {
    stations.forEach(station => {
      const marker = L.marker([getStationLat(station.Start Station), getStationLon(station.Start Station)]).addTo(map);
      marker.bindPopup(`<strong>${station["Start Station"]}</strong>`);
      marker.on('click', () => handleStationClick(station));
    });
  }
system
