document.addEventListener("DOMContentLoaded", () => {
    const loadDataButton = document.getElementById("loadData");
    let topRoutes = {};
    let allStations = {};

    loadDataButton.addEventListener("click", async () => {
        try {
            let response = await fetch("cleaned_trips.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

            let data = await response.json();
            topRoutes = {};
            allStations = {};

            // Create a map to store all unique start and end stations
            data.forEach((ride) => {
                const startStation = ride.start_station_name;
                const endStation = ride.end_station_name;

                // Store unique stations
                if (!allStations[startStation]) {
                    allStations[startStation] = "start";
                }
                if (!allStations[endStation]) {
                    allStations[endStation] = "end";
                }

                // Organize data for top 3 rides (optional)
                const key = `${startStation} - ${endStation}`;
                if (!topRoutes[key]) {
                    topRoutes[key] = [];
                }
                topRoutes[key].push({ startStation, endStation, duration: ride.duration });
                topRoutes[key].sort((a, b) => a.duration - b.duration);
                if (topRoutes[key].length > 3) {
                    topRoutes[key].pop();
                }
            });

            // Display checkboxes for Start and End stations
            createCheckboxes();

            // Display full dataset in the table initially
            displayRoutes(topRoutes);

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });

    // Function to dynamically create checkboxes for start and end stations
    function createCheckboxes() {
        const startStationFilter = document.getElementById("startStationFilter");
        const endStationFilter = document.getElementById("endStationFilter");

        // Create checkboxes for each unique station
        for (const station in allStations) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `station-${station}`;
            checkbox.value = station;

            // Label for the checkbox
            let label = document.createElement("label");
            label.htmlFor = `station-${station}`;
            label.textContent = station;

            // Append to the correct filter (start or end)
            if (allStations[station] === "start") {
                checkbox.className = "start-checkbox";
                startStationFilter.appendChild(checkbox);
                startStationFilter.appendChild(label);
                startStationFilter.appendChild(document.createElement("br"));
            } else {
                checkbox.className = "end-checkbox";
                endStationFilter.appendChild(checkbox);
                endStationFilter.appendChild(label);
                endStationFilter.appendChild(document.createElement("br"));
            }
        }

        // Add event listeners for dynamic filtering
        const startCheckboxes = document.querySelectorAll(".start-checkbox");
        const endCheckboxes = document.querySelectorAll(".end-checkbox");

        startCheckboxes.forEach((checkbox) =>
            checkbox.addEventListener("change", () => filterRoutes())
        );
        endCheckboxes.forEach((checkbox) =>
            checkbox.addEventListener("change", () => filterRoutes())
        );
    }

    // Function to filter routes based on selected start and end stations
    function filterRoutes() {
        const selectedStartStations = Array.from(
            document.querySelectorAll(".start-checkbox:checked")
        ).map((checkbox) => checkbox.value);

        const selectedEndStations = Array.from(
            document.querySelectorAll(".end-checkbox:checked")
        ).map((checkbox) => checkbox.value);

        const filteredRoutes = {};

        for (const key in topRoutes) {
            topRoutes[key].forEach((ride) => {
                if (
                    (selectedStartStations.length === 0 || selectedStartStations.includes(ride.startStation)) &&
                    (selectedEndStations.length === 0 || selectedEndStations.includes(ride.endStation))
                ) {
                    if (!filteredRoutes[key]) {
                        filteredRoutes[key] = [];
                    }
                    filteredRoutes[key].push(ride);
                }
            });
        }

        displayRoutes(filteredRoutes);
    }

    // Function to display the routes in the table
    function displayRoutes(routes) {
        let tableBody = document.querySelector("#dataTable tbody");
        tableBody.innerHTML = "";

        const sortedKeys = Object.keys(routes).sort();

        sortedKeys.forEach((key) => {
            routes[key].forEach((ride, index) => {
                let row = document.createElement("tr");
                row.className = index === 0 ? "highlight" : "";
                row.innerHTML = `
                    <td>${ride.startStation}</td>
                    <td>${ride.endStation}</td>
                    <td>${ride.duration}</td>
                    <td>Rangering ${index + 1}</td>
                `;
                tableBody.appendChild(row);
            });
        });
    }
});
