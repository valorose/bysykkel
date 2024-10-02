document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loadData").addEventListener("click", async () => {
        try {
            // Fetch the JSON file from the same directory
            let response = await fetch("rides.json"); // Make sure the filename matches exactly
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }
            let data = await response.json();

            // Select the table body
            let tableBody = document.querySelector("#dataTable tbody");
            tableBody.innerHTML = ""; // Clear any existing rows

            // Iterate over each ride and create a new row in the table
            data.forEach((ride) => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${ride.start_station_name}</td>
                    <td>${ride.end_station_name}</td>
                    <td>${ride.duration}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });
});
