document.addEventListener("DOMContentLoaded", () => {
  const stationInfoUrl = "https://gbfs.urbansharing.com/bergenbysykkel.no/station_information.json";
  const stationStatusUrl = "https://gbfs.urbansharing.com/bergenbysykkel.no/station_status.json";
  const attractionsUrl = "attractions.json";  // Local JSON file for attractions
  let stations = [];
  let attractions = [];

  // Initialize the map centered on Bergen
  const map = L.map('map').setView([60.3913, 5.3221], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Fetch Station Information and Status
  async function fetchStationData() {
    try {
      const [infoResponse, statusResponse, attractionsResponse] = await Promise.all([
        fetch(stationInfoUrl),
        fetch(stationStatusUrl),
        fetch(attractionsUrl)
      ]);

      if (!infoResponse.ok || !statusResponse.ok || !attractionsResponse.ok) throw new Error("Failed to load data");

      const infoData = await infoResponse.json();
      const statusData = await statusResponse.json();
      const attractionsData = await attractionsResponse.json();

      stations = combineStationData(infoData.data.stations, statusData.data.stations);
      attractions = attractionsData;

      displayStationsOnMap(stations);
      displayAttractionsOnMap(attractions);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  // Combine Station Info and Status
  function combineStationData(info, status) {
    return info.map((station) => {
      const statusInfo = status.find((s) => s.station_id === station.station_id);
      return {
        ...station,
        num_bikes_available: statusInfo ? statusInfo.num_bikes_available : 0,
        num_docks_available: statusInfo ? statusInfo.num_docks_available : 0
      };
    });
  }

  // Display Stations on Map
  function displayStationsOnMap(stations) {
    stations.forEach((station) => {
      const marker = L.marker([station.lat, station.lon]).addTo(map);
      marker.bindPopup(`
        <strong>${station.name}</strong><br>
        Bikes Available: ${station.num_bikes_available}<br>
        Docks Available: ${station.num_docks_available}
      `);
    });
  }

  // Display Attractions on Map
  function displayAttractionsOnMap(attractions) {
    attractions.forEach((attraction) => {
      const icon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [30, 30]
      });

      const marker = L.marker([attraction.latitude, attraction.longitude], { icon }).addTo(map);
      marker.bindPopup(`
        <strong>${attraction.name}</strong><br>
        Type: ${attraction.type}<br>
        Address: ${attraction.address}<br>
        <a href="${attraction.website}" target="_blank">Website</a>
      `);
    });
  }

  // Start by fetching the data
  fetchStationData();
});
