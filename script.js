document.addEventListener("DOMContentLoaded", () => {
  const apiBaseUrl = "https://bergenbysykkel.no/apne-data";
  let stationData = [];
  let rideData = [];

  // Load Stations Data
  async function loadStations() {
    try {
      let response = await fetch(`${apiBaseUrl}/stations`);
      if (!response.ok) throw new Error(`Failed to load stations: ${response.statusText}`);
      let data = await response.json();
      stationData = data.stations;
      populateDropdowns(stationData);
      displayStationsOnMap(stationData);
    } catch (error) {
      console.error("Error loading stations: ", error);
    }
  }

  // Load Rides Data Based on User Selections
  async function loadRides(startStation, endStation) {
    try {
      let response = await fetch(`${apiBaseUrl}/rides?start_station_id=${startStation}&end_station_id=${endStation}`);
      if (!response.ok) throw new Error(`Failed to load rides: ${response.statusText}`);
      rideData = await response.json();
      displayRoutes(rideData);
    } catch (error) {
      console.error("Error loading rides: ", error);
    }
  }

  // Populate Dropdowns with Station Names
  function populateDropdowns(stations) {
    const startDropdown = document.getElementById("startStation");
    const endDropdown = document.getElementById("endStation");

    stations.forEach(station => {
      startDropdown.appendChild(new Option(station.name, station.station_id));
      endDropdown.appendChild(new Option(station.name, station.station_id));
    });

    startDropdown.addEventListener("change", handleStationSelection);
    endDropdown.addEventListener("change", handleStationSelection);
  }

  // Display Stations on Map
  function displayStationsOnMap(stations) {
    stations.forEach(station => {
      L.marker([station.latitude, station.longitude]).addTo(map).bindPopup(`<b>${station.name}</b>`);
    });
  }

  // Handle Station Selection and Fetch Rides
  function handleStationSelection() {
    const startStation = document.getElementById("startStation").value;
    const endStation = document.getElementById("endStation").value;

    if (startStation && endStation) {
      loadRides(startStation, endStation);
    }
  }

  // Display Routes in Table
  function displayRoutes(rides) {
    const tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = "";

    if (rides.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='3'>No rides available between these stations</td></tr>";
      return;
    }

    rides.forEach((ride, index) => {
      let row = document.createElement("tr");
      row.innerHTML = `<td>${ride.start_station_name}</td><td>${ride.end_station_name}</td><td>${ride.duration}</td>`;
      tableBody.appendChild(row);
    });
  }

  // Initialize the Map
  var map = L.map('map').setView([60.3913, 5.3221], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Start by loading the station data
  loadStations();
});
