document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loadData").addEventListener("click", async () => {
        try {
            let response = await fetch("https://test-java-4n67.onrender.com/rides.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

            let data = await response.json();

            // Log the fetched data to see the structure
            console.log("Fetched Data: ", data);

            // Step 1: Create a map to store the fastest routes
            let fastestRoutes = {};

            // Step 2: Iterate through the data and find the fastest duration for each start-end pair
            data.forEach((ride) => {
                const startStation = ride.start_station_name;
                const endStation = ride.end_station_name;
                const duration = ride.duration;

                // Create a unique key for each start-end pair
                const key = `${startStation} - ${endStation}`;

                // If the key doesn't exist or we find a shorter duration, update the map
                if (!fastestRoutes[key] || duration < fastestRoutes[key].duration) {
                    fastestRoutes[key] = {
                        startStation,
                        endStation,
                        duration
                    };
                }
            });

            // Log the fastest routes for debugging
            console.log("Fastest Routes: ", fastestRoutes);

            // Step 3: Display the fastest routes in the table
            let tableBody = document.querySelector("#dataTable tbody");
            tableBody.innerHTML = ""; // Clear any existing rows

            // Loop through the fastest routes and add them to the table
            for (const key in fastestRoutes) {
                const ride = fastestRoutes[key];
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${ride.startStation}</td>
                    <td>${ride.endStation}</td>
                    <td>${ride.duration}</td>
                `;
                tableBody.appendChild(row);
            }

            console.log("Fastest routes successfully displayed in the table!");

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });
});
