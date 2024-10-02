// dataProcessor.js

// Assume this is the data you fetched from the API, formatted as JSON
let rideData = [
  { "Start Station": "Cornerteateret", "End Station": "Krohnviken", "Duration (seconds)": "337" },
  { "Start Station": "Møllendalsplass", "End Station": "C. Sundts gate", "Duration (seconds)": "732" }
  // ... Add more data as needed for testing
];

// Step 1: Organize Data into a Structured Format
let structuredData = rideData.map((ride) => ({
  startStation: ride["Start Station"],
  endStation: ride["End Station"],
  duration: parseInt(ride["Duration (seconds)"])
}));

// Display the structured data in the console
console.log("Structured Data: ", structuredData);
