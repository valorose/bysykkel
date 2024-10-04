document.addEventListener("DOMContentLoaded", () => {
  const stationDataUrl = "cleaned_leaderboard.json";  // Ensure path is correct and file is uploaded
  let routesData = [];
  let selectedStartStation = null;
  let selectedEndStation = null;
  let routeLine;
  const markers = new Map();
  const routeCache = new Map();

  // Initialize the map centered on Bergen
  const map = L.map('map').setView([60.3913, 5.3221], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  console.log("Map initialized successfully");

  // Create a sidebar to display the top 3 times
  const sidebar = document.createElement('div');
  sidebar.id = 'routeInfo';
  sidebar.style.width = '300px';
  sidebar.style.height = '200px';
  sidebar.style.position = 'absolute';
  sidebar.style.top = '10px';
  sidebar.style.right = '10px';
  sidebar.style.backgroundColor = '#fff';
  sidebar.style.padding = '10px';
  sidebar.style.border = '1px solid #ccc';
  document.body.appendChild(sidebar);

  // Create loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loadingIndicator';
  loadingIndicator.style.display = 'none';
  loadingIndicator.textContent = 'Loading...';
  loadingIndicator.style.position = 'absolute';
  loadingIndicator.style.top = '50%';
  loadingIndicator.style.left = '50%';
  loadingIndicator.style.transform = 'translate(-50%, -50%)';
  loadingIndicator.style.padding = '10px';
  loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  loadingIndicator.style.borderRadius = '5px';
  document.body.appendChild(loadingIndicator);

  console.log("Loading JSON data...");
  
  // Load the JSON file and parse the data
  loadingIndicator.style.display = 'block';
  fetch(stationDataUrl)
    .then(response => response.json())
    .then(data => {
      console.log("Data loaded successfully:", data);  // Confirm data is loaded
      routesData = data;
      displayStationsOnMap(routesData);
      loadingIndicator.style.display = 'none';
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      loadingIndicator.style.display = 'none';
      sidebar.innerHTML = 'Error loading data. Please try again later.';
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

  // Handle station click event to set start and end stations
  function handleStationClick(stationId, stationName, marker) {
    console.log(`Station Clicked: ${stationName}, ID: ${stationId}`);
    if (!selectedStartStation) {
      selectedStartStation = { id: stationId, name: stationName };
      marker.setIcon(L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' }));
      sidebar.innerHTML = `Start Station Selected: <strong>${stationName}</strong><br>Select an end station.`;
    } else if (!selectedEndStation) {
      selectedEndStation = { id: stationId, name: stationName };
      marker.setIcon(L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' }));
      sidebar.innerHTML = `End Station Selected: <strong>${stationName}</strong><br>Loading top 3 times...`;
      showTopTimes(selectedStartStation.id, selectedEndStation.id);
    } else {
      markers.get(selectedStartStation.id).setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png' }));
      markers.get(selectedEndStation.id).setIcon(L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png' }));
      selectedStartStation = { id: stationId, name: stationName };
      selectedEndStation = null;
      marker.setIcon(L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' }));
      sidebar.innerHTML = `New Start Station Selected: <strong>${stationName}</strong><br>Select an end station.`;
    }
  }

