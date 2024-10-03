document.addEventListener("DOMContentLoaded", () => {
    function fixEncoding(text) {
        try {
            return decodeURIComponent(escape(text));
        } catch {
            return text;
        }
    }

    const loadDataButton = document.getElementById("loadData");
    let topRoutes = [];
    let stationPairCount = {};

    loadDataButton.addEventListener("click", async () => {
        try {
            let response = await fetch("rides.json");
            if (!response.ok) throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);

            let data = await response.json();
            topRoutes = [];
            stationPairCount = {};

            data.forEach((ride) => {
                const startStation = fixEncoding(ride.start_station_name);
                const endStation = fixEncoding(ride.end_station_name);
                if (!startStation || !endStation) return;

                const key = `${startStation} -> ${endStation}`;
                if (!stationPairCount[key]) stationPairCount[key] = 0;
                stationPairCount[key] += 1;

                topRoutes.push({ startStation, endStation, duration: ride.duration });
            });

            displayRoutes(topRoutes);
            displayLeaderboard(topRoutes);
            populateDropdowns(stationPairCount);
        } catch (error) {
            console.error("Error loading data: ", error);
            alert("Failed to load data. Please try again later.");
        }
    });

    function populateDropdowns(stationPairs) {
        const startDropdown = document.getElementById("startStation");
        const endDropdown = document.getElementById("endStation");

        Object.keys(stationPairs).forEach(pair => {
            const [startStation, endStation] = pair.split(" -> ");
            if (!startDropdown.querySelector(`option[value="${startStation}"]`)) {
                startDropdown.appendChild(new Option(startStation, startStation));
            }
            if (!endDropdown.querySelector(`option[value="${endStation}"]`)) {
                endDropdown.appendChild(new Option(endStation, endStation));
            }
        });
    }

    function displayRoutes(routes) {
        const tableBody = document.querySelector("#dataTable tbody");
        tableBody.innerHTML = "";

        if (routes.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>No rides available</td></tr>";
            return;
        }

        const groupedRoutes = routes.reduce((groups, ride) => {
            const key = `${ride.startStation} -> ${ride.endStation}`;
            if (!groups[key]) groups[key] = [];
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
        leaderboardBody.innerHTML = "";

        const groupedRoutes = routes.reduce((groups, ride) => {
            const key = `${ride.startStation} -> ${ride.endStation}`;
            if (!groups[key]) {
                groups[key] = { startStation: ride.startStation, endStation: ride.endStation, fastestTime: ride.duration, totalRides: 1 };
            } else {
                groups[key].fastestTime = Math.min(groups[key].fastestTime, ride.duration);
                groups[key].totalRides += 1;
            }
            return groups;
        }, {});

        const filteredRoutes = Object.values(groupedRoutes).filter(route => route.totalRides >= 10);
        const sortedRoutes = filteredRoutes.sort((a, b) => a.fastestTime - b.fastestTime);

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
