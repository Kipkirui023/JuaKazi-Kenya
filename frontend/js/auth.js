function updateAuthUI() {
    const token = localStorage.getItem("juakazi_token");
    const user = JSON.parse(localStorage.getItem("juakazi_user") || "null");

    document.querySelector(".auth-buttons")?.classList.toggle("hidden", !!token);
    document.querySelector(".user-menu")?.classList.toggle("hidden", !token);

    if (user) {
        document.getElementById("userName")?.textContent =
            user.name || user.phone || "User";
    }
}

function logout() {
    localStorage.clear();
    updateAuthUI();
    loadJobs();
}
