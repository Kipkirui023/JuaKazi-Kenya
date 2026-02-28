const API_BASE = "http://localhost:3000/api";

const token = localStorage.getItem("juakazi_token");

const res = await fetch(`${API_BASE}/jobs?${params}`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
});

document.addEventListener("DOMContentLoaded", () => {
    loadJobs();
    updateAuthUI();

    document.getElementById("applyFilters")?.addEventListener("click", loadJobs);
    document.getElementById("searchJobs")?.addEventListener("keyup", e => {
        if (e.key === "Enter") loadJobs();
    });
});

async function loadJobs() {
    try {
        const res = await fetch(`${API_BASE}/jobs?${params}`);
        const data = await res.json();

        if (data.success) {
            displayJobs(data.jobs);
        } else {
            displayDemoJobs();
        }
    } catch (err) {
        console.error(err);
        displayDemoJobs();
    }
}

function displayJobs(jobs = []) {
    const container = document.getElementById("jobsList");
    if (!container) return;

    if (!jobs.length) {
        container.innerHTML = `<p>No jobs found.</p>`;
        return;
    }

    container.innerHTML = jobs.map(job => `
        <div class="job-card">
            <h3>${job.title}</h3>
            <p>${job.location?.county || job.location}</p>
            <p>${job.formattedSalary || "Salary negotiable"}</p>
            <button class="apply-job-btn"
                data-id="${job._id || job.id}"
                data-title="${job.title}">
                Apply Now
            </button>
        </div>
    `).join("");

    document.querySelectorAll(".apply-job-btn").forEach(btn =>
        btn.addEventListener("click", () =>
            applyForJob(btn.dataset.id, btn.dataset.title)
        )
    );
}
