// Track active role selection
let currentRole = 'General'; // Default fallback role
function selectRole(role) {
    currentRole = role;
    
    // Save current active role in session
    const existingData = JSON.parse(localStorage.getItem('astra_sim_data') || '{}');
    existingData.mode = role;
    localStorage.setItem('astra_sim_data', JSON.stringify(existingData));
    if (role === 'Expert') {
        openParamModal('expert-modal');
    } else if (role === 'Officer') {
        openParamModal('officer-modal');
    } else if (role === 'General') {
        openParamModal('general-modal');
    }
}

// Direct function for the ID Card Icon click
function navigateToDashboard() {
    const data = JSON.parse(localStorage.getItem('astra_sim_data') || '{}');
    
    // If no role was saved yet, assign default
    if (!data.mode) {
        data.mode = currentRole;
        localStorage.setItem('astra_sim_data', JSON.stringify(data));
    }

    // Redirect directly to the dashboard
    window.location.href = 'dashboard.html';
}

// Live System Clock Function
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false }) + ' IST';
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock();
// Modal Information Data
const roleDetails = {
    expert: {
        title: "Expert Mode Details",
        icon: "🧪",
        description: "Designed for DRDO scientists, thermal engineers, and simulation specialists. Grants access to finite element analysis (FEA) mesh resolution, phase change material (PCM) thermo-physical property overrides, wall layer thermal conductance calculations, and custom boundary conditions."
    },
    officer: {
        title: "Officer Mode Details",
        icon: "🛡️",
        description: "Optimized for field commanders and tactical logistics officers. Provides an interactive GIS map view centered on high-altitude defense regions (HACR), auto-ingesting NASA POWER API weather metrics, troop capacity needs, and thermal comfort indices."
    },
    general: {
        title: "General Mode Details",
        icon: "👤",
        description: "Streamlined operational presets for rapid shelter evaluation. Select standardized shelter designs, preset troop occupancy numbers, and quick environmental presets to calculate basic fuel/energy requirements without manual parameter tuning."
    }
};

// Open Modal Function
function openModal(role) {
    const modal = document.getElementById('info-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const icon = document.getElementById('modal-icon');

    if (roleDetails[role]) {
        title.textContent = roleDetails[role].title;
        desc.textContent = roleDetails[role].description;
        icon.textContent = roleDetails[role].icon;
        modal.classList.add('active');
    }
}

// Close Modal Function
function closeModal() {
    const modal = document.getElementById('info-modal');
    modal.classList.remove('active');
}

// Close modal when clicking outside the content box
window.onclick = function(event) {
    const modal = document.getElementById('info-modal');
    if (event.target === modal) {
        closeModal();
    }
};
// Emergency / Offline Mode Toggle Logic
function toggleOfflineMode(checkbox) {
    const apiStatus = document.getElementById('api-status');
    const apiDot = document.getElementById('api-dot');

    if (checkbox.checked) {
        // Switch to Offline / Cached Mode
        apiStatus.textContent = 'OFFLINE (CACHED DATA)';
        apiStatus.className = 'status-offline';
        apiDot.classList.add('offline');
        
        console.warn("[ASTRA SYSTEM] Emergency mode engaged. Ingesting pre-cached Siachen & Ladakh thermal datasets.");
    } else {
        // Return to Live Stream Mode
        apiStatus.textContent = 'ONLINE';
        apiStatus.className = 'status-online';
        apiDot.classList.remove('offline');
        
        console.log("[ASTRA SYSTEM] Network connection restored. Resuming live NASA POWER API stream.");
    }
}
// Navigates to User Dashboard (Placeholder for future page)
function goToDashboard() {
   try {
        // Read existing session data or set fallback defaults
        let simData = {};
        const stored = localStorage.getItem('astra_sim_data');
        
        if (stored) {
            simData = JSON.parse(stored);
        }

        // If no mode is set yet, default to General Mode
        if (!simData.mode) {
            simData = {
                mode: 'General',
                location: 'Siachen Base Sector',
                ambientTemp: '-20',
                targetTemp: '18',
                capacity: '8',
                matOuter: 'Carbon-Aramid Weather Shield',
                matCore: 'Aerogel-Infused Polyurethane Core',
                matPcm: 'Organic Bio-Paraffin PCM'
            };
            localStorage.setItem('astra_sim_data', JSON.stringify(simData));
        }

        // Redirect directly to dashboard page
        window.location.href = 'dashboard.html';
    } catch (e) {
        console.error("Navigation error:", e);
        // Fallback force redirect
        window.location.href = 'dashboard.html';
    }
}

let officerMap = null;
let officerMarker = null;

// Updated openParamModal to initialize map dynamically when Officer modal opens
function openParamModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        
        // Initialize map only when Officer modal is displayed
        if (modalId === 'officer-modal') {
            setTimeout(initOfficerMap, 200); // Small delay to allow modal rendering
        }
    }
}

function initOfficerMap() {
    if (officerMap !== null) {
        officerMap.invalidateSize(); // Refreshes layout if already loaded
        return;
    }

    // Centered near Ladakh / Northern HACR Sector
    const defaultCoords = [34.1526, 77.5771]; 

    officerMap = L.map('officer-map').setView(defaultCoords, 7);

    // Dark military-style map tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 18
    }).addTo(officerMap);

    // Default Marker
    officerMarker = L.marker(defaultCoords, { draggable: true }).addTo(officerMap);

    // Map Click Listener to Update Input Field automatically
    officerMap.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(4);
        const lng = e.latlng.lng.toFixed(4);
        
        if (officerMarker) {
            officerMarker.setLatLng(e.latlng);
        } else {
            officerMarker = L.marker(e.latlng).addTo(officerMap);
        }

        document.getElementById('officer-coords').value = `${lat}° N, ${lng}° E`;
    });
}

function closeParamModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// Global click listener to close modals when clicking backdrop
window.addEventListener('click', function(event) {
    const modals = ['expert-modal', 'officer-modal', 'general-modal'];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal && event.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Function that saves inputs and launches the specific simulation page
function handleParamSubmit(event, mode) {
    if (event) event.preventDefault();
    const form = event.target;

    // 1. Gather input values from the specific modal form
    const locationInput = form.querySelector('input[type="text"]');
    const numberInputs = form.querySelectorAll('input[type="number"]');
    const selectInputs = form.querySelectorAll('select');

    // Handle optional temperature inputs (assuming standard modal ID structure)
    const ambientIn = document.getElementById(`${mode.toLowerCase()}-ambient-temp`);
    const targetIn = document.getElementById(`${mode.toLowerCase()}-target-temp`);

    // 2. Build the simulation run object
    const newSimRun = {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' IST',
        mode: mode, // e.g., 'Expert', 'Officer', 'General'
        location: locationInput ? locationInput.value.trim() : 'Sector 4 Base',
        capacity: numberInputs[0] ? `${numberInputs[0].value}` : '10', // Store pure number
        ambientTemp: ambientIn ? ambientIn.value : '-28', // Fallback extremes
        targetTemp: targetIn ? targetIn.value : '+18', // Fallback extreme
        duration: selectInputs[0] ? selectInputs[0].value.trim() : '45 Days Deployment', // Corrected duration source
        status: 'Active Session'
    };

    // 3. Save to active user's simulation history (This keeps dashboard synced)
    const activeUser = JSON.parse(localStorage.getItem('astra_active_user')) || { personnelId: 'DRDO-8492' };
    const historyKey = `astra_history_${activeUser.personnelId}`;
    
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.unshift(newSimRun); // Prepend new simulation to top
    localStorage.setItem(historyKey, JSON.stringify(history));

    // 4. Save *current* simulation parameters specifically for visualization pages
    localStorage.setItem('astra_sim_data', JSON.stringify(newSimRun));

    // 5. REDIRECTION LOGIC (THIS IS THE KEY FIX)
    // Instead of always going to dashboard.html, we route based on the Mode type
    switch (mode.toLowerCase()) {
        case 'expert':
            window.location.href = 'simulation-expert.html'; // Direct to Expert 3D Visualization
            break;
        case 'officer':
            window.location.href = 'simulation-officer.html'; // Direct to Tactical Map Visualization
            break;
        case 'general':
            window.location.href = 'simulation-general.html'; // Direct to Basic Summary Visualization
            break;
        default:
            window.location.href = 'index.html'; // Problem fallback
            break;
    }
}

    localStorage.setItem('astra_sim_data', JSON.stringify(simData));

    // Get active ID
    const activeUser = JSON.parse(localStorage.getItem('astra_user_id') || JSON.stringify({
        id: 'IC-78219',
        name: 'Major A. Sharma',
        role: 'Field Operations Commander'
    }));

    // Append entry to ID history
    let history = JSON.parse(localStorage.getItem(`astra_history_${activeUser.id}`) || '[]');
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} IST`;

    history.unshift({
        timestamp: dateStr,
        mode: mode,
        location: simData.location,
        capacity: `${simData.capacity} Personnel`,
        duration: simData.duration,
        status: 'Active Session'
    });

    localStorage.setItem(`astra_history_${activeUser.id}`, JSON.stringify(history));

    // Navigate to personal ID dashboard
    window.location.href = 'dashboard.html';

// Default user fallback if no login occurred yet
const DEFAULT_USER = {
    personnelId: "DRDO-8492",
    email: "officer@drdo.in",
    name: "Major A. Sharma",
    post: "Field Operations Commander",
    base: "Sector 4 - Eastern Ladakh",
    clearance: "Level-3 Tactical Command"
};

// Call this when the user logs in via email + Personnel ID
function handleLoginSubmit(event) {
    if (event) event.preventDefault();
    
    const idInput = document.getElementById('login-personnel-id');
    const emailInput = document.getElementById('login-email');

    // Retrieve existing profile or create a fresh record for this DRDO ID
    const inputId = idInput ? idInput.value.trim().toUpperCase() : "DRDO-8492";
    const existingProfile = JSON.parse(localStorage.getItem(`profile_${inputId}`) || 'null');

    const activeUser = existingProfile || {
        ...DEFAULT_USER,
        personnelId: inputId,
        email: emailInput ? emailInput.value.trim() : "officer@drdo.in"
    };

    // Save active user session & back up profile by DRDO ID
    localStorage.setItem('astra_active_user', JSON.stringify(activeUser));
    localStorage.setItem(`profile_${activeUser.personnelId}`, JSON.stringify(activeUser));

    // Sync header button immediately & redirect to main portal
    syncHeaderID();
    window.location.href = 'index.html';
}

// Syncs the ID text on the header button across pages
function syncHeaderID() {
    const activeUser = JSON.parse(localStorage.getItem('astra_active_user') || JSON.stringify(DEFAULT_USER));
    
    // Target the ID text inside the header/navbar button
    const idButtonText = document.getElementById('nav-id-text');
    if (idButtonText) {
        idButtonText.innerText = activeUser.personnelId;
    }
}

// Execute on every page load
document.addEventListener('DOMContentLoaded', () => {
    syncHeaderID();
});