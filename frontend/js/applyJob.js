async function applyForJob(jobId, jobTitle) {
    const token = localStorage.getItem("juakazi_token");
    const user = JSON.parse(localStorage.getItem("juakazi_user") || "null");

    if (!token || !user?.id) {
        alert("Please login as a worker to apply.");
        return;
    }

    if (user.userType !== "worker") {
        alert("Only workers can apply for jobs.");
        return;
    }

    const coverMessage = prompt(`Why apply for "${jobTitle}"?`) || "";

    try {
        const res = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ coverMessage })
        });

        const data = await res.json();
        alert(res.ok ? "Application sent!" : data.message);
    } catch {
        alert("Network error. Try again.");
    }
}
