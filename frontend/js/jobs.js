
// Post Job Form Handler
document.getElementById('postJobForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form values
    const jobData = {
        title: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        type: document.getElementById('jobType').value,
        category: document.getElementById('jobCategory').value,
        location: {
            county: document.getElementById('jobCounty').value,
            town: document.getElementById('jobLocation').value || ''
        },
        salary: {
            amount: parseInt(document.getElementById('jobSalary').value),
            period: document.querySelector('input[name="salaryPeriod"]:checked').value,
            currency: 'KES'
        },
        skills: document.getElementById('jobSkills').value
            ? document.getElementById('jobSkills').value.split(',').map(s => s.trim())
            : [],
        employer: document.getElementById('contactName').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactWhatsApp: document.getElementById('contactWhatsApp').value || '',
        urgent: document.getElementById('urgentJob').checked
    };

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    submitBtn.disabled = true;

    try {
        // Send to backend API
        const response = await fetch('http://localhost:3000/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });

        const result = await response.json();

        if (response.ok) {
            // Show success modal
            document.getElementById('postedJobId').textContent = result.job?.id || '12345';
            document.getElementById('successModal').style.display = 'flex';

            // Reset form
            document.getElementById('postJobForm').reset();
        } else {
            alert(result.message || 'Failed to post job. Please try again.');
        }
    } catch (error) {
        console.error('Error posting job:', error);
        alert('Network error. Please check your connection and try again.');

        // Demo mode - show success anyway for testing
        document.getElementById('postedJobId').textContent = 'DEMO-' + Date.now();
        document.getElementById('successModal').style.display = 'flex';
        document.getElementById('postJobForm').reset();
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Close modal handler
document.querySelector('.close-modal')?.addEventListener('click', function () {
    document.getElementById('successModal').style.display = 'none';
});

// Close modal when clicking outside
document.getElementById('successModal')?.addEventListener('click', function (e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

// Auto-format phone numbers
document.getElementById('contactPhone').addEventListener('input', function (e) {
    this.value = this.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
});

document.getElementById('contactWhatsApp').addEventListener('input', function (e) {
    this.value = this.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
});
