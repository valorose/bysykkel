document.addEventListener("DOMContentLoaded", () => {
  const stationInfoUrl = "https://gbfs.urbansharing.com/bergenbysykkel.no/station_information.json";
  const stationStatusUrl = "https://gbfs.urbansharing.com/bergenbysykkel.no/station_status.json";
  let stations = [];

  // Initialize the map centered on Bergen
  const map = L.map('map').setView([60.3913, 5.3221], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Fetch Station Information
  async function fetchStationData() {
    try {
      const infoResponse = await fetch(stationInfoUrl);
      const statusResponse = await fetch(stationStatusUrl);
      if (!infoResponse.ok || !statusResponse.ok) throw new Error("Failed to load station data");

      const infoData = await infoResponse.json();
      const statusData = await statusResponse.json();
      stations = combineStationData(infoData.data.stations, statusData.data.stations);

      displayStationsOnMap(stations);
    } catch (error) {
      console.error("Error loading station data:", error);
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

  // Start by fetching the station data
  fetchStationData();
});
