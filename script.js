document.addEventListener("DOMContentLoaded", () => {
    const loadDataButton = document.getElementById("loadData");
    const searchInput = document.getElementById("searchInput");
    let topRoutes = {};

    loadDataButton.addEventListener("click", async () => {
        try {
            let response = await fetch("https://test-java-4n67.onrender.com/rides.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

            let data = await response.json();
            topRoutes = {};

            // Step 1: Create a map to store the top 3 fastest rides for each start-end pair
            data.forEach((ride) => {
                const startStation = ride.start_station_name;
                const endStation = ride.end_station_name;
                const duration = ride.duration;

                const key = `${startStation} - ${endStation}`;
                if (!topRoutes[key]) {
                    topRoutes[key] = [];
                }

                topRoutes[key].push({ startStation, endStation, duration });
                topRoutes[key].sort((a, b) => a.duration - b.duration);

                if (topRoutes[key].length > 3) {
                    topRoutes[key].pop();
                }
            });

            displayRoutes(topRoutes);

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });

    // Function to display filtered or full top routes
    function displayRoutes(routes) {
        let tableBody = document.querySelector("#dataTable tbody");
        tableBody.innerHTML = "";

        for (const key in routes) {
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
        }
    }

    // Filter routes based on the search input
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredRoutes = {};

        for (const key in topRoutes) {
            if (key.toLowerCase().includes(searchTerm)) {
                filteredRoutes[key] = topRoutes[key];
            }
        }

        displayRoutes(filteredRoutes);
    });
});
