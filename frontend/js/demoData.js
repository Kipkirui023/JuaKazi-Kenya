function displayDemoJobs() {
    const demoJobs = [
        {
            id: 1,
            title: "Urgent Plumber Needed",
            location: "Nairobi",
            formattedSalary: "KSh 2,500/day"
        }
    ];
    displayJobs(demoJobs);
    document.getElementById("jobsCount").textContent =
        `${demoJobs.length} Jobs Found`;
}
