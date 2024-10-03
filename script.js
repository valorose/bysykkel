document.addEventListener("DOMContentLoaded", () => {
    const loadDataButton = document.getElementById("loadData");
    let topRoutes = [];
    let allStations = {};
    let stationPairCount = {}; // Track the number of trips between each pair

    loadDataButton.addEventListener("click", async () => {
        try {
            console.log("Load Data Button Clicked");  // Debug Log
            let response = await fetch("rides.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

            let data = await response.json();
            topRoutes = [];
            allStations = {};
            stationPairCount = {};  // Reset the pair counter

            console.log("Data Successfully Loaded: ", data);  // Debug Log

            // Process and organize the data
            data.forEach((ride) => {
                const startStation = ride.start_station_name;
                const endStation = ride.end_station_name;

                if (!startStation || !endStation) {
                    console.warn("Missing Start or End Station for Ride: ", ride);  // Debug Log
                    return;
                }

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

                topRoutes.push({ startStation, endStation, duration: ride.duration });
            });

            console.log("Processed Station Pair Count: ", stationPairCount);  // Debug Log

            // Display checkboxes for Start and End stations based on the pair count
            createCheckboxes();

            // Display routes in the main table
            displayRoutes(topRoutes);

            // Display the leaderboard with the fastest times for each station pair
            displayLeaderboard(topRoutes);

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });

    function createCheckboxes() {
        const startStationFilter = document.getElementById("startStationFilter");
        const endStationFilter = document.getElementById("endStationFilter");

        // Check if the elements exist
        if (!startStationFilter || !endStationFilter) {
            console.error("Start or End Station filter elements are missing in the HTML.");
            return;
        }

        console.log("Creating checkboxes for stations...");  // Debug Log
        const startStationsWithEnoughTrips = new Set();
        const endStationsWithEnoughTrips = new Set();

        for (const key in stationPairCount) {
            if (stationPairCount[key] >= 3) {
                const [start, end] = key.split(" -> ");
                startStationsWithEnoughTrips.add(start);
                endStationsWithEnoughTrips.add(end);
            }
        }

        const sortedStartStations = Array.from(startStationsWithEnoughTrips).sort();
        const sortedEndStations = Array.from(endStationsWithEnoughTrips).sort();

        console.log("Start Stations with Enough Trips: ", sortedStartStations);  // Debug Log
        console.log("End Stations with Enough Trips: ", sortedEndStations);  // Debug Log

        sortedStartStations.forEach((station) => {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `station-${station}`;
            checkbox.value = station;

            let label = document.createElement("label");
            label.htmlFor = `station-${station}`;
            label.textContent = station;

            checkbox.className = "start-checkbox";
            startStationFilter.appendChild(checkbox);
            startStationFilter.appendChild(label);
            startStationFilter.appendChild(document.createElement("br"));
        });

        sortedEndStations.forEach((station) => {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `station-${station}`;
            checkbox.value = station;

            let label = document.createElement("label");
            label.htmlFor = `station-${station}`;
            label.textContent = station;

            checkbox.className = "end-checkbox";
            endStationFilter.appendChild(checkbox);
            endStationFilter.appendChild(label);
            endStationFilter.appendChild(document.createElement("br"));
        });

        const startCheckboxes = document.querySelectorAll(".start-checkbox");
        const endCheckboxes = document.querySelectorAll(".end-checkbox");

        console.log("Start and End Checkboxes Created");  // Debug Log
        startCheckboxes.forEach((checkbox) =>
            checkbox.addEventListener("change", () => filterRoutes())
        );
        endCheckboxes.forEach((checkbox) =>
            checkbox.addEventListener("change", () => filterRoutes())
        );
    }

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

        console.log("Filtered Routes: ", filteredRoutes);  // Debug Log
        displayRoutes(filteredRoutes);
    }

    function displayRoutes(routes) {
        let tableBody = document.querySelector("#dataTable tbody");
        
        if (!tableBody) {
            console.error("Data Table element is missing in the HTML.");
            return;
        }
        
        tableBody.innerHTML = "";

        if (routes.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>No rides available</td></tr>";
            return;
        }

        const groupedRoutes = routes.reduce((groups, ride) => {
            const key = `${ride.startStation} -> ${ride.endStation}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(ride);
            return groups;
        }, {});

        Object.keys(groupedRoutes).forEach((key) => {
            groupedRoutes[key].sort((a, b) => a.duration - b.duration);

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

    function displayLeaderboard(routes) {
        let leaderboardBody = document.querySelector("#leaderboardTable tbody");
        
        if (!leaderboardBody) {
            console.error("Leaderboard Table element is missing in the HTML.");
            return;
        }

        leaderboardBody.innerHTML = "";  // Clear existing content

        const groupedRoutes = routes.reduce((groups, ride) => {
            const key = `${ride.startStation} -> ${ride.endStation}`;
            if (!groups[key]) {
                groups[key] = { startStation: ride.startStation, endStation: ride.endStation, fastestTime: ride.duration, totalRides: 0 };
            }
            groups[key].fastestTime = Math.min(groups[key].fastestTime, ride.duration);
            groups[key].totalRides += 1;
            return groups;
        }, {});

        const sortedRoutes = Object.values(groupedRoutes).sort((a, b) => a.fastestTime - b.fastestTime);

        sortedRoutes.forEach(route => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${route.startStation}</td>
                <td>${route.endStation}</td>
                <td><strong>${route.fastestTime}</strong></td>
                <td>${route.totalRides}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }
});
