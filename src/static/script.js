document.addEventListener('DOMContentLoaded', function() {
    fetchActivities();
});

async function fetchActivities() {
    try {
        const response = await fetch('/activities');
        const activities = await response.json();
        displayActivities(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
}

function displayActivities(activities) {
    const container = document.getElementById('activities-container');
    container.innerHTML = '';

    for (const [activityName, activityData] of Object.entries(activities)) {
        const card = createActivityCard(activityName, activityData);
        container.appendChild(card);
    }
}

function createActivityCard(name, data) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    
    const participantsList = data.participants.length > 0 
        ? data.participants.map(email => `<li>${email}</li>`).join('')
        : '<div class="no-participants">No participants yet</div>';

    card.innerHTML = `
        <div class="activity-title">${name}</div>
        <div class="activity-description">${data.description}</div>
        <div class="activity-schedule">📅 ${data.schedule}</div>
        <div class="activity-capacity">
            Capacity: ${data.participants.length}/${data.max_participants}
        </div>
        
        <div class="participants-section">
            <div class="participants-title">Current Participants</div>
            ${data.participants.length > 0 
                ? `<ul class="participants-list">${participantsList}</ul>`
                : participantsList
            }
        </div>
        
        <div class="signup-section">
            <form class="signup-form" onsubmit="signupForActivity(event, '${name}')">
                <input 
                    type="email" 
                    class="signup-input" 
                    placeholder="Enter your email" 
                    required
                    ${data.participants.length >= data.max_participants ? 'disabled' : ''}
                >
                <button 
                    type="submit" 
                    class="signup-btn"
                    ${data.participants.length >= data.max_participants ? 'disabled' : ''}
                >
                    ${data.participants.length >= data.max_participants ? 'Full' : 'Sign Up'}
                </button>
            </form>
        </div>
    `;
    
    return card;
}

async function signupForActivity(event, activityName) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    try {
        const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}`
        });
        
        if (response.ok) {
            alert(`Successfully signed up for ${activityName}!`);
            fetchActivities(); // Refresh the activities display
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    } catch (error) {
        console.error('Error signing up:', error);
        alert('An error occurred while signing up');
    }
}
