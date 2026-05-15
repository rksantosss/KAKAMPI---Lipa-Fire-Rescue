// ========== LOCALSTORAGE DATABASE ==========
function initDatabase() {
    if (!localStorage.getItem('kakampi_incidents')) localStorage.setItem('kakampi_incidents', JSON.stringify([]));
    if (!localStorage.getItem('kakampi_users')) {
        const defaultUsers = [
            { id: 1, fullname: "Resident User", username: "resident", password: "fire123", barangay: "Barangay Inosluban", role: "Resident", contact: "09123456789", createdAt: new Date().toISOString() },
            { id: 2, fullname: "Barangay Fire Aide", username: "kakampi", password: "lipafire", barangay: "Barangay Centro", role: "Responder", contact: "09234567890", createdAt: new Date().toISOString() },
            { id: 3, fullname: "BFP Officer Lipa", username: "bfp.lipa", password: "rescue143", barangay: "Lipa Central Station", role: "BFP Personnel", contact: "09345678901", createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('kakampi_users', JSON.stringify(defaultUsers));
    }
    setupModalClickOutside();
}

function getIncidents() { return JSON.parse(localStorage.getItem('kakampi_incidents')) || []; }
function getUsers() { return JSON.parse(localStorage.getItem('kakampi_users')) || []; }
function saveIncident(incident) { const incidents = getIncidents(); incidents.unshift(incident); localStorage.setItem('kakampi_incidents', JSON.stringify(incidents)); updateStats(); }
function saveUser(user) { const users = getUsers(); users.push(user); localStorage.setItem('kakampi_users', JSON.stringify(users)); updateStats(); }
function updateStats() { if(document.getElementById('dbIncidentCount')) document.getElementById('dbIncidentCount').innerText = getIncidents().length; if(document.getElementById('dbUserCount')) document.getElementById('dbUserCount').innerText = getUsers().length; }
function validateUser(username, password) { return getUsers().find(u => u.username === username && u.password === password); }
function userExists(username) { return getUsers().some(u => u.username === username); }

let currentUser = null;
let alertCooldown = false;

function addKakampiLog(entryType, details, icon = "📝") {
    const timestamp = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    const incidentRecord = { id: Date.now(), timestamp, fullDate: new Date().toLocaleString(), entryType, details, icon, user: currentUser ? currentUser.username : "system", role: currentUser ? currentUser.role : "Kakampi", barangay: currentUser ? currentUser.barangay : "Lipa City" };
    saveIncident(incidentRecord);
    const historyList = document.getElementById('fireHistoryList');
    if(historyList){
        const li = document.createElement('li');
        li.innerHTML = `<span class="log-time">[${timestamp}]</span> <span>${icon} ${entryType}: ${details}</span>`;
        if(historyList.firstChild) historyList.insertBefore(li, historyList.firstChild);
        else historyList.appendChild(li);
        while(historyList.children.length > 35) historyList.removeChild(historyList.lastChild);
    }
}

function loadIncidentHistory(){
    const incidents = getIncidents();
    const historyList = document.getElementById('fireHistoryList');
    if(historyList){
        historyList.innerHTML = '';
        incidents.slice(0,30).forEach(inc => { const li = document.createElement('li'); li.innerHTML = `<span class="log-time">[${inc.timestamp}]</span> <span>${inc.icon || '📋'} ${inc.entryType}: ${inc.details} (${inc.role})</span>`; historyList.appendChild(li); });
        if(incidents.length === 0) historyList.innerHTML = '<li><span class="log-time"> system</span> <span>✅ No past incidents. KAKAMPI ready.</span></li>';
    }
    updateStats();
}

function clearIncidentDatabase(){ if(confirm("Clear ALL incident records?")){ localStorage.setItem('kakampi_incidents', JSON.stringify([])); loadIncidentHistory(); addKakampiLog("SYSTEM", "Incident database cleared", "🧹"); } }

// ========== CLICKABLE STATS FUNCTIONS ==========
function showIncidentDetails() {
    const incidents = getIncidents();
    const modal = document.getElementById('statsModal');
    const modalTitle = document.getElementById('statsModalTitle');
    const modalBody = document.getElementById('statsModalBody');
    
    modalTitle.innerHTML = '🔥 INCIDENT LOG DETAILS';
    
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
                        📌 #${incidents.length - index} • ${inc.entryType} 
                        <span class="stats-badge">${inc.role || 'System'}</span>
                    </div>
                    <div class="stats-item-detail">
                        🕐 ${inc.timestamp} | 📍 ${inc.barangay || 'Lipa City'}<br>
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
        
        users.forEach((user, index) => {
            let roleIcon = '';
            if (user.role === 'Resident') roleIcon = '🏠';
            else if (user.role === 'Responder') roleIcon = '🚒';
            else roleIcon = '👨‍🚒';
            
            html += `
                <div class="stats-item">
                    <div class="stats-item-title">
                        ${roleIcon} ${user.fullname || user.username}
                        <span class="stats-badge">${user.role}</span>
                    </div>
                    <div class="stats-item-detail">
                        📛 @${user.username}<br>
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

function closeStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

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

function setupClickableStats() {
    const incidentsSpan = document.getElementById('clickableIncidents');
    const usersSpan = document.getElementById('clickableUsers');
    const closeBtn = document.getElementById('closeStatsModal');
    
    if (incidentsSpan) {
        incidentsSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showIncidentDetails();
        });
    }
    
    if (usersSpan) {
        usersSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showUserDetails();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeStatsModal);
    }
}

function initMainApp() {
    loadIncidentHistory();
    const fireAlertBtn = document.getElementById('fireAlertBtn');
    const fireStatusDiv = document.getElementById('fireStatusMsg');
    const clearLogBtn = document.getElementById('clearFireLog');
    const clockSpan = document.getElementById('kakampiClock');
    const riskBadge = document.getElementById('fireRiskBadge');
    
    function updateClock(){
        const now = new Date(); const hrs = now.getHours().toString().padStart(2,'0'); const mins = now.getMinutes().toString().padStart(2,'0'); const secs = now.getSeconds().toString().padStart(2,'0');
        if(clockSpan) clockSpan.textContent = `${hrs}:${mins}:${secs}`;
        const hour = now.getHours();
        if(riskBadge){ if(hour>=10 && hour<=15) riskBadge.innerHTML = "🔥 Fire Danger: HIGH"; else if(hour>=18 || hour<=5) riskBadge.innerHTML = "🟢 Fire Danger: LOW"; else riskBadge.innerHTML = "🟡 Fire Danger: MODERATE"; }
    }
    setInterval(updateClock,1000); updateClock();
    
    function triggerFireEmergency(){
        if(alertCooldown) { if(fireStatusDiv) fireStatusDiv.innerHTML = `⏳ <span>Alert already dispatching...</span>`; return; }
        alertCooldown = true; if(navigator.vibrate) navigator.vibrate([400,200,400]);
        const container = document.querySelector('.glass-card'); if(container){ container.classList.add('critical-glow'); setTimeout(()=>container.classList.remove('critical-glow'),700); }
        if(fireStatusDiv) fireStatusDiv.innerHTML = `🚨 <span>KAKAMPI FIRE ALERT! Notifying Responders...</span>`;
        addKakampiLog("FIRE ALERT", `Fire emergency from ${currentUser?.barangay || "Lipa City"} by ${currentUser?.username}`, "🔥");
        setTimeout(()=>{
            if(fireStatusDiv) fireStatusDiv.innerHTML = `🚒 <span>BFP Lipa & Responders Dispatched!</span>`;
            addKakampiLog("DISPATCH", "Fire responders en route to location", "🚒");
            if(Notification.permission === "granted") new Notification("KAKAMPI FIRE ALERT", { body: `Fire reported in ${currentUser?.barangay || "Lipa City"}! Responders en route.` });
            setTimeout(()=>{ if(fireStatusDiv) fireStatusDiv.innerHTML = `✅ <span>KAKAMPI READY · Lipa City Fire Watch Active</span>`; alertCooldown = false; },4000);
        },1800);
    }
    
    function callHotline(name, number){
        addKakampiLog("HOTLINE", `Called ${name} (${number})`, "📞");
        const prevStatus = fireStatusDiv.innerHTML;
        if(fireStatusDiv) fireStatusDiv.innerHTML = `📞 <span>Calling ${name} (${number})...</span>`;
        setTimeout(()=>{ alert(`KAKAMPI FIRE ASSISTANCE\nCalling ${name} - ${number}\nLocation: ${currentUser?.barangay || "Lipa City"}`); if(fireStatusDiv) fireStatusDiv.innerHTML = prevStatus; addKakampiLog("CALL PLACED", `Call completed to ${name}`, "✅"); if(navigator.vibrate) navigator.vibrate(100); },400);
    }
    
    if(fireAlertBtn) fireAlertBtn.onclick = (e)=>{ e.preventDefault(); triggerFireEmergency(); };
    document.querySelectorAll('.hotline-card').forEach(card=>{ card.onclick = ()=>callHotline(card.getAttribute('data-name'), card.getAttribute('data-number')); });
    if(clearLogBtn) clearLogBtn.onclick = ()=>clearIncidentDatabase();
    if("Notification" in window && Notification.permission === "default") setTimeout(()=>Notification.requestPermission(),2000);
    addKakampiLog("SESSION START", `${currentUser?.role} ${currentUser?.username} logged in from ${currentUser?.barangay}`, "🔌");
    
    setupClickableStats();
}

const authContainer = document.getElementById('authContainer');
const mainApp = document.getElementById('mainApp');
const loginPanel = document.getElementById('loginPanel');
const registerPanel = document.getElementById('registerPanel');
const showLoginBtn = document.getElementById('showLoginBtn');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const switchToLogin = document.getElementById('switchToLogin');

showLoginBtn.onclick = ()=>{ showLoginBtn.classList.add('active'); showRegisterBtn.classList.remove('active'); loginPanel.style.display='block'; registerPanel.style.display='none'; };
showRegisterBtn.onclick = ()=>{ showRegisterBtn.classList.add('active'); showLoginBtn.classList.remove('active'); loginPanel.style.display='none'; registerPanel.style.display='block'; };
if(switchToLogin) switchToLogin.onclick = ()=>showLoginBtn.click();

function doLogin(){
    const username = document.getElementById('loginUsername').value.trim(), password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginErrorMsg');
    if(!username || !password){ errorDiv.innerHTML = "Please enter username and password."; return; }
    const user = validateUser(username, password);
    if(user){
        currentUser = user;
        document.getElementById('loggedUserName').innerText = `${user.fullname || user.username}`;
        document.getElementById('userRoleBadge').innerText = user.role;
        document.getElementById('userBarangayDisplay').innerText = user.barangay;
        authContainer.style.display = 'none';
        mainApp.style.display = 'block';
        initMainApp();
    } else { errorDiv.innerHTML = "Invalid username or password. Please register."; }
}

function doRegister(){
    const fullname = document.getElementById('regFullname').value.trim(), username = document.getElementById('regUsername').value.trim(), password = document.getElementById('regPassword').value.trim(), barangay = document.getElementById('regBarangay').value.trim(), role = document.getElementById('regRole').value, contact = document.getElementById('regContact').value.trim();
    const errorDiv = document.getElementById('registerErrorMsg');
    if(!fullname || !username || !password || !barangay){ errorDiv.innerHTML = "Please fill all required fields."; return; }
    if(password.length<6){ errorDiv.innerHTML = "Password must be at least 6 characters."; return; }
    if(userExists(username)){ errorDiv.innerHTML = "Username already exists."; return; }
    const newUser = { id: Date.now(), fullname, username, password, barangay, role, contact, createdAt: new Date().toISOString() };
    saveUser(newUser);
    errorDiv.innerHTML = "✅ Registration successful! Please login with your credentials."; errorDiv.style.background="#dcfce7"; errorDiv.style.color="#15803d";
    document.getElementById('regFullname').value=''; document.getElementById('regUsername').value=''; document.getElementById('regPassword').value=''; document.getElementById('regBarangay').value=''; document.getElementById('regContact').value='';
    setTimeout(()=>{ showLoginBtn.click(); errorDiv.innerHTML = ""; errorDiv.style.background="#fee2e2"; errorDiv.style.color="#b91c1c"; },2000);
}

document.getElementById('doLoginBtn').onclick = doLogin;
document.getElementById('doRegisterBtn').onclick = doRegister;
document.getElementById('loginUsername').addEventListener('keypress', e=>{ if(e.key==='Enter') doLogin(); });
document.getElementById('loginPassword').addEventListener('keypress', e=>{ if(e.key==='Enter') doLogin(); });
document.getElementById('logoutBtn')?.addEventListener('click',()=>{ if(currentUser) addKakampiLog("SESSION END", `User ${currentUser.username} logged out`, "🔚"); currentUser=null; authContainer.style.display='block'; mainApp.style.display='none'; document.getElementById('loginUsername').value=""; document.getElementById('loginPassword').value=""; document.getElementById('loginErrorMsg').innerHTML=""; });

initDatabase(); updateStats();

// Manual overlay controls
const manualOverlay = document.getElementById('manualOverlay');
const openManualBtn = document.getElementById('openManualBtn');
const closeManualBtn = document.getElementById('closeManualBtn');
openManualBtn.onclick = () => { manualOverlay.style.display = 'flex'; };
closeManualBtn.onclick = () => { manualOverlay.style.display = 'none'; };
manualOverlay.onclick = (e) => { if(e.target === manualOverlay) manualOverlay.style.display = 'none'; };
