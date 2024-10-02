document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loadData").addEventListener("click", async () => {
        try {
            let response = await fetch("https://test-java-4n67.onrender.com/rides.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

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

            // Step 3: Display the top 3 fastest routes in a more user-friendly format
            let tableBody = document.querySelector("#dataTable tbody");
            tableBody.innerHTML = ""; // Clear any existing rows

            // Display each start-end pair and their top 3 rides with a clear separation
            for (const key in topRoutes) {
                // Add a header row for each start-end pair
                let headerRow = document.createElement("tr");
                headerRow.innerHTML = `
                    <td colspan="4" style="font-weight: bold; background-color: #f2f2f2;">${key}</td>
                `;
                tableBody.appendChild(headerRow);

                // Display each of the top 3 rides for this start-end pair
                topRoutes[key].forEach((ride, index) => {
                    let row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${ride.startStation}</td>
                        <td>${ride.endStation}</td>
                        <td>${ride.duration}</td>
                        <td>Rank ${index + 1}</td>
                    `;
                    tableBody.appendChild(row);
                });

                // Add a blank row for spacing between different route groups
                let spacerRow = document.createElement("tr");
                spacerRow.innerHTML = `<td colspan="4" style="height: 10px;"></td>`;
                tableBody.appendChild(spacerRow);
            }

            console.log("Top 3 fastest routes displayed successfully!");

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });
});
