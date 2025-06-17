let sessionStartTime = null;
let sessionInterval = null;
let clockInterval = null;

const SESSION_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Update digital time
    const digitalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('digital-time').textContent = digitalTime;
    
    // Calculate angles for hands (12-hour display)
    const hourAngle = ((hours % 12) * 30) + (minutes * 0.5) - 90;
    const minuteAngle = (minutes * 6) + (seconds * 0.1) - 90;
    const secondAngle = (seconds * 6) - 90;
    
    // Update clock hands
    updateHand('hour-hand', hourAngle, 80);
    updateHand('minute-hand', minuteAngle, 130);
    updateHand('second-hand', secondAngle, 150);
}

function updateHand(handId, angle, length) {
    const hand = document.getElementById(handId);
    const radians = (angle * Math.PI) / 180;
    const x2 = 200 + length * Math.cos(radians);
    const y2 = 200 + length * Math.sin(radians);
    hand.setAttribute('x2', x2);
    hand.setAttribute('y2', y2);
}

function createArc(startAngle, endAngle, elementId) {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const radius = 170;
    const centerX = 200;
    const centerY = 200;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    // Determine if we need a large arc (more than 180 degrees)
    const angleDiff = endAngle - startAngle;
    const largeArcFlag = angleDiff > 180 ? 1 : 0;
    
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    
    const arc = document.getElementById(elementId);
    if (arc) {
        arc.setAttribute('d', pathData);
        arc.style.opacity = '0.8';
    }
}

function updateSessionArcs() {
    if (!sessionStartTime) return;
    
    const now = new Date();
    const currentHour = now.getHours() + (now.getMinutes() / 60);
    const startHour = sessionStartTime.getHours() + (sessionStartTime.getMinutes() / 60);
    const endHour = (startHour + 5) % 24;
    
    // Convert to 12-hour clock angles
    const startAngle = ((startHour % 12) * 30) - 90;
    const currentAngle = ((currentHour % 12) * 30) - 90;
    let endAngle = ((endHour % 12) * 30) - 90;
    
    // Handle wrap-around
    let adjustedCurrentAngle = currentAngle;
    let adjustedEndAngle = endAngle;
    
    if (adjustedEndAngle < startAngle) {
        adjustedEndAngle += 360;
    }
    if (adjustedCurrentAngle < startAngle) {
        adjustedCurrentAngle += 360;
    }
    
    // Always show the full 5-hour arc in green initially
    createArc(startAngle, adjustedEndAngle, 'session-arc-remaining');
    
    // Create elapsed arc (blue) from start to current position (overlays on green)
    if (adjustedCurrentAngle > startAngle && adjustedCurrentAngle <= adjustedEndAngle) {
        createArc(startAngle, adjustedCurrentAngle, 'session-arc-elapsed');
    } else {
        // Hide elapsed arc if no time has passed
        document.getElementById('session-arc-elapsed').style.opacity = '0';
    }
}

function startSession() {
    sessionStartTime = new Date();
    
    // Initialize arcs
    updateSessionArcs();
    
    // Update UI
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('end-btn').style.display = 'inline-block';
    document.getElementById('reset-btn').style.display = 'inline-block';
    document.getElementById('session-info').style.display = 'block';
    document.getElementById('status-bar').style.display = 'flex';
    
    // Set session start time
    const startTimeStr = sessionStartTime.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('session-start-time').textContent = startTimeStr;
    
    // Start session timer
    sessionInterval = setInterval(updateSessionProgress, 1000);
    updateSessionProgress();
}

function updateSessionProgress() {
    if (!sessionStartTime) return;
    
    const now = new Date();
    const elapsed = now - sessionStartTime;
    const remaining = SESSION_DURATION - elapsed;
    
    if (remaining <= 0) {
        endSession();
        return;
    }
    
    // Update the dual-color arcs
    updateSessionArcs();
    
    // Calculate progress percentage
    const progress = (elapsed / SESSION_DURATION) * 100;
    document.getElementById('progress-percent').textContent = `${Math.floor(progress)}%`;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Format times
    const elapsedStr = formatTime(elapsed);
    const remainingStr = formatTime(remaining);
    
    document.getElementById('elapsed-time').textContent = elapsedStr;
    document.getElementById('remaining-time').textContent = remainingStr;
    document.getElementById('status-remaining').textContent = remainingStr;
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function endSession() {
    if (sessionInterval) {
        clearInterval(sessionInterval);
        sessionInterval = null;
    }
    
    sessionStartTime = null;
    
    // Hide both session arcs
    document.getElementById('session-arc-elapsed').style.opacity = '0';
    document.getElementById('session-arc-remaining').style.opacity = '0';
    
    // Reset UI
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('end-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'none';
    document.getElementById('session-info').style.display = 'none';
    document.getElementById('status-bar').style.display = 'none';
    
    // Reset progress
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-percent').textContent = '0%';
}

function resetSession() {
    endSession();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Start clock
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
    
    // Add event listeners
    document.getElementById('start-btn').addEventListener('click', startSession);
    document.getElementById('end-btn').addEventListener('click', endSession);
    document.getElementById('reset-btn').addEventListener('click', resetSession);
});

// Prevent window from being closed accidentally
window.addEventListener('beforeunload', (e) => {
    if (sessionStartTime) {
        e.preventDefault();
        e.returnValue = '';
    }
});