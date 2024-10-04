document.addEventListener("DOMContentLoaded", () => {
  const stationDataUrl = "cleaned_leaderboard.json";  // The updated JSON file path
  let routesData = [];
  let selectedStartStation = null;
  let selectedEndStation = null;

  // Initialize the map centered on Bergen
  const map = L.map('map').setView([60.3913, 5.3221], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

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

  // Load the JSON file and parse the data
  fetch(stationDataUrl)
    .then(response => response.json())
    .then(data => {
      routesData = data;
      displayStationsOnMap(routesData);
    });

  // Display stations on the map (using unique stations)
  function displayStationsOnMap(routes) {
    const uniqueStations = new Map();

    // Create unique station markers for start and end stations
    routes.forEach(route => {
      if (!uniqueStations.has(route.start_station_name)) {
        uniqueStations.set(route.start_station_name, [route.start_station_latitude, route.start_station_longitude]);
      }
      if (!uniqueStations.has(route.end_station_name)) {
        uniqueStations.set(route.end_station_name, [route.end_station_latitude, route.end_station_longitude]);
      }
    });

    // Add markers for each unique station
    uniqueStations.forEach((coords, stationName) => {
      const marker = L.marker(coords).addTo(map);
      marker.bindPopup(`<strong>${stationName}</strong>`);
      
      // Handle station selection on click
      marker.on('click', () => handleStationClick(stationName));
    });
  }

  // Handle station click event to set start and end stations
  function handleStationClick(stationName) {
    if (!selectedStartStation) {
      selectedStartStation = stationName;
      sidebar.innerHTML = `Start Station Selected: <strong>${stationName}</strong><br>Select an end station.`;
    } else if (!selectedEndStation) {
      selectedEndStation = stationName;
      sidebar.innerHTML = `End Station Selected: <strong>${stationName}</strong><br>Loading top 3 times...`;
      showTopTimes(selectedStartStation, selectedEndStation);
    } else {
      // Reset if both stations are already selected
      selectedStartStation = stationName;
      selectedEndStation = null;
      sidebar.innerHTML = `New Start Station Selected: <strong>${stationName}</strong><br>Select an end station.`;
    }
  }

  // Display top 3 times between the selected start and end stations
  function showTopTimes(startStation, endStation) {
    const matchingRoutes = routesData
      .filter(route => 
        route.start_station_name === startStation && route.end_station_name === endStation
      )
      .sort((a, b) => a.duration - b.duration);  // Sort by duration (ascending)

    if (matchingRoutes.length > 0) {
      const top3Routes = matchingRoutes.slice(0, 3);  // Get the top 3 durations
      let timesText = `<strong>Top 3 Times from ${startStation} to ${endStation}:</strong><br>`;
      top3Routes.forEach((route, index) => {
        timesText += `${index + 1}. ${route.duration} seconds<br>`;
      });
      sidebar.innerHTML = timesText;  // Update the sidebar with top times
    } else {
      sidebar.innerHTML = `No route data available between ${startStation} and ${endStation}.`;
    }
  }
});
