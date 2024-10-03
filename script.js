// Load the JSON data from the file (assumed to be processed by dataProcessor.js)
fetch("rides.json")
    .then(response => response.json())
    .then(data => {
        ridesData = data;  // Store data globally for reference
        populateDropdowns(ridesData);
    });

// Function to populate dropdowns dynamically
function populateDropdowns(data) {
    const startStationSet = new Set();
    const endStationSet = new Set();

    // Create unique sets of start and end stations
    data.forEach(ride => {
        startStationSet.add(ride['Start Station']);
        endStationSet.add(ride['End Station']);
    });

    // Populate start station dropdown
    const startDropdown = document.getElementById('startStation');
    startStationSet.forEach(station => {
        const option = document.createElement('option');
        option.value = station;
        option.textContent = station;
        startDropdown.appendChild(option);
    });

    // Populate end station dropdown
    const endDropdown = document.getElementById('endStation');
    endStationSet.forEach(station => {
        const option = document.createElement('option');
        option.value = station;
        option.textContent = station;
        endDropdown.appendChild(option);
    });
}

// Function to display the fastest times
function displayFastestTimes() {
    const startStation = document.getElementById('startStation').value;
    const endStation = document.getElementById('endStation').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = "";  // Clear previous results

    if (startStation && endStation) {
        // Filter the data to find matching rides
        const filteredRides = ridesData.filter(
            ride => ride['Start Station'] === startStation && ride['End Station'] === endStation
        );

        if (filteredRides.length > 0) {
            // Create a result card for the fastest times
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            resultCard.innerHTML = `
                <h3>Fastest Times: ${startStation} → ${endStation}</h3>
                <p>🥇 1st Place: ${filteredRides[0]['1st Place']} seconds</p>
                <p>🥈 2nd Place: ${filteredRides[0]['2nd Place']} seconds</p>
                <p>🥉 3rd Place: ${filteredRides[0]['3rd Place']} seconds</p>
                <p>Total Rides: ${filteredRides[0]['Total Rides']}</p>
            `;
            resultsDiv.appendChild(resultCard);
        } else {
            resultsDiv.textContent = "No data available for the selected stations.";
        }
    } else {
        resultsDiv.textContent = "Please select both a start and an end station.";
    }
}

// Event listeners
document.getElementById('showTimes').addEventListener('click', displayFastestTimes);
