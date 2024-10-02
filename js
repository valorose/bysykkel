document.getElementById("loadData").addEventListener("click", () => {
    const data = [
        { name: "Alice", age: 25, location: "New York" },
        { name: "Bob", age: 30, location: "Paris" },
        { name: "Charlie", age: 28, location: "London" }
    ];

    let tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = ""; // Clear any existing data

    // Populate the table with new data
    data.forEach(row => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.name}</td>
            <td>${row.age}</td>
            <td>${row.location}</td>
        `;
        tableBody.appendChild(tr);
    });
});
