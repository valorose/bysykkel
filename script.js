document.addEventListener("DOMContentLoaded", () => {
    const loadDataButton = document.getElementById("loadData");
    let topRoutes = [];
    let allStations = {};
    let stationPairCount = {}; // Track the number of trips between each pair

    loadDataButton.addEventListener("click", async () => {
        try {
            let response = await fetch("rides.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

            let data = await response.json();
            topRoutes = [];
            allStations = {};
            stationPairCount = {};  // Reset the pair counter

            // Process and organize the data
            data.forEach((ride) => {
                const startStation = ride.start_station_name;
                const endStation = ride.end_station_name;

                // Skip rides that have missing station names
                if (!startStation || !endStation) return;

                // Store unique stations
                if (!allStations[startStation]) {
                    allStations[startStation] = "start";
                }
                if (!allStations[endStation]) {
                    allStations[endStation] = "end";
                }

                // Track the number of trips between each start-end pair
                const key = `${startStation} -> ${endStation}`;
                if (!stationPairCount[key]) {
                    stationPairCount[key] = 0;
                }
                stationPairCount[key] += 1;

                // Push each ride directly into topRoutes array
                topRoutes.push({ startStation, endStation, duration: ride.duration });
            });

            console.log("Station Pair Count:", stationPairCount);  // Debugging statement

            // Display checkboxes for Start and End stations based on the pair count
            createCheckboxes();

            // Display full dataset in the table initially
            displayRoutes(topRoutes);

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });

    function createCheckboxes() {
        const startStationFilter = document.getElementById("startStationFilter");
        const endStationFilter = document.getElementById("endStationFilter");

        // Filter stations that have more than three trips from station to station
        const startStationsWithEnoughTrips = new Set();
        const endStationsWithEnoughTrips = new Set();

        // Check each pair and add only stations that meet the threshold
        for (const key in stationPairCount) {
            if (stationPairCount[key] >= 3) {
                const [start, end] = key.split(" -> ");
                startStationsWithEnoughTrips.add(start);
                endStationsWithEnoughTrips.add(end);
            }
        }

        // Convert sets to arrays and sort them alphabetically
        const sortedStartStations = Array.from(startStationsWithEnoughTrips).sort();
        const sortedEndStations = Array.from(endStationsWithEnoughTrips).sort();

        // Create checkboxes for each start station that meets the trip count condition
        sortedStartStations.forEach((station) => {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `station-${station}`;
            checkbox.value = station;

            // Label for the checkbox
            let label = document.createElement("label");
            label.htmlFor = `station-${station}`;
            label.textContent = station;

            checkbox.className = "start-checkbox";
            startStationFilter.appendChild(checkbox);
            startStationFilter.appendChild(label);
            startStationFilter.appendChild(document.createElement("br"));
        });

        // Create checkboxes for each end station that meets the trip count condition
        sortedEndStations.forEach((station) => {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `station-${station}`;
            checkbox.value = station;

            // Label for the checkbox
            let label = document.createElement("label");
            label.htmlFor = `station-${station}`;
            label.textContent = station;

            checkbox.className = "end-checkbox";
            endStationFilter.appendChild(checkbox);
            endStationFilter.appendChild(label);
            endStationFilter.appendChild(document.createElement("br"));
        });

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

        const filteredRoutes = topRoutes.filter(
            (ride) =>
                (selectedStartStations.length === 0 || selectedStartStations.includes(ride.startStation)) &&
                (selectedEndStations.length === 0 || selectedEndStations.includes(ride.endStation))
        );

        console.log("Filtered routes:", filteredRoutes);  // Debugging statement
        displayRoutes(filteredRoutes);
    }

    // Updated Function to display the routes in the table
    function displayRoutes(routes) {
        let tableBody = document.querySelector("#dataTable tbody");
        tableBody.innerHTML = "";

        console.log("Displaying routes:", routes);  // Debugging statement

        if (routes.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>No rides available</td></tr>";
            return;
        }

        // Group routes by start-end pairs
        const groupedRoutes = routes.reduce((groups, ride) => {
            const key = `${ride.startStation} -> ${ride.endStation}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(ride);
            return groups;
        }, {});

        // Display each group separately
        Object.keys(groupedRoutes).forEach((key) => {
            groupedRoutes[key].sort((a, b) => a.duration - b.duration);  // Sort within each group

            groupedRoutes[key].forEach((ride, index) => {
                let row = document.createElement("tr");
                row.className = index === 0 ? "highlight" : "";
                row.innerHTML = `
                    <td>${ride.startStation}</td>
                    <td>${ride.endStation}</td>
                    <td>${ride.duration}</td>
                    <td>${index === 0 ? '🥇 1st Place' : index === 1 ? '🥈 2nd Place' : index === 2 ? '🥉 3rd Place' : ''}</td>
                `;
                tableBody.appendChild(row);
            });
        });
    }
});
