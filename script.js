document.addEventListener("DOMContentLoaded", () => {
  const stationDataUrl = "cleaned_leaderboard.json";  // Path to the uploaded JSON file
  let routesData = [];
  let selectedStartStation = null;
  let selectedEndStation = null;

  // Initialize the map centered on Bergen
  const map = L.map('map').setView([60.3913, 5.3221], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Create a sidebar to show the top times
  const sidebar = document.createElement('div');
  sidebar.id = 'routeInfo';
  sidebar.style.width = '250px';
  sidebar.style.height = '150px';
  sidebar.style.position = 'absolute';
  sidebar.style.top = '50px';
  sidebar.style.left = '10px';
  sidebar.style.backgroundColor = '#fff';
  sidebar.style.padding = '10px';
  sidebar.style.border = '1px solid #ccc';
  document.body.appendChild(sidebar);

  // Load the JSON file and parse the data
  fetch(stationDataUrl)
    .then(response => response.json())
    .then(data => {
      routesData = data;
      displayStationsOnMap(data);
    });

  // Display stations on the map
  function displayStationsOnMap(stations) {
    const uniqueStations = new Set();

    // Add markers only for unique stations
    stations.forEach(route => {
      uniqueStations.add(route["Start Station"]);
      uniqueStations.add(route["End Station"]);
    });

    uniqueStations.forEach(stationName => {
      const marker = L.marker([getStationLat(stationName), getStationLon(stationName)]).addTo(map);
      marker.bindPopup(`<strong>${stationName}</strong>`);
      
      // On click event to select start and end stations
      marker.on('click', () => handleStationClick(stationName));
    });
  }

  // Placeholder function to simulate getting latitude and longitude based on station name
  function getStationLat(stationName) {
    // Replace with actual coordinates for your stations
    return 60.3913 + Math.random() * 0.01;
  }

  function getStationLon(stationName) {
    // Replace with actual coordinates for your stations
    return 5.3221 + Math.random() * 0.01;
  }

  // Handle station click
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

  // Show top 3 times between selected stations
  function showTopTimes(startStation, endStation) {
    // Filter data for the selected route
    const matchingRoute = routesData.find(route => 
      route["Start Station"] === startStation && route["End Station"] === endStation
    );

    if (matchingRoute) {
      // Display the top 3 times in the sidebar
      sidebar.innerHTML = `
        <strong>Top 3 Times from ${startStation} to ${endStation}:</strong><br>
        1st Place: ${matchingRoute["1st Place"]} seconds<br>
        2nd Place: ${matchingRoute["2nd Place"]} seconds<br>
        3rd Place: ${matchingRoute["3rd Place"]} seconds<br>
        <strong>Total Rides:</strong> ${matchingRoute["Total Rides"]}
      `;
    } else {
      sidebar.innerHTML = `No data available for the route from ${startStation} to ${endStation}.`;
    }
  }
});
