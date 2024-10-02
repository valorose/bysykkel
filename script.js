document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loadData").addEventListener("click", async () => {
        try {
            // Fetch the JSON file using the full URL
            let response = await fetch("https://test-java-4n67.onrender.com/rides.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

            let data = await response.json();
            console.log("Fetched Data: ", data); // Check if data is correctly fetched

            // Select the table body
            let tableBody = document.querySelector("#dataTable tbody");
            tableBody.innerHTML = ""; // Clear any existing rows

            // Display the data in the table
            data.forEach((ride) => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${ride.start_station_name}</td>
                    <td>${ride.end_station_name}</td>
                    <td>${ride.duration}</td>
                `;
                tableBody.appendChild(row);
            });

            console.log("Data successfully displayed in the table!");

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });
});
