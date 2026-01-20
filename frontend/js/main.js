// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the application
    initApp();
});

function initApp() {
    // Check if user is logged in
    checkAuthStatus();

    // Initialize event listeners
    initEventListeners();

    // Load initial data
    loadFeaturedJobs();
}

function checkAuthStatus() {
    const token = localStorage.getItem('juakazi_token');
    const userData = localStorage.getItem('juakazi_user');

    if (token && userData) {
        // User is logged in
        const user = JSON.parse(userData);
        showUserMenu(user);
    } else {
        // User is not logged in
        showAuthButtons();
    }
}

function showUserMenu(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');

    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) {
        userMenu.style.display = 'flex';
        document.getElementById('userName').textContent = user.name.split(' ')[0];
        if (user.avatar) {
            document.getElementById('userAvatar').src = user.avatar;
        }
    }
}

function showAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');

    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

function initEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showLoginModal());
    }

    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => showRegisterModal());
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Menu toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

async function loadFeaturedJobs() {
    try {
        const response = await fetch('http://localhost:3000/api/jobs/featured');
        const jobs = await response.json();

        const container = document.getElementById('jobsContainer');
        if (container && jobs.length > 0) {
            container.innerHTML = jobs.map(job => createJobCard(job)).join('');
        }
    } catch (error) {
        console.error('Error loading featured jobs:', error);
        // Fallback to sample data
        loadSampleJobs();
    }
}

function createJobCard(job) {
    const date = new Date(job.createdAt).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short'
    });

    return `
        <div class="job-card">
            <div class="job-header">
                <h3 class="job-title">${job.title}</h3>
                <span class="job-type">${job.type}</span>
            </div>
            <div class="job-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${job.location}</span>
            </div>
            <div class="job-salary">
                KSh ${job.salary.toLocaleString()}
            </div>
            <div class="job-skills">
                ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="job-footer">
                <small>Posted ${date}</small>
                <button class="btn btn-primary btn-sm apply-btn" data-id="${job.id}">
                    Apply Now
                </button>
            </div>
        </div>
    `;
}

function loadSampleJobs() {
    const sampleJobs = [
        {
            id: 1,
            title: 'Plumber Needed',
            type: 'Casual',
            location: 'Nairobi, Westlands',
            salary: 2500,
            skills: ['Plumbing', 'Pipe Fitting'],
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            title: 'House Cleaning',
            type: 'Part-time',
            location: 'Mombasa, Nyali',
            salary: 1500,
            skills: ['Cleaning', 'Housekeeping'],
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            title: 'Electrician',
            type: 'Full-time',
            location: 'Kisumu',
            salary: 5000,
            skills: ['Electrical', 'Wiring'],
            createdAt: new Date().toISOString()
        }
    ];

    const container = document.getElementById('jobsContainer');
    if (container) {
        container.innerHTML = sampleJobs.map(job => createJobCard(job)).join('');
    }
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Login to JuaKazi</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginPhone">Phone Number</label>
                        <input type="tel" id="loginPhone" placeholder="07XX XXX XXX" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Login</button>
                        <button type="button" class="btn btn-outline" onclick="showRegisterModal()">
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        `;
        modal.style.display = 'flex';

        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.querySelector('#loginForm').addEventListener('submit', handleLogin);
    }
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Join JuaKazi</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="registerForm">
                    <div class="form-group">
                        <label>I am a:</label>
                        <div class="radio-group">
                            <label>
                                <input type="radio" name="userType" value="worker" checked>
                                Worker
                            </label>
                            <label>
                                <input type="radio" name="userType" value="employer">
                                Employer
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="regName">Full Name</label>
                        <input type="text" id="regName" required>
                    </div>
                    <div class="form-group">
                        <label for="regPhone">Phone Number</label>
                        <input type="tel" id="regPhone" placeholder="07XX XXX XXX" required>
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Email (Optional)</label>
                        <input type="email" id="regEmail">
                    </div>
                    <div class="form-group">
                        <label for="regLocation">Location</label>
                        <select id="regLocation" required>
                            <option value="">Select County</option>
                            <option value="Nairobi">Nairobi</option>
                            <option value="Mombasa">Mombasa</option>
                            <option value="Kisumu">Kisumu</option>
                            <option value="Nakuru">Nakuru</option>
                            <!-- Add all 47 counties -->
                        </select>
                    </div>
                    <div class="form-group worker-fields">
                        <label for="regSkills">Skills</label>
                        <input type="text" id="regSkills" placeholder="e.g., Plumbing, Electrical">
                    </div>
                    <div class="form-group">
                        <label for="regPassword">Password</label>
                        <input type="password" id="regPassword" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Register</button>
                    </div>
                </form>
            </div>
        `;
        modal.style.display = 'flex';

        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Show/hide worker fields based on user type
        modal.querySelectorAll('input[name="userType"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const workerFields = modal.querySelector('.worker-fields');
                workerFields.style.display = this.value === 'worker' ? 'block' : 'none';
            });
        });

        modal.querySelector('#registerForm').addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save token and user data
            localStorage.setItem('juakazi_token', data.token);
            localStorage.setItem('juakazi_user', JSON.stringify(data.user));

            // Update UI
            showUserMenu(data.user);

            // Close modal
            document.getElementById('loginModal').style.display = 'none';

            // Show success message
            showNotification('Login successful!', 'success');
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const userType = document.querySelector('input[name="userType"]:checked').value;
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const location = document.getElementById('regLocation').value;
    const skills = userType === 'worker' ? document.getElementById('regSkills').value.split(',') : [];
    const password = document.getElementById('regPassword').value;

    const userData = {
        userType,
        name,
        phone,
        email,
        location,
        skills,
        password
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            document.getElementById('registerModal').style.display = 'none';
            showLoginModal();
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('juakazi_token');
    localStorage.removeItem('juakazi_user');
    showAuthButtons();
    showNotification('Logged out successfully', 'success');
}

function handleSearch() {
    const jobSearch = document.getElementById('jobSearch').value;
    const locationSearch = document.getElementById('locationSearch').value;

    if (!jobSearch && !locationSearch) {
        showNotification('Please enter search criteria', 'warning');
        return;
    }

    // Redirect to jobs page with search parameters
    const params = new URLSearchParams();
    if (jobSearch) params.append('q', jobSearch);
    if (locationSearch) params.append('location', locationSearch);

    window.location.href = `jobs.html?${params.toString()}`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#2E8B57' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    // Add close button functionality
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });

    // Add to document
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);