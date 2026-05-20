/**
 * ============================================
 * KAKAMPI · Lipa City Fire Rescue
 * Script.JS - Main Application Logic
 * Bright Edition + Clickable Stats
 * ============================================
 * 
 * This script handles:
 * - Database initialization and management (localStorage)
 * - User authentication (login/register/logout)
 * - Fire emergency SOS system with notifications
 * - Hotline call simulation
 * - Incident logging and history
 * - Clickable statistics modals
 * - Real-time clock and fire risk indicator
 * - User manual overlay
 * ============================================
 */

// ============================================
// APPLICATION STATE
// ============================================
let currentUser = null;
let alertCooldown = false;

// ============================================
// DATABASE MANAGEMENT (localStorage)
// ============================================

/**
 * Initialize the database with default data if not exists
 */
function initDatabase() {
    // Initialize incidents storage
    if (!localStorage.getItem('kakampi_incidents')) {
        localStorage.setItem('kakampi_incidents', JSON.stringify([]));
    }
    
    // Initialize users storage with default demo accounts
    if (!localStorage.getItem('kakampi_users')) {
        const defaultUsers = [
            {
                id: 1,
                fullname: "Resident User",
                username: "resident",
                password: "fire123",
                barangay: "Barangay Inosluban",
                role: "Resident",
                contact: "09123456789",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                fullname: "Lipa City Police (PNP)",
                username: "kakampi",
                password: "lipafire",
                barangay: "Barangay Centro",
                role: "Responder",
                contact: "09234567890",
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                fullname: "BFP Officer Lipa",
                username: "bfp.lipa",
                password: "rescue143",
                barangay: "Lipa Central Station",
                role: "BFP Personnel",
                contact: "09345678901",
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('kakampi_users', JSON.stringify(defaultUsers));
    }
    
    setupModalClickOutside();
}

/**
 * Get all incidents from storage
 * @returns {Array} Array of incident objects
 */
function getIncidents() {
    return JSON.parse(localStorage.getItem('kakampi_incidents')) || [];
}

/**
 * Get all users from storage
 * @returns {Array} Array of user objects
 */
function getUsers() {
    return JSON.parse(localStorage.getItem('kakampi_users')) || [];
}

/**
 * Save a new incident to storage
 * @param {Object} incident - The incident object to save
 */
function saveIncident(incident) {
    const incidents = getIncidents();
    incidents.unshift(incident);
    localStorage.setItem('kakampi_incidents', JSON.stringify(incidents));
    updateStats();
}

/**
 * Save a new user to storage
 * @param {Object} user - The user object to save
 */
function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('kakampi_users', JSON.stringify(users));
    updateStats();
}

/**
 * Update the statistics display counters
 */
function updateStats() {
    if (document.getElementById('dbIncidentCount')) {
        document.getElementById('dbIncidentCount').innerText = getIncidents().length;
    }
    if (document.getElementById('dbUserCount')) {
        document.getElementById('dbUserCount').innerText = getUsers().length;
    }
}

/**
 * Validate user credentials
 * @param {string} username - The username to validate
 * @param {string} password - The password to validate
 * @returns {Object|null} The user object if valid, null otherwise
 */
function validateUser(username, password) {
    return getUsers().find(u => u.username === username && u.password === password);
}

/**
 * Check if a username already exists
 * @param {string} username - The username to check
 * @returns {boolean} True if username exists
 */
function userExists(username) {
    return getUsers().some(u => u.username === username);
}

// ============================================
// INCIDENT LOGGING SYSTEM
// ============================================

/**
 * Add an entry to the Kakampi incident log
 * @param {string} entryType - Type of entry (FIRE ALERT, HOTLINE, etc.)
 * @param {string} details - Description of the incident
 * @param {string} icon - Emoji icon for the entry
 */
function addKakampiLog(entryType, details, icon = '📋') {
    const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const incidentRecord = {
        id: Date.now(),
        timestamp: timestamp,
        fullDate: new Date().toLocaleString(),
        entryType: entryType,
        details: details,
        icon: icon,
        user: currentUser ? currentUser.username : "system",
        role: currentUser ? currentUser.role : "Kakampi",
        barangay: currentUser ? currentUser.barangay : "Lipa City"
    };
    
    saveIncident(incidentRecord);
    
    // Update the visible log display
    const historyList = document.getElementById('fireHistoryList');
    if (historyList) {
        const li = document.createElement('li');
        li.innerHTML = `<span class="log-time">[${timestamp}]</span> <span>${icon} ${entryType}: ${details}</span>`;
        
        if (historyList.firstChild) {
            historyList.insertBefore(li, historyList.firstChild);
        } else {
            historyList.appendChild(li);
        }
        
        // Keep log limited to 35 entries
        while (historyList.children.length > 35) {
            historyList.removeChild(historyList.lastChild);
        }
    }
}

/**
 * Load and display incident history from storage
 */
function loadIncidentHistory() {
    const incidents = getIncidents();
    const historyList = document.getElementById('fireHistoryList');
    
    if (historyList) {
        historyList.innerHTML = '';
        
        if (incidents.length === 0) {
            historyList.innerHTML = '<li><span class="log-time"> system</span> <span> No past incidents. KAKAMPI ready.</span></li>';
        } else {
            incidents.slice(0, 30).forEach(inc => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="log-time">[${inc.timestamp}]</span> <span>${inc.icon} ${inc.entryType}: ${inc.details} (${inc.role})</span>`;
                historyList.appendChild(li);
            });
        }
    }
    
    updateStats();
}

/**
 * Clear all incident records from the database
 */
function clearIncidentDatabase() {
    if (confirm("Clear ALL incident records?")) {
        localStorage.setItem('kakampi_incidents', JSON.stringify([]));
        loadIncidentHistory();
        addKakampiLog("SYSTEM", "Incident database cleared", '🗑️');
    }
}

// ============================================
// CLICKABLE STATISTICS MODAL FUNCTIONS
// ============================================

/**
 * Display incident details in the stats modal
 */
function showIncidentDetails() {
    const incidents = getIncidents();
    const modal = document.getElementById('statsModal');
    const modalTitle = document.getElementById('statsModalTitle');
    const modalBody = document.getElementById('statsModalBody');
    
    modalTitle.innerHTML = '📋 INCIDENT LOG DETAILS';
    
    if (incidents.length === 0) {
        modalBody.innerHTML = '<div class="empty-stats">📭 No incidents recorded yet.<br>Tap SOS to create your first incident.</div>';
    } else {
        let html = `<div style="margin-bottom: 12px; text-align: center; background:#fff7ed; padding:8px; border-radius:12px;">
                        <strong>Total Incidents:</strong> ${incidents.length} 
                        <span class="stats-badge">Active Logs</span>
                    </div>`;
        
        incidents.slice(0, 20).forEach((inc, index) => {
            html += `
                <div class="stats-item">
                    <div class="stats-item-title">
                        🔥 #${incidents.length - index} • ${inc.entryType} 
                        <span class="stats-badge">${inc.role || 'System'}</span>
                    </div>
                    <div class="stats-item-detail">
                        ⏰ ${inc.timestamp} | 📍 ${inc.barangay || 'Lipa City'}<br>
                        📝 ${inc.details}
                    </div>
                </div>
            `;
        });
        
        if (incidents.length > 20) {
            html += `<div style="text-align:center; padding:12px; color:#9a3412; font-size:0.7rem;">
                        + ${incidents.length - 20} more incidents. Check full log above.
                    </div>`;
        }
        
        modalBody.innerHTML = html;
    }
    
    modal.style.display = 'flex';
}

/**
 * Display user details in the stats modal
 */
function showUserDetails() {
    const users = getUsers();
    const modal = document.getElementById('statsModal');
    const modalTitle = document.getElementById('statsModalTitle');
    const modalBody = document.getElementById('statsModalBody');
    
    modalTitle.innerHTML = '👥 REGISTERED USERS';
    
    if (users.length === 0) {
        modalBody.innerHTML = '<div class="empty-stats">👤 No registered users yet.<br>Register a new account to get started.</div>';
    } else {
        let html = `<div style="margin-bottom: 12px; text-align: center; background:#fff7ed; padding:8px; border-radius:12px;">
                        <strong>Total Users:</strong> ${users.length} 
                        <span class="stats-badge">Registered Accounts</span>
                    </div>`;
        
        // Count users by role
        const residents = users.filter(u => u.role === 'Resident');
        const responders = users.filter(u => u.role === 'Responder');
        const bfp = users.filter(u => u.role === 'BFP Personnel');
        
        html += `
            <div style="margin-bottom: 16px;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                    <span style="background:#10b981; color:white; padding:4px 12px; border-radius:20px;">🏠 Residents: ${residents.length}</span>
                    <span style="background:#f59e0b; color:white; padding:4px 12px; border-radius:20px;">🚒 Responders: ${responders.length}</span>
                    <span style="background:#ef4444; color:white; padding:4px 12px; border-radius:20px;">👨‍🚒 BFP: ${bfp.length}</span>
                </div>
            </div>
        `;
        
        // Display each user
        users.forEach((user, index) => {
            let roleIcon = '👤';
            if (user.role === 'Resident') roleIcon = '🏠';
            else if (user.role === 'Responder') roleIcon = '🚒';
            else if (user.role === 'BFP Personnel') roleIcon = '👨‍🚒';
            
            html += `
                <div class="stats-item">
                    <div class="stats-item-title">
                        ${roleIcon} ${user.fullname || user.username}
                        <span class="stats-badge">${user.role}</span>
                    </div>
                    <div class="stats-item-detail">
                        📧 @${user.username}<br>
                        📍 ${user.barangay}<br>
                        📞 ${user.contact || 'No contact provided'}<br>
                        📅 Joined: ${new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>
            `;
        });
        
        modalBody.innerHTML = html;
    }
    
    modal.style.display = 'flex';
}

/**
 * Close the statistics modal
 */
function closeStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Set up click-outside-to-close for the stats modal
 */
function setupModalClickOutside() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeStatsModal();
            }
        });
    }
}

/**
 * Initialize clickable statistics elements
 */
function setupClickableStats() {
    const incidentsSpan = document.getElementById('clickableIncidents');
    const usersSpan = document.getElementById('clickableUsers');
    const closeBtn = document.getElementById('closeStatsModal');
    
    if (incidentsSpan) {
        incidentsSpan.style.cursor = 'pointer';
        incidentsSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showIncidentDetails();
        });
    }
    
    if (usersSpan) {
        usersSpan.style.cursor = 'pointer';
        usersSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showUserDetails();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeStatsModal);
    }
}

// ============================================
// MAIN APPLICATION FUNCTIONS
// ============================================

/**
 * Initialize the main application dashboard
 */
function initMainApp() {
    loadIncidentHistory();
    
    // Get DOM elements
    const fireAlertBtn = document.getElementById('fireAlertBtn');
    const fireStatusDiv = document.getElementById('fireStatusMsg');
    const clearLogBtn = document.getElementById('clearFireLog');
    const clockSpan = document.getElementById('kakampiClock');
    const riskBadge = document.getElementById('fireRiskBadge');
    
    /**
     * Update the real-time clock and fire risk indicator
     */
    function updateClock() {
        const now = new Date();
        const hrs = now.getHours().toString().padStart(2, '0');
        const mins = now.getMinutes().toString().padStart(2, '0');
        const secs = now.getSeconds().toString().padStart(2, '0');
        
        if (clockSpan) {
            clockSpan.textContent = `${hrs}:${mins}:${secs}`;
        }
        
        // Update fire risk based on time of day
        const hour = now.getHours();
        if (riskBadge) {
            if (hour >= 10 && hour <= 15) {
                riskBadge.innerHTML = '🔥 Fire Danger: HIGH';
                riskBadge.style.background = '#fee2e2';
                riskBadge.style.color = '#b91c1c';
            } else if (hour >= 18 || hour <= 5) {
                riskBadge.innerHTML = '✅ Fire Danger: LOW';
                riskBadge.style.background = '#dcfce7';
                riskBadge.style.color = '#15803d';
            } else {
                riskBadge.innerHTML = '⚠️ Fire Danger: MODERATE';
                riskBadge.style.background = '#fef3c7';
                riskBadge.style.color = '#92400e';
            }
        }
    }
    
    // Start clock and update immediately
    setInterval(updateClock, 1000);
    updateClock();
    
    /**
     * Trigger a fire emergency alert
     */
    function triggerFireEmergency() {
        // Prevent multiple rapid alerts
        if (alertCooldown) {
            if (fireStatusDiv) {
                fireStatusDiv.innerHTML = '<span>⏳ Alert already dispatching...</span>';
            }
            return;
        }
        
        alertCooldown = true;
        
        // Vibrate device if supported
        if (navigator.vibrate) {
            navigator.vibrate([400, 200, 400]);
        }
        
        // Add critical glow animation
        const container = document.querySelector('.glass-card');
        if (container) {
            container.classList.add('critical-glow');
            setTimeout(() => container.classList.remove('critical-glow'), 700);
        }
        
        // Update status message
        if (fireStatusDiv) {
            fireStatusDiv.innerHTML = '<span>🚨 KAKAMPI FIRE ALERT! Notifying Responders...</span>';
        }
        
        // Log the incident
        addKakampiLog("FIRE ALERT", `Fire emergency from ${currentUser?.barangay || "Lipa City"} by ${currentUser?.username}`, '🔥');
        
        // Simulate dispatch after delay
        setTimeout(() => {
            if (fireStatusDiv) {
                fireStatusDiv.innerHTML = '<span>🚒 BFP Lipa & Responders Dispatched!</span>';
            }
            addKakampiLog("DISPATCH", "Fire responders en route to location", '🚒');
            
            // Send browser notification if permitted
            if (Notification.permission === "granted") {
                new Notification("KAKAMPI FIRE ALERT", {
                    body: `Fire reported in ${currentUser?.barangay || "Lipa City"}! Responders en route.`,
                    icon: '🔥'
                });
            }
            
            // Reset after 4 seconds
            setTimeout(() => {
                if (fireStatusDiv) {
                    fireStatusDiv.innerHTML = '<span>✅ KAKAMPI READY · Lipa City Fire Watch Active</span>';
                }
                alertCooldown = false;
            }, 4000);
        }, 1800);
    }
    
    /**
     * Simulate calling a hotline number
     * @param {string} name - Name of the agency
     * @param {string} number - Phone number to call
     */
    function callHotline(name, number) {
        addKakampiLog("HOTLINE", `Called ${name} (${number})`, '📞');
        
        const prevStatus = fireStatusDiv ? fireStatusDiv.innerHTML : '';
        
        if (fireStatusDiv) {
            fireStatusDiv.innerHTML = `<span>📞 Calling ${name} (${number})...</span>`;
        }
        
        setTimeout(() => {
            alert(`KAKAMPI FIRE ASSISTANCE\n\nCalling ${name}\n📞 ${number}\n\n📍 Location: ${currentUser?.barangay || "Lipa City"}`);
            
            if (fireStatusDiv) {
                fireStatusDiv.innerHTML = prevStatus;
            }
            
            addKakampiLog("CALL PLACED", `Call completed to ${name}`, '✅');
            
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
        }, 400);
    }
    
    // === Event Listeners ===
    
    // Fire alert SOS button
    if (fireAlertBtn) {
        fireAlertBtn.onclick = (e) => {
            e.preventDefault();
            triggerFireEmergency();
        };
    }
    
    // Hotline cards
    document.querySelectorAll('.hotline-card').forEach(card => {
        card.onclick = () => {
            const name = card.getAttribute('data-name');
            const number = card.getAttribute('data-number');
            callHotline(name, number);
        };
    });
    
    // Clear log button
    if (clearLogBtn) {
        clearLogBtn.onclick = () => clearIncidentDatabase();
    }
    
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
        setTimeout(() => Notification.requestPermission(), 2000);
    }
    
    // Log session start
    addKakampiLog("SESSION START", `${currentUser?.role} ${currentUser?.username} logged in from ${currentUser?.barangay}`, '🔑');
    
    // Initialize clickable stats
    setupClickableStats();
}

// ============================================
// AUTHENTICATION SYSTEM
// ============================================

// Get authentication DOM elements
const authContainer = document.getElementById('authContainer');
const mainApp = document.getElementById('mainApp');
const loginPanel = document.getElementById('loginPanel');
const registerPanel = document.getElementById('registerPanel');
const showLoginBtn = document.getElementById('showLoginBtn');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const switchToLogin = document.getElementById('switchToLogin');

// Toggle between login and register panels
if (showLoginBtn) {
    showLoginBtn.onclick = () => {
        showLoginBtn.classList.add('active');
        showRegisterBtn.classList.remove('active');
        loginPanel.style.display = 'block';
        registerPanel.style.display = 'none';
        clearAuthErrors();
    };
}

if (showRegisterBtn) {
    showRegisterBtn.onclick = () => {
        showRegisterBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
        loginPanel.style.display = 'none';
        registerPanel.style.display = 'block';
        clearAuthErrors();
    };
}

if (switchToLogin) {
    switchToLogin.onclick = () => showLoginBtn.click();
}

/**
 * Clear all authentication error messages
 */
function clearAuthErrors() {
    const loginError = document.getElementById('loginErrorMsg');
    const registerError = document.getElementById('registerErrorMsg');
    if (loginError) loginError.innerHTML = '';
    if (registerError) {
        registerError.innerHTML = '';
        registerError.style.background = '#fee2e2';
        registerError.style.color = '#b91c1c';
    }
}

/**
 * Handle user login
 */
function doLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginErrorMsg');
    
    // Validate inputs
    if (!username || !password) {
        errorDiv.innerHTML = '⚠️ Please enter username and password.';
        return;
    }
    
    // Authenticate user
    const user = validateUser(username, password);
    
    if (user) {
        currentUser = user;
        
        // Update UI with user info
        document.getElementById('loggedUserName').innerText = `${user.fullname || user.username}`;
        document.getElementById('userRoleBadge').innerText = user.role;
        document.getElementById('userBarangayDisplay').innerText = user.barangay;
        
        // Switch to main app
        authContainer.style.display = 'none';
        mainApp.style.display = 'block';
        
        // Clear login form
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        
        // Initialize the main application
        initMainApp();
    } else {
        errorDiv.innerHTML = '❌ Invalid username or password. Please register if you don\'t have an account.';
        
        // Shake animation for error
        errorDiv.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            errorDiv.style.animation = '';
        }, 500);
    }
}

/**
 * Handle user registration
 */
function doRegister() {
    const fullname = document.getElementById('regFullname').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const barangay = document.getElementById('regBarangay').value.trim();
    const role = document.getElementById('regRole').value;
    const contact = document.getElementById('regContact').value.trim();
    const errorDiv = document.getElementById('registerErrorMsg');
    
    // Validate required fields
    if (!fullname || !username || !password || !barangay) {
        errorDiv.innerHTML = '⚠️ Please fill all required fields.';
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        errorDiv.innerHTML = '🔒 Password must be at least 6 characters.';
        return;
    }
    
    // Check for existing username
    if (userExists(username)) {
        errorDiv.innerHTML = '👤 Username already exists. Please choose another.';
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        fullname: fullname,
        username: username,
        password: password,
        barangay: barangay,
        role: role,
        contact: contact,
        createdAt: new Date().toISOString()
    };
    
    // Save to database
    saveUser(newUser);
    
    // Show success message
    errorDiv.innerHTML = '✅ Registration successful! Please login with your credentials.';
    errorDiv.style.background = '#dcfce7';
    errorDiv.style.color = '#15803d';
    
    // Clear registration form
    document.getElementById('regFullname').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regBarangay').value = '';
    document.getElementById('regContact').value = '';
    
    // Switch to login after delay
    setTimeout(() => {
        showLoginBtn.click();
        errorDiv.innerHTML = '';
        errorDiv.style.background = '#fee2e2';
        errorDiv.style.color = '#b91c1c';
    }, 2000);
}

/**
 * Handle user logout
 */
function doLogout() {
    if (currentUser) {
        addKakampiLog("SESSION END", `User ${currentUser.username} logged out`, '🔚');
    }
    
    currentUser = null;
    authContainer.style.display = 'block';
    mainApp.style.display = 'none';
    
    // Clear login form
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    
    const loginError = document.getElementById('loginErrorMsg');
    if (loginError) loginError.innerHTML = '';
}

// ============================================
// EVENT LISTENERS
// ============================================

// Login button
document.getElementById('doLoginBtn').onclick = doLogin;

// Register button
document.getElementById('doRegisterBtn').onclick = doRegister;

// Enter key for login form
document.getElementById('loginUsername').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doLogin();
});

document.getElementById('loginPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doLogin();
});

// Enter key for register form (submit on enter in any field)
document.querySelectorAll('#registerPanel input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doRegister();
    });
});

// Logout button
document.getElementById('logoutBtn')?.addEventListener('click', doLogout);

// ============================================
// USER MANUAL OVERLAY CONTROLS
// ============================================

const manualOverlay = document.getElementById('manualOverlay');
const openManualBtn = document.getElementById('openManualBtn');
const closeManualBtn = document.getElementById('closeManualBtn');

if (openManualBtn) {
    openManualBtn.onclick = () => {
        manualOverlay.style.display = 'flex';
        // Prevent body scroll when manual is open
        document.body.style.overflow = 'hidden';
    };
}

if (closeManualBtn) {
    closeManualBtn.onclick = () => {
        manualOverlay.style.display = 'none';
        document.body.style.overflow = '';
    };
}

// Close manual when clicking outside
if (manualOverlay) {
    manualOverlay.onclick = (e) => {
        if (e.target === manualOverlay) {
            manualOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && manualOverlay.style.display === 'flex') {
            manualOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

// ============================================
// ADDITIONAL UI ENHANCEMENTS
// ============================================

// Add shake animation for error messages
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// ============================================
// INITIALIZATION
// ============================================

// Initialize the database on page load
initDatabase();
updateStats();

console.log('🔥 KAKAMPI · Lipa City Fire Rescue System Initialized');
console.log('👥 Demo Accounts: resident/fire123 | kakampi/lipafire | bfp.lipa/rescue143');
console.log('💡 Click on Total Incidents or Total Users for detailed statistics');
