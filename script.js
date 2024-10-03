document.addEventListener("DOMContentLoaded", () => {
    // Fix Encoding Function
    function fixEncoding(text) {
        try {
            return decodeURIComponent(escape(text));
        } catch {
            return text; // In case of an encoding issue, return the original text
        }
    }

    const loadDataButton = document.getElementById("loadData");
    let topRoutes = [];
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
            stationPairCount = {};  // Reset the pair counter

            console.log("Data Successfully Loaded: ", data);  // Debug Log

            // Process and organize the data
            data.forEach((ride) => {
                // Apply encoding fix to station names
                const startStation = fixEncoding(ride.start_station_name);
                const endStation = fixEncoding(ride.end_station_name);

                if (!startStation || !endStation) {
                    console.warn("Missing Start or End Station for Ride: ", ride);  // Debug Log
                    return;
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

            // Display routes in the main table
            displayRoutes(topRoutes);

            // Display the leaderboard with the fastest times for each station pair
            displayLeaderboard(topRoutes);

        } catch (error) {
            console.error("Error loading data: ", error);
            alert("Failed to load data. Please try again later.");
        }
    });

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
