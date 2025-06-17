let sessionStartTime = null;
let sessionInterval = null;
let clockInterval = null;
let currentSessionIndex = null;

const SESSION_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

// Session Manager for localStorage
const SessionManager = {
    STORAGE_KEY: 'cc_timer_sessions',
    
    getTodayKey() {
        // Use UTC date as key to sync with Claude server time
        const today = new Date();
        return today.toISOString().split('T')[0];
    },
    
    loadTodaySessions() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return { date: this.getTodayKey(), sessions: [] };
        
        const stored = JSON.parse(data);
        // Check if it's today's data
        if (stored.date !== this.getTodayKey()) {
            // Reset for new day
            return { date: this.getTodayKey(), sessions: [] };
        }
        return stored;
    },
    
    saveSessions(sessions) {
        const data = {
            date: this.getTodayKey(),
            sessions: sessions
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    addSession(startTime) {
        const data = this.loadTodaySessions();
        const sessionIndex = data.sessions.length;
        
        if (sessionIndex >= 5) {
            alert('Maximum 5 sessions per day reached!');
            return null;
        }
        
        data.sessions.push({
            startTime: startTime.toISOString(),
            endTime: null,
            progress: 0
        });
        
        this.saveSessions(data.sessions);
        return sessionIndex;
    },
    
    updateSession(index, updates) {
        const data = this.loadTodaySessions();
        if (data.sessions[index]) {
            Object.assign(data.sessions[index], updates);
            this.saveSessions(data.sessions);
        }
    },
    
    getCurrentSession() {
        const data = this.loadTodaySessions();
        // Find the active session (no endTime)
        const activeIndex = data.sessions.findIndex(s => !s.endTime);
        if (activeIndex !== -1) {
            return { index: activeIndex, session: data.sessions[activeIndex] };
        }
        return null;
    }
};

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

function updateDailySessions() {
    const data = SessionManager.loadTodaySessions();
    
    // Update date display
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    document.getElementById('sessions-date').textContent = dateStr;
    
    // Update each session slot
    for (let i = 0; i < 5; i++) {
        const session = data.sessions[i];
        const timeElement = document.getElementById(`session-${i + 1}-time`);
        const progressElement = document.getElementById(`session-${i + 1}-progress`);
        const itemElement = document.getElementById(`session-${i + 1}`);
        
        if (session) {
            // Show start time in 12-hour format
            const startTime = new Date(session.startTime);
            const timeStr = startTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            timeElement.textContent = timeStr;
            
            // Update progress
            const progress = session.progress || 0;
            progressElement.style.width = `${progress}%`;
            
            // Add active class if this is current session
            if (i === currentSessionIndex && !session.endTime) {
                itemElement.classList.add('active');
            } else {
                itemElement.classList.remove('active');
            }
            
            // Show blue overlay for elapsed time
            if (progress > 0) {
                progressElement.style.setProperty('--progress', `${progress}%`);
            }
        } else {
            // Empty slot
            timeElement.textContent = '--:--';
            progressElement.style.width = '0%';
            itemElement.classList.remove('active');
        }
    }
    
    // Update total time
    updateTotalTime();
}

function updateTotalTime() {
    const data = SessionManager.loadTodaySessions();
    let totalMs = 0;
    
    data.sessions.forEach(session => {
        if (session.endTime) {
            // Completed session
            totalMs += new Date(session.endTime) - new Date(session.startTime);
        } else if (currentSessionIndex !== null) {
            // Active session
            totalMs += Date.now() - new Date(session.startTime);
        }
    });
    
    document.getElementById('total-time').textContent = formatTime(totalMs);
}

function startSession() {
    // Prevent multiple sessions at once
    if (currentSessionIndex !== null && sessionStartTime !== null) {
        alert('A session is already running!');
        return;
    }
    
    sessionStartTime = new Date();
    
    // Check for existing active session
    const existing = SessionManager.getCurrentSession();
    if (existing) {
        // Resume existing session
        currentSessionIndex = existing.index;
        sessionStartTime = new Date(existing.session.startTime);
    } else {
        // Create new session
        currentSessionIndex = SessionManager.addSession(sessionStartTime);
        if (currentSessionIndex === null) {
            return; // Max sessions reached
        }
    }
    
    // Initialize arcs
    updateSessionArcs();
    
    // Update UI - Hide start button, show session info
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('session-info').style.display = 'block';
    
    // Update daily sessions display
    updateDailySessions();
    
    // Start session timer
    sessionInterval = setInterval(updateSessionProgress, 1000);
    updateSessionProgress();
}

function updateSessionProgress() {
    if (!sessionStartTime || currentSessionIndex === null) return;
    
    const now = new Date();
    const elapsed = now - sessionStartTime;
    const remaining = SESSION_DURATION - elapsed;
    
    if (remaining <= 0) {
        // Session complete - show 100% progress before ending
        document.getElementById('progress-percent').textContent = '100%';
        document.getElementById('progress-fill').style.width = '100%';
        SessionManager.updateSession(currentSessionIndex, { progress: 100 });
        updateDailySessions();
        
        // Wait a moment to show completion
        setTimeout(() => {
            endSession();
        }, 1000);
        return;
    }
    
    // Update the dual-color arcs
    updateSessionArcs();
    
    // Calculate progress percentage
    const progress = (elapsed / SESSION_DURATION) * 100;
    document.getElementById('progress-percent').textContent = `${Math.floor(progress)}%`;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Update session in storage
    SessionManager.updateSession(currentSessionIndex, { progress });
    
    // Update daily sessions display
    updateDailySessions();
    
    // Format times
    const elapsedStr = formatTime(elapsed);
    const remainingStr = formatTime(remaining);
    
    document.getElementById('elapsed-time').textContent = elapsedStr;
    document.getElementById('remaining-time').textContent = remainingStr;
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
    
    // Mark session as complete in storage
    if (currentSessionIndex !== null) {
        SessionManager.updateSession(currentSessionIndex, { 
            endTime: new Date().toISOString(),
            progress: 100
        });
    }
    
    sessionStartTime = null;
    currentSessionIndex = null;
    
    // Hide both session arcs
    document.getElementById('session-arc-elapsed').style.opacity = '0';
    document.getElementById('session-arc-remaining').style.opacity = '0';
    
    // Reset UI - Show start button again for next session
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('session-info').style.display = 'none';
    
    // Reset progress
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-percent').textContent = '0%';
    
    // Update daily sessions display
    updateDailySessions();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Start clock
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
    
    // Load and display today's sessions
    updateDailySessions();
    
    // Check for active session on load
    const activeSession = SessionManager.getCurrentSession();
    if (activeSession) {
        // Resume active session
        currentSessionIndex = activeSession.index;
        sessionStartTime = new Date(activeSession.session.startTime);
        
        // Check if session should have ended
        const elapsed = Date.now() - sessionStartTime;
        if (elapsed >= SESSION_DURATION) {
            endSession();
        } else {
            // Resume UI state
            document.getElementById('start-btn').style.display = 'none';
            document.getElementById('session-info').style.display = 'block';
            
            // Resume timer
            sessionInterval = setInterval(updateSessionProgress, 1000);
            updateSessionProgress();
            updateSessionArcs();
        }
    }
    
    // Add event listener for start button only
    document.getElementById('start-btn').addEventListener('click', startSession);
});

// Prevent window from being closed accidentally
window.addEventListener('beforeunload', (e) => {
    if (sessionStartTime) {
        e.preventDefault();
        e.returnValue = '';
    }
});