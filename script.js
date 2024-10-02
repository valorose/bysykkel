document.addEventListener("DOMContentLoaded", () => {
    console.log("Document Loaded");

    // Check if the button exists
    const loadDataButton = document.getElementById("loadData");
    if (!loadDataButton) {
        console.error("Load Data button not found.");
        return;
    }

    loadDataButton.addEventListener("click", async () => {
        console.log("Load Data button clicked");

        try {
            // Fetch the data from the JSON endpoint
            let response = await fetch("https://test-java-4n67.onrender.com/rides.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

            // Parse the data
            let data = await response.json();
            console.log("Fetched Data: ", data);

            // Step 1: Create a map to store the top 3 fastest rides for each start-end pair
            let topRoutes = {};

            // Step 2: Iterate through the data and build the top 3 fastest rides for each start-end pair
            data.forEach((ride) => {
                const startStation = ride.start_station_name;
                const endStation = ride.end_station_name;
                const duration = ride.duration;

                // Create a unique key for each start-end pair
                const key = `${startStation} - ${endStation}`;

                // Initialize an empty array if this is the first time seeing this pair
                if (!topRoutes[key]) {
                    topRoutes[key] = [];
                }

                // Add the current ride to the list and sort to keep the top 3 shortest durations
                topRoutes[key].push({ startStation, endStation, duration });
                topRoutes[key].sort((a, b) => a.duration - b.duration);

                // Keep only the top 3 shortest durations
                if (topRoutes[key].length > 3) {
                    topRoutes[key].pop();
                }
            });

            // Step 3: Display the top 3 fastest routes in the table
            let tableBody = document.querySelector("#dataTable tbody");
            if (!tableBody) {
                console.error("Table body not found.");
                return;
            }

            tableBody.innerHTML = ""; // Clear any existing rows

            // Display each start-end pair and their top 3 rides
            for (const key in topRoutes) {
                topRoutes[key].forEach((ride, index) => {
                    let row = document.createElement("tr");
                    row.className = index === 0 ? "highlight" : "";  // Highlight the fastest ride
                    row.innerHTML = `
                        <td>${ride.startStation}</td>
                        <td>${ride.endStation}</td>
                        <td>${ride.duration}</td>
                        <td>Rangering ${index + 1}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }

            console.log("Top 3 fastest routes displayed successfully!");

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });
});
