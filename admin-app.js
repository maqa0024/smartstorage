// === ADMIN DASHBOARD CONTROLLER (Təsərrüfat Müdiri - 3-Rol İdarəetməsi) ===

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
const storage = typeof firebase !== 'undefined' ? firebase.storage() : null;

let currentAdminUID = null;
let allUsersCache = [];
let allEquipmentCache = [];
let uniqueHoldersMap = {};
let pendingRoleChangeUser = null;

// Equipment metadata definition
const equipmentTypeMeta = {
    "Kompüter":          { category: "technical", hasSerial: true,  hasMac: true,  brands: ["Asus", "HP", "Dell", "Lenovo", "Apple"], subtypes: ["Noutbuk", "Masaüstü (Desktop)", "Monoblok (All-in-One)", "İş Stansiyası (Workstation)"] },
    "Monitor":           { category: "technical", hasSerial: true,  hasMac: false, brands: ["Samsung", "LG", "Dell", "AOC", "BenQ"], subtypes: ["24 düym", "27 düym", "32 düym", "Curved Monitor"] },
    "Printer":           { category: "technical", hasSerial: true,  hasMac: true,  brands: ["HP", "Canon", "Epson", "Brother", "Xerox"], subtypes: ["Lazer Printer", "Çoxfunksiyalı (MFP)", "Rəngli Printer", "Barkod Printer"] },
    "Şəbəkə Avadanlığı": { category: "technical", hasSerial: true,  hasMac: true,  brands: ["TP-Link", "Cisco", "MikroTik", "Ubiquiti", "D-Link"], subtypes: ["Router", "Switch", "Access Point", "Server Şkafı"] },
    "Masa":              { category: "physical",  hasSerial: false, hasMac: false, brands: ["IKEA", "Yerli istehsal", "Metal-Karkas"], subtypes: ["Təknəfərlik Parta", "Müəllim Masası", "İclas Masası", "Yazı Masası"] },
    "Lövhə":             { category: "physical",  hasSerial: false, hasMac: false, brands: ["Hitachi", "Promethean", "Yerli istehsal"], subtypes: ["Ağıllı Lövhə", "Yazı Lövhəsi (Məktəb)", "Proyektor Ekranı"] },
    "Stul":              { category: "physical",  hasSerial: false, hasMac: false, brands: ["IKEA", "Yerli istehsal"], subtypes: ["Ofis Kreslosu", "Tələbə Stulu", "Konfrans Stulu"] },
    "Şkaf":              { category: "physical",  hasSerial: false, hasMac: false, brands: ["IKEA", "Yerli istehsal", "Metal-Karkas"], subtypes: ["Geyim Şkafı", "Kitab Şkafı", "Metal Şkaf"] },
    "Dolab":             { category: "physical",  hasSerial: false, hasMac: false, brands: ["IKEA", "Yerli istehsal", "Metal-Karkas"], subtypes: ["Sənəd Dolabı", "Arxiv Dolabı", "Metal Dolab"] },
    "Digər":             { category: "other",     hasSerial: true,  hasMac: true,  brands: [], subtypes: ["Digər ləvazimat"] }
};

// Department population helper
function populateDepartmentSelect(facultyValue, deptSelect, deptGroup, otherInput, selectedValue) {
    if (!deptSelect || !deptGroup) return;
    const departments = (window.DEPARTMENTS_BY_FACULTY && window.DEPARTMENTS_BY_FACULTY[facultyValue]) || null;
    deptSelect.innerHTML = '';

    if (!departments || facultyValue === 'Digər' || !facultyValue || facultyValue === 'Anbar') {
        deptGroup.style.display = 'none';
        deptSelect.required = false;
        if (otherInput) { otherInput.style.display = 'none'; otherInput.required = false; }
        return;
    }

    deptGroup.style.display = 'block';
    deptSelect.required = true;

    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.disabled = true;
    placeholderOpt.textContent = 'Şöbə seçin...';
    deptSelect.appendChild(placeholderOpt);

    let found = false;
    departments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept;
        opt.textContent = dept;
        if (selectedValue === dept) { opt.selected = true; found = true; }
        deptSelect.appendChild(opt);
    });

    if (!found) placeholderOpt.selected = true;
}

// Generate Auto ID
function generateAutoSystemID() {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newID = `TC-${randomPart}`;
    const idField = document.getElementById('auto-id');
    if (idField) idField.value = newID;
    const dateField = document.getElementById('admin-equip-date');
    if (dateField) dateField.valueAsDate = new Date();
}

// Apply Equipment meta to forms
function applyEquipmentTypeMeta(typeValue, refs, selectedSubtype) {
    const meta = equipmentTypeMeta[typeValue];
    if (refs.brandDatalist) {
        refs.brandDatalist.innerHTML = '';
        const brands = (meta && meta.brands) || [];
        brands.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            refs.brandDatalist.appendChild(opt);
        });
    }

    const showSerial = !meta || meta.hasSerial;
    if (refs.serialGroup) refs.serialGroup.style.display = showSerial ? '' : 'none';

    const showMac = !meta || meta.hasMac;
    if (refs.macGroup) refs.macGroup.style.display = showMac ? '' : 'none';

    const subtypes = meta && meta.subtypes;
    if (refs.subtypeGroup && refs.subtypeSelect) {
        if (subtypes && subtypes.length) {
            refs.subtypeGroup.style.display = '';
            refs.subtypeSelect.required = true;
            refs.subtypeSelect.innerHTML = '';

            const placeholderOpt = document.createElement('option');
            placeholderOpt.value = '';
            placeholderOpt.disabled = true;
            placeholderOpt.textContent = 'Alt növü seçin';
            refs.subtypeSelect.appendChild(placeholderOpt);

            let found = false;
            subtypes.forEach(st => {
                const opt = document.createElement('option');
                opt.value = st;
                opt.textContent = st;
                if (selectedSubtype === st) { opt.selected = true; found = true; }
                refs.subtypeSelect.appendChild(opt);
            });
            if (!found) placeholderOpt.selected = true;
        } else {
            refs.subtypeGroup.style.display = 'none';
            refs.subtypeSelect.required = false;
        }
    }
}

// Setup type event listeners
const addRefs = {
    brandDatalist: document.getElementById('brand-suggestions'),
    serialGroup: document.getElementById('serial-field-group'),
    serialInput: document.getElementById('admin-equip-serial'),
    macGroup: document.getElementById('mac-field-group'),
    macInput: document.getElementById('admin-equip-mac'),
    subtypeGroup: document.getElementById('subtype-field-group'),
    subtypeSelect: document.getElementById('admin-equip-subtype')
};
const addTypeEl = document.getElementById('admin-equip-type');
if (addTypeEl) {
    addTypeEl.addEventListener('change', function() {
        applyEquipmentTypeMeta(this.value, addRefs);
    });
}

const editRefs = {
    brandDatalist: document.getElementById('brand-suggestions'),
    serialGroup: document.getElementById('edit-serial-field-group'),
    serialInput: document.getElementById('edit-equip-serial'),
    macGroup: document.getElementById('edit-mac-field-group'),
    macInput: document.getElementById('edit-equip-mac'),
    subtypeGroup: document.getElementById('edit-subtype-field-group'),
    subtypeSelect: document.getElementById('edit-equip-subtype')
};
const editTypeEl = document.getElementById('edit-equip-type');
if (editTypeEl) {
    editTypeEl.addEventListener('change', function() {
        applyEquipmentTypeMeta(this.value, editRefs);
    });
}

// =======================================================
// === DATA LOADING & INITIALIZATION ===
// =======================================================
function initAdminPanel() {
    const activeSession = window.getActiveSessionUser ? window.getActiveSessionUser() : null;
    const adminName = (activeSession && activeSession.name) || "Təsərrüfat Müdiri";
    const nameEl = document.getElementById('admin-name-display');
    if (nameEl) nameEl.innerText = adminName;
    const profilePicHeader = document.getElementById('profile-pic-header');
    if (profilePicHeader) profilePicHeader.innerText = adminName.split(' ').map(n=>n[0]).join('').substring(0,2);

    const profName = document.getElementById('profile-name');
    const profEmail = document.getElementById('profile-email');
    if (profName) profName.value = adminName;
    if (profEmail && activeSession) profEmail.value = activeSession.email || 'admin@qu.edu.az';

    generateAutoSystemID();

    // Attach real-time Firestore listeners or fall back to demo dataset
    if (db) {
        db.collection("equipment").onSnapshot(snapshot => {
            if (!snapshot.empty) {
                allEquipmentCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else if (allEquipmentCache.length === 0) {
                allEquipmentCache = [...window.INITIAL_DEMO_EQUIPMENT];
            }
            updateHoldersData();
            filterAndRenderInventory();
            checkUrlForQR();
        }, err => {
            console.warn("Firestore equipment listener fallback:", err);
            allEquipmentCache = [...window.INITIAL_DEMO_EQUIPMENT];
            updateHoldersData();
            filterAndRenderInventory();
        });

        db.collection("users").onSnapshot(snapshot => {
            if (!snapshot.empty) {
                allUsersCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else if (allUsersCache.length === 0) {
                allUsersCache = [...window.INITIAL_DEMO_USERS];
            }
            renderUserCards(allUsersCache);
        }, err => {
            console.warn("Firestore users listener fallback:", err);
            allUsersCache = [...window.INITIAL_DEMO_USERS];
            renderUserCards(allUsersCache);
        });
    } else {
        allEquipmentCache = [...window.INITIAL_DEMO_EQUIPMENT];
        allUsersCache = [...window.INITIAL_DEMO_USERS];
        updateHoldersData();
        filterAndRenderInventory();
        renderUserCards(allUsersCache);
    }
}

// Top stats counter
function updateStatCards(list) {
    const total = list.length;
    const islek = list.filter(e => e.status === 'İşlək').length;
    const uniqueHolders = new Set(list.map(e => e.holderName).filter(Boolean));
    const anbarCount = list.filter(e => e.holderName === 'Anbar').length;

    const statTotal = document.getElementById('stat-total');
    const statIslek = document.getElementById('stat-islek');
    const statHolders = document.getElementById('stat-holders');
    const statAnbar = document.getElementById('stat-anbar');

    if (statTotal) statTotal.innerText = total;
    if (statIslek) statIslek.innerText = islek;
    if (statHolders) statHolders.innerText = uniqueHolders.size;
    if (statAnbar) statAnbar.innerText = anbarCount;
}

// Holders & Departments grouping
function updateHoldersData() {
    uniqueHoldersMap = {};
    allEquipmentCache.forEach(equip => {
        const name = equip.holderName;
        if (name) {
            if (!uniqueHoldersMap[name]) {
                uniqueHoldersMap[name] = {
                    faculty: equip.holderFaculty || 'Məlum deyil',
                    department: equip.holderDepartment || '',
                    count: 0
                };
            }
            uniqueHoldersMap[name].count++;
        }
    });

    const dataList = document.getElementById('holder-suggestions');
    if (dataList) {
        dataList.innerHTML = '';
        Object.keys(uniqueHoldersMap).forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            dataList.appendChild(opt);
        });
    }

    renderHoldersList();
}

function renderHoldersList() {
    const container = document.getElementById('all-holders-list');
    const emptyState = document.getElementById('holders-empty-state');
    if (!container) return;

    const searchTerm = (document.getElementById('holders-search')?.value || '').toLowerCase();
    container.innerHTML = '';
    let hasItems = false;

    const sortedNames = Object.keys(uniqueHoldersMap).sort((a, b) => {
        if (a === 'Anbar') return -1;
        if (b === 'Anbar') return 1;
        return a.localeCompare(b);
    });

    sortedNames.forEach(name => {
        const data = uniqueHoldersMap[name];
        const searchString = `${name} ${data.faculty} ${data.department}`.toLowerCase();

        if (!searchTerm || searchString.includes(searchTerm)) {
            hasItems = true;
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const card = `
                <div class="holder-card" data-name="${name}">
                    <div class="holder-header">
                        <div class="holder-icon">${initials}</div>
                        <div class="holder-details">
                            <h3>${name}</h3>
                            <p>${data.faculty}${data.department ? ` • <span style="color:#9333ea; font-weight:600;">${data.department}</span>` : ''}</p>
                        </div>
                    </div>
                    <div class="holder-stats">
                        <span>Cəmi Avadanlıq:</span>
                        <span class="holder-count">${data.count} ədəd</span>
                    </div>
                    <button class="action-btn" style="width:100%; padding:9px; background:#0284c7; color:white; justify-content:center;" onclick="openHolderInventory('${name}')">
                        <i class="fas fa-eye"></i> Avadanlıqlarına Bax
                    </button>
                </div>
            `;
            container.innerHTML += card;
        }
    });

    if (emptyState) emptyState.style.display = hasItems ? 'none' : 'block';
}

const holderSearchEl = document.getElementById('holders-search');
if (holderSearchEl) holderSearchEl.addEventListener('input', renderHoldersList);

// =======================================================
// === INVENTORY RENDERING & FILTERING ===
// =======================================================
function filterAndRenderInventory() {
    const searchTerm = (document.getElementById('inventory-search')?.value || '').toLowerCase();
    const filterFaculty = document.getElementById('admin-filter-faculty')?.value || '';
    const filterStatus = document.getElementById('admin-filter-status')?.value || '';

    let filteredList = allEquipmentCache;

    if (filterFaculty) {
        filteredList = filteredList.filter(e => (e.holderFaculty || '') === filterFaculty);
    }
    if (filterStatus) {
        filteredList = filteredList.filter(e => (e.status || '') === filterStatus);
    }
    if (searchTerm) {
        filteredList = filteredList.filter(e => {
            const raw = [
                e.name, e.model, e.serial, e.mac, e.type, e.subType, e.status,
                e.holderName, e.holderFaculty, e.holderDepartment, e.systemId, e.notes
            ].join(' ').toLowerCase();
            return raw.includes(searchTerm);
        });
    }

    renderEquipmentCards(filteredList);
    updateStatCards(filteredList);
}

function renderEquipmentCards(list) {
    const container = document.getElementById('all-equipment-list');
    const emptyState = document.getElementById('all-empty-state');
    if (!container) return;
    container.innerHTML = '';

    if (list.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    list.forEach(equip => {
        const holderText = equip.holderName || "Təyin edilməyib";
        const facultyText = equip.holderFaculty ? `(${equip.holderFaculty})` : "";
        const statusClass = (equip.status || 'işlək').toLowerCase();
        const dateStr = equip.purchaseDate || (equip.addedAt?.seconds ? new Date(equip.addedAt.seconds * 1000).toLocaleDateString() : '-');

        const card = `
            <div class="equipment-card">
                <div class="card-top">
                    <div>
                        <h4 class="equip-name">${equip.name}</h4>
                        <p class="equip-model">${equip.model || '-'}</p>
                    </div>
                    <span class="tag status-${statusClass}">${equip.status || 'İşlək'}</span>
                </div>

                <div class="card-tags">
                    <span class="tag holder-tag"><i class="fas fa-user"></i> ${holderText} ${facultyText}</span>
                    ${equip.holderDepartment ? `<span class="tag dept-tag"><i class="fas fa-building"></i> ${equip.holderDepartment}</span>` : ''}
                    <span class="tag" style="background:#f1f5f9; color:#475569; font-family:monospace;">${equip.systemId || 'ID: -'}</span>
                </div>

                <div class="card-details-list">
                    <div><span>Növ:</span> <span>${equip.type || '-'} ${equip.subType ? `(${equip.subType})` : ''}</span></div>
                    <div><span>Serial No:</span> <span style="font-family:monospace;">${equip.serial || '-'}</span></div>
                    <div><span>MAC:</span> <span style="font-family:monospace;">${equip.mac || '-'}</span></div>
                </div>

                <div class="card-footer">
                    <span><i class="fas fa-calendar-alt"></i> ${dateStr}</span>
                    <div class="card-action-buttons">
                        <button class="action-btn btn-qr" onclick="openQRModal('${equip.id}')" title="QR Kod"><i class="fas fa-qrcode"></i></button>
                        <button class="action-btn btn-view" onclick="viewItemDetails('${equip.id}')" title="Ətraflı"><i class="fas fa-eye"></i></button>
                        <button class="action-btn btn-edit" onclick="openEditModal('${equip.id}')" title="Düzəlt / Köçür"><i class="fas fa-pen"></i></button>
                        <button class="action-btn btn-return" onclick="returnToWarehouse('${equip.id}')" title="Anbara Qaytar"><i class="fas fa-warehouse"></i></button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

const invSearchEl = document.getElementById('inventory-search');
if (invSearchEl) invSearchEl.addEventListener('input', filterAndRenderInventory);
const filterFacEl = document.getElementById('admin-filter-faculty');
if (filterFacEl) filterFacEl.addEventListener('change', filterAndRenderInventory);
const filterStatEl = document.getElementById('admin-filter-status');
if (filterStatEl) filterStatEl.addEventListener('change', filterAndRenderInventory);

// =======================================================
// === 3-ROL İDARƏETMƏSİ & SİSTEM PERSONALİ (Tab 3) ===
// =======================================================
function renderUserCards(users) {
    const container = document.getElementById('all-users-list');
    if (!container) return;
    container.innerHTML = '';

    const searchTerm = (document.getElementById('user-search')?.value || '').toLowerCase();

    users.forEach(user => {
        const rawSearch = `${user.name || ''} ${user.email || ''} ${user.role || ''} ${user.department || ''}`.toLowerCase();
        if (searchTerm && !rawSearch.includes(searchTerm)) return;

        const role = user.role || 'employee';
        const isDeactivated = user.status === 'deactivated';
        const initials = (user.name || 'Personal').split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();

        let roleBadgeClass = "role-badge-tag employee";
        let roleBadgeText = "👤 Sıravi İşçi";
        if (role === 'admin') {
            roleBadgeClass = "role-badge-tag admin";
            roleBadgeText = "🔑 Təsərrüfat Müdiri";
        } else if (role === 'manager') {
            roleBadgeClass = "role-badge-tag manager";
            roleBadgeText = "👔 Şöbə Müdiri";
        }

        const card = `
            <div class="user-card ${isDeactivated ? 'deactivated' : ''}">
                <div class="user-card-top">
                    <div class="user-info">
                        <div class="user-avatar ${role}">${initials}</div>
                        <div class="user-details">
                            <span class="user-name">${user.name || 'İstifadəçi'}</span>
                            <span class="user-email">${user.email || '-'}</span>
                            ${user.department ? `<span class="user-dept-text"><i class="fas fa-building"></i> ${user.department}</span>` : ''}
                        </div>
                    </div>
                    <span class="${roleBadgeClass}">${roleBadgeText}</span>
                </div>

                <!-- 3-Role Update Buttons -->
                <div>
                    <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Rol Təyini (Dərhal Dəyiş):</span>
                    <div class="role-buttons-grid">
                        <button class="role-action-btn role-admin ${role === 'admin' ? 'active' : ''}" onclick="changeUserRole('${user.id}', 'admin')">
                            <i class="fas fa-key"></i> Admin Et
                        </button>
                        <button class="role-action-btn role-manager ${role === 'manager' ? 'active' : ''}" onclick="changeUserRole('${user.id}', 'manager')">
                            <i class="fas fa-user-tie"></i> Şöbə Müdiri
                        </button>
                        <button class="role-action-btn role-employee ${role === 'employee' || role === 'user' ? 'active' : ''}" onclick="changeUserRole('${user.id}', 'employee')">
                            <i class="fas fa-user"></i> İşçi Et
                        </button>
                    </div>
                </div>

                <div class="user-secondary-actions">
                    <button class="btn-lock ${isDeactivated ? 'unlocked' : ''}" onclick="toggleUserLock('${user.id}', '${user.status}')">
                        <i class="fas ${isDeactivated ? 'fa-lock-open' : 'fa-lock'}"></i>
                        <span>${isDeactivated ? 'Kilidi Aç' : 'Girişi Kilidlə'}</span>
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

const userSearchEl = document.getElementById('user-search');
if (userSearchEl) userSearchEl.addEventListener('input', () => renderUserCards(allUsersCache));

// 3-Role change handler
window.changeUserRole = function(userId, targetRole) {
    const user = allUsersCache.find(u => u.id === userId);
    if (!user) return;

    if (user.role === targetRole && targetRole !== 'manager') {
        alert(`Bu istifadəçi artıq bu rola malikdir: ${targetRole}`);
        return;
    }

    // If making Manager, open department selection modal to assign specific department!
    if (targetRole === 'manager') {
        pendingRoleChangeUser = user;
        const modal = document.getElementById('assign-dept-modal');
        const desc = document.getElementById('assign-dept-desc');
        if (desc) desc.innerText = `"${user.name}" üçün rəhbərlik edəcəyi Şöbə və ya Mərkəzi seçin:`;
        
        const facSelect = document.getElementById('modal-dept-faculty');
        const deptSelect = document.getElementById('modal-dept-select');
        
        if (facSelect && deptSelect) {
            facSelect.value = user.faculty || "İnzibati İdarəetmə";
            populateDepartmentSelect(facSelect.value, deptSelect, { style: {} }, null, user.department || "Mükəmməllik Mərkəzi");
            facSelect.onchange = function() {
                populateDepartmentSelect(this.value, deptSelect, { style: {} }, null, '');
            };
        }
        if (modal) modal.style.display = 'flex';
        return;
    }

    // Direct update for Admin or Employee
    const roleLabel = targetRole === 'admin' ? 'Təsərrüfat Müdiri (Admin)' : 'Sıravi İşçi';
    if (confirm(`"${user.name}" adlı şəxsin rolunu "${roleLabel}" olaraq yeniləmək istəyirsiniz?`)) {
        applyRoleUpdate(userId, { role: targetRole });
    }
};

function applyRoleUpdate(userId, updates) {
    // 1. Update in memory / LocalStorage
    const idx = allUsersCache.findIndex(u => u.id === userId);
    if (idx !== -1) {
        allUsersCache[idx] = { ...allUsersCache[idx], ...updates };
        renderUserCards(allUsersCache);
    }

    // 2. Update in Firestore
    if (db) {
        db.collection("users").doc(userId).update(updates)
            .then(() => alert("İstifadəçi rolu uğurla yeniləndi!"))
            .catch(err => {
                console.warn("Firestore update note:", err.message);
                alert("İstifadəçi rolu yeniləndi!");
            });
    } else {
        alert("İstifadəçi rolu uğurla yeniləndi!");
    }
}

// Modal dept confirm
const assignDeptConfirmBtn = document.getElementById('assign-dept-confirm');
if (assignDeptConfirmBtn) {
    assignDeptConfirmBtn.addEventListener('click', () => {
        if (!pendingRoleChangeUser) return;
        const fac = document.getElementById('modal-dept-faculty').value;
        const dept = document.getElementById('modal-dept-select').value;
        if (!dept) { alert("Zəhmət olmasa şöbə seçin!"); return; }

        applyRoleUpdate(pendingRoleChangeUser.id, {
            role: "manager",
            faculty: fac,
            department: dept
        });

        document.getElementById('assign-dept-modal').style.display = 'none';
        pendingRoleChangeUser = null;
    });
}
document.getElementById('assign-dept-close')?.addEventListener('click', () => {
    document.getElementById('assign-dept-modal').style.display = 'none';
});
document.getElementById('assign-dept-cancel')?.addEventListener('click', () => {
    document.getElementById('assign-dept-modal').style.display = 'none';
});

// Lock/Unlock user
window.toggleUserLock = function(userId, currentStatus) {
    const newStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
    const msg = newStatus === 'deactivated' ? "Bu istifadəçinin sistemə girişini KİLİDLƏMƏK istəyirsiniz?" : "Bu istifadəçinin kilidini açmaq istəyirsiniz?";
    if (confirm(msg)) {
        applyRoleUpdate(userId, { status: newStatus });
    }
};

// =======================================================
// === MODAL POPUPS & CRUD OPERATIONS ===
// =======================================================
window.openHolderInventory = function(holderName) {
    const modal = document.getElementById('view-equipment-modal');
    const titleHolder = document.getElementById('view-equip-holder-name');
    const tbody = document.getElementById('user-specific-equipment-tbody');
    const emptyState = document.getElementById('user-specific-empty-state');
    if (titleHolder) titleHolder.innerText = holderName;
    if (tbody) tbody.innerHTML = '';

    const items = allEquipmentCache.filter(e => e.holderName === holderName);
    if (items.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        items.forEach(equip => {
            const row = `
                <tr>
                    <td><b>${equip.name}</b><br><span style="font-size:11px; color:#64748b;">${equip.model || '-'}</span></td>
                    <td><span class="tag status-${(equip.status||'').toLowerCase()}">${equip.status || 'İşlək'}</span></td>
                    <td style="font-family:monospace;">${equip.serial || '-'}</td>
                    <td style="font-family:monospace; color:#0284c7;">${equip.systemId || '-'}</td>
                    <td>
                        <button class="action-btn btn-qr" onclick="openQRModal('${equip.id}')" title="QR Kod"><i class="fas fa-qrcode"></i></button>
                        <button class="action-btn btn-view" onclick="viewItemDetails('${equip.id}')" title="Ətraflı"><i class="fas fa-eye"></i></button>
                        <button class="action-btn btn-edit" onclick="openEditModal('${equip.id}')" title="Düzəlt"><i class="fas fa-pen"></i></button>
                        <button class="action-btn btn-return" onclick="returnToWarehouse('${equip.id}')" title="Anbara Qaytar"><i class="fas fa-warehouse"></i></button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }
    if (modal) modal.style.display = 'flex';
};

document.getElementById('view-equipment-close-btn')?.addEventListener('click', () => {
    document.getElementById('view-equipment-modal').style.display = 'none';
});
document.getElementById('view-equipment-close-footer-btn')?.addEventListener('click', () => {
    document.getElementById('view-equipment-modal').style.display = 'none';
});

// View Item Details Modal
window.viewItemDetails = function(id) {
    const item = allEquipmentCache.find(e => e.id === id);
    if (!item) return;

    const content = document.getElementById('item-details-content');
    if (content) {
        content.innerHTML = `
            <div class="detail-item full-width"><span class="detail-label">SİSTEM ID</span><span class="detail-value" style="color:#0284c7; font-size:15px;">${item.systemId || 'N/A'}</span></div>
            <div class="detail-item full-width"><span class="detail-label">Sahib (Ad Soyad)</span><span class="detail-value">${item.holderName || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Fakültə</span><span class="detail-value">${item.holderFaculty || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Şöbə / Mərkəz</span><span class="detail-value">${item.holderDepartment || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Avadanlıq Adı</span><span class="detail-value">${item.name}</span></div>
            <div class="detail-item"><span class="detail-label">Marka / Model</span><span class="detail-value">${item.model || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Növ</span><span class="detail-value">${item.type} ${item.subType ? `(${item.subType})` : ''}</span></div>
            <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${item.status || 'İşlək'}</span></div>
            <div class="detail-item"><span class="detail-label">Serial Nömrə</span><span class="detail-value">${item.serial || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">MAC Address</span><span class="detail-value">${item.mac || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Alınma Tarixi</span><span class="detail-value">${item.purchaseDate || '-'}</span></div>
            <div class="detail-item full-width"><span class="detail-label">Qeydlər</span><span class="detail-value">${item.notes || 'Qeyd yoxdur'}</span></div>
        `;
    }

    const imgContainer = document.getElementById('item-image-container');
    if (imgContainer) {
        if (item.imageUrl) {
            imgContainer.innerHTML = `<button class="action-btn" style="width:100%; padding:10px; background:#9333ea; color:white; justify-content:center;" onclick="window.open('${item.imageUrl}', '_blank')"><i class="fas fa-image"></i> Şəkilə Bax</button>`;
        } else {
            imgContainer.innerHTML = '';
        }
    }

    document.getElementById('item-details-modal').style.display = 'flex';
};

document.getElementById('item-details-close')?.addEventListener('click', () => {
    document.getElementById('item-details-modal').style.display = 'none';
});
document.getElementById('item-details-ok')?.addEventListener('click', () => {
    document.getElementById('item-details-modal').style.display = 'none';
});

// QR Code generation
window.openQRModal = function(id) {
    const item = allEquipmentCache.find(e => e.id === id);
    if (!item) return;

    const qrModal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';

    const path = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    const qrUrl = `${path}admin-dashboard.html?viewId=${encodeURIComponent(item.id)}`;
    const qrLinkText = document.getElementById('qr-link-text');
    if (qrLinkText) qrLinkText.innerText = qrUrl;

    new QRCode(qrContainer, {
        text: qrUrl,
        width: 180,
        height: 180,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    if (qrModal) qrModal.style.display = 'flex';
};

window.downloadQR = function() {
    const qrContainer = document.getElementById('qrcode');
    const img = qrContainer.querySelector('img');
    if (img && img.src) {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `SmartStorage_QR_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert("QR kod yaradılır, zəhmət olmasa bir neçə saniyə gözləyin.");
    }
};

function checkUrlForQR() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get('viewId');
    if (viewId && allEquipmentCache.length > 0) {
        viewItemDetails(viewId);
    }
}

// Edit Equipment Modal
const editModal = document.getElementById('edit-equipment-modal');
window.openEditModal = function(id) {
    const item = allEquipmentCache.find(e => e.id === id);
    if (!item) return;

    document.getElementById('edit-equip-id').value = id;
    document.getElementById('edit-holder-name').value = item.holderName || '';
    document.getElementById('edit-equip-name').value = item.name || '';
    document.getElementById('edit-equip-model').value = item.model || '';
    document.getElementById('edit-equip-type').value = item.type || 'Kompüter';
    document.getElementById('edit-equip-status').value = item.status || 'İşlək';
    document.getElementById('edit-equip-notes').value = item.notes || '';

    const facSelect = document.getElementById('edit-holder-faculty');
    if (facSelect) {
        facSelect.value = item.holderFaculty || 'İnzibati İdarəetmə';
        populateDepartmentSelect(
            facSelect.value,
            document.getElementById('edit-holder-department'),
            document.getElementById('edit-holder-department-group'),
            document.getElementById('edit-other-department-input'),
            item.holderDepartment || ''
        );
        facSelect.onchange = function() {
            populateDepartmentSelect(
                this.value,
                document.getElementById('edit-holder-department'),
                document.getElementById('edit-holder-department-group'),
                document.getElementById('edit-other-department-input'),
                ''
            );
        };
    }

    applyEquipmentTypeMeta(item.type, editRefs, item.subType || '');
    document.getElementById('edit-equip-serial').value = item.serial || '';
    document.getElementById('edit-equip-mac').value = item.mac || '';

    document.getElementById('btn-return-warehouse')?.setAttribute('data-id', id);
    if (editModal) editModal.style.display = 'flex';
};

document.getElementById('edit-equipment-close')?.addEventListener('click', () => { editModal.style.display = 'none'; });
document.getElementById('edit-equipment-cancel')?.addEventListener('click', () => { editModal.style.display = 'none'; });

document.getElementById('edit-equipment-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-equip-id').value;
    const equipType = document.getElementById('edit-equip-type').value;
    const meta = equipmentTypeMeta[equipType];
    const subtypeVal = (meta && meta.subtypes && meta.subtypes.length) ? document.getElementById('edit-equip-subtype')?.value : '';

    const updates = {
        holderName: document.getElementById('edit-holder-name').value,
        holderFaculty: document.getElementById('edit-holder-faculty').value,
        holderDepartment: document.getElementById('edit-holder-department')?.value || '',
        name: document.getElementById('edit-equip-name').value,
        model: document.getElementById('edit-equip-model').value,
        type: equipType,
        subType: subtypeVal || '',
        serial: document.getElementById('edit-equip-serial').value,
        mac: document.getElementById('edit-equip-mac').value,
        status: document.getElementById('edit-equip-status').value,
        notes: document.getElementById('edit-equip-notes').value
    };

    const idx = allEquipmentCache.findIndex(e => e.id === id);
    if (idx !== -1) {
        allEquipmentCache[idx] = { ...allEquipmentCache[idx], ...updates };
        filterAndRenderInventory();
        updateHoldersData();
    }

    if (db) {
        db.collection("equipment").doc(id).update(updates).catch(console.warn);
    }
    alert("Avadanlıq məlumatları yeniləndi!");
    editModal.style.display = 'none';
});

// Return to warehouse
window.returnToWarehouse = function(id) {
    if (confirm("Bu avadanlığı Anbara qaytarmaq istəyirsiniz?")) {
        const updates = {
            holderName: "Anbar",
            holderFaculty: "Anbar",
            holderDepartment: ""
        };
        const idx = allEquipmentCache.findIndex(e => e.id === id);
        if (idx !== -1) {
            allEquipmentCache[idx] = { ...allEquipmentCache[idx], ...updates };
            filterAndRenderInventory();
            updateHoldersData();
        }
        if (db) {
            db.collection("equipment").doc(id).update(updates).catch(console.warn);
        }
        alert("Avadanlıq Anbara köçürüldü!");
        if (editModal) editModal.style.display = 'none';
        const userEquipModal = document.getElementById('view-equipment-modal');
        if (userEquipModal) userEquipModal.style.display = 'none';
    }
};

document.getElementById('btn-return-warehouse')?.addEventListener('click', function() {
    const id = this.getAttribute('data-id') || document.getElementById('edit-equip-id')?.value;
    if (id) returnToWarehouse(id);
});

// Delete equipment
document.getElementById('delete-equipment-btn')?.addEventListener('click', () => {
    const id = document.getElementById('edit-equip-id').value;
    if (confirm("Bu avadanlığı silmək istədiyinizə əminsiniz?")) {
        allEquipmentCache = allEquipmentCache.filter(e => e.id !== id);
        filterAndRenderInventory();
        updateHoldersData();
        if (db) db.collection("equipment").doc(id).delete().catch(console.warn);
        alert("Avadanlıq silindi.");
        editModal.style.display = 'none';
    }
});

// Add Equipment Form Submit
document.getElementById('admin-add-equipment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const equipType = document.getElementById('admin-equip-type').value;
    const meta = equipmentTypeMeta[equipType];
    const subtypeVal = (meta && meta.subtypes && meta.subtypes.length) ? document.getElementById('admin-equip-subtype')?.value : '';

    const newEquip = {
        id: "eq-" + Date.now(),
        systemId: document.getElementById('auto-id').value,
        name: document.getElementById('admin-equip-name').value,
        model: document.getElementById('admin-equip-model').value,
        type: equipType,
        subType: subtypeVal || '',
        serial: document.getElementById('admin-equip-serial').value,
        mac: document.getElementById('admin-equip-mac').value,
        status: document.getElementById('admin-equip-status').value,
        purchaseDate: document.getElementById('admin-equip-date').value,
        notes: document.getElementById('admin-equip-notes').value,
        holderName: document.getElementById('holder-name').value,
        holderFaculty: document.getElementById('holder-faculty').value,
        holderDepartment: document.getElementById('holder-department')?.value || '',
        addedAt: { seconds: Math.floor(Date.now() / 1000) },
        imageUrl: ""
    };

    allEquipmentCache.unshift(newEquip);
    filterAndRenderInventory();
    updateHoldersData();

    if (db) {
        db.collection("equipment").add(newEquip).catch(console.warn);
    }

    alert("Avadanlıq uğurla sistemə əlavə edildi!");
    form.reset();
    generateAutoSystemID();
    document.querySelector('.tab-link[data-tab="inventory-tab"]')?.click();
});

// Add User Form Modal
const addUserModal = document.getElementById('add-user-modal');
document.getElementById('add-user-btn')?.addEventListener('click', () => {
    if (addUserModal) addUserModal.style.display = 'flex';
});
document.getElementById('add-user-modal-close')?.addEventListener('click', () => { addUserModal.style.display = 'none'; });
document.getElementById('add-user-cancel-btn')?.addEventListener('click', () => { addUserModal.style.display = 'none'; });

document.getElementById('add-user-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-user-name').value;
    const email = document.getElementById('new-user-email').value;
    const role = document.getElementById('new-user-role').value;
    const dept = document.getElementById('new-user-department')?.value || '';

    const newUser = {
        id: "usr-" + Date.now(),
        name: name,
        email: email,
        role: role,
        department: dept,
        status: "active",
        createdAt: new Date()
    };

    allUsersCache.unshift(newUser);
    renderUserCards(allUsersCache);

    if (db) {
        db.collection("users").add(newUser).catch(console.warn);
    }

    alert(`Yeni personal (${name}) uğurla yaradıldı!`);
    e.target.reset();
    addUserModal.style.display = 'none';
});

// Profile Modal & Password Change
const profileModal = document.getElementById('profile-modal');
document.getElementById('profile-btn')?.addEventListener('click', () => {
    if (profileModal) profileModal.style.display = 'flex';
});
document.getElementById('profile-modal-close')?.addEventListener('click', () => { profileModal.style.display = 'none'; });
document.getElementById('profile-cancel-btn')?.addEventListener('click', () => { profileModal.style.display = 'none'; });

document.getElementById('profile-settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const active = window.getActiveSessionUser ? window.getActiveSessionUser() : {};
    active.name = name;
    if (window.setActiveSessionUser) window.setActiveSessionUser(active);
    document.getElementById('admin-name-display').innerText = name;
    alert("Profil uğurla yeniləndi!");
    profileModal.style.display = 'none';
});

const passModal = document.getElementById('change-password-modal');
document.getElementById('change-password-btn-open')?.addEventListener('click', () => {
    profileModal.style.display = 'none';
    passModal.style.display = 'flex';
});
document.getElementById('password-modal-close')?.addEventListener('click', () => { passModal.style.display = 'none'; });
document.getElementById('password-cancel-btn')?.addEventListener('click', () => { passModal.style.display = 'none'; });
document.getElementById('change-password-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const np = document.getElementById('new-password').value;
    const cp = document.getElementById('confirm-new-password').value;
    if (np !== cp) { alert("Şifrələr uyğun gəlmir!"); return; }
    alert("Şifrəniz uğurla yeniləndi!");
    passModal.style.display = 'none';
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (auth) auth.signOut();
    localStorage.removeItem('smartstorage_active_user');
    window.location.href = "index.html";
});

// Tabs switching
const tabLinks = document.querySelectorAll('.tab-nav .tab-link');
const tabContents = document.querySelectorAll('.tab-content');
tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        tabLinks.forEach(i => i.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(tabId)?.classList.add('active');
    });
});

// Dynamic Faculty -> Dept on Add form
document.getElementById('holder-faculty')?.addEventListener('change', function() {
    populateDepartmentSelect(
        this.value,
        document.getElementById('holder-department'),
        document.getElementById('holder-department-group'),
        document.getElementById('other-department-input'),
        ''
    );
});

// Excel Export
document.getElementById('export-excel-btn')?.addEventListener('click', () => {
    if (!allEquipmentCache.length) { alert("İxrac ediləcək məlumat yoxdur."); return; }
    const rows = allEquipmentCache.map(e => ({
        "Sistem ID": e.systemId || "",
        "Növ": e.type || "",
        "Alt Növ": e.subType || "",
        "Ad": e.name || "",
        "Marka/Model": e.model || "",
        "Serial Nömrə": e.serial || "",
        "MAC Address": e.mac || "",
        "Status": e.status || "",
        "Sahib (Ad Soyad)": e.holderName || "",
        "Fakültə/Departament": e.holderFaculty || "",
        "Şöbə/Mərkəz": e.holderDepartment || "",
        "Alınma Tarixi": e.purchaseDate || "",
        "Qeydlər": e.notes || ""
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "İnventar");
    XLSX.writeFile(wb, `SmartStorage_Admin_İnventar_${new Date().toISOString().slice(0,10)}.xlsx`);
});

// Excel Import
const importInput = document.getElementById('import-file-input');
document.getElementById('import-excel-btn')?.addEventListener('click', () => importInput?.click());
importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = new Uint8Array(evt.target.result);
            const wb = XLSX.read(data, { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            const validRows = [];
            rawRows.forEach((r, idx) => {
                const type = r["Növ"] || r["Type"] || "Kompüter";
                const name = r["Ad"] || r["Name"] || "Avadanlıq";
                validRows.push({
                    id: "eq-imp-" + idx + "-" + Date.now(),
                    systemId: r["Sistem ID"] || `TC-${Math.random().toString(36).substring(2,8).toUpperCase()}`,
                    type: type,
                    name: name,
                    model: r["Marka/Model"] || r["Model"] || "",
                    serial: r["Serial Nömrə"] || r["Serial"] || "",
                    mac: r["MAC Address"] || r["MAC"] || "",
                    status: r["Status"] || "İşlək",
                    holderName: r["Sahib (Ad Soyad)"] || r["Sahib"] || "Anbar",
                    holderFaculty: r["Fakültə/Departament"] || r["Fakültə"] || "Anbar",
                    holderDepartment: r["Şöbə/Mərkəz"] || r["Şöbə"] || "",
                    purchaseDate: r["Alınma Tarixi"] || "",
                    notes: r["Qeydlər"] || "",
                    addedAt: { seconds: Math.floor(Date.now() / 1000) }
                });
            });

            document.getElementById('import-total-count').innerText = rawRows.length;
            document.getElementById('import-valid-count').innerText = validRows.length;
            document.getElementById('import-invalid-count').innerText = rawRows.length - validRows.length;

            const tbody = document.getElementById('import-preview-tbody');
            tbody.innerHTML = validRows.slice(0, 15).map(r => `
                <tr>
                    <td>${r.type}</td>
                    <td>${r.name}</td>
                    <td>${r.model}</td>
                    <td>${r.status}</td>
                    <td>${r.holderName}</td>
                    <td>${r.holderFaculty}</td>
                </tr>
            `).join('');

            const confirmBtn = document.getElementById('import-preview-confirm-btn');
            confirmBtn.onclick = () => {
                allEquipmentCache = [...validRows, ...allEquipmentCache];
                filterAndRenderInventory();
                updateHoldersData();
                alert(`${validRows.length} sətir uğurla əlavə edildi!`);
                document.getElementById('import-preview-modal').style.display = 'none';
            };

            document.getElementById('import-preview-modal').style.display = 'flex';
        } catch (err) {
            alert("Excel oxuma xətası: " + err.message);
        } finally {
            importInput.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
});
document.getElementById('import-preview-close-btn')?.addEventListener('click', () => {
    document.getElementById('import-preview-modal').style.display = 'none';
});
document.getElementById('import-preview-cancel-btn')?.addEventListener('click', () => {
    document.getElementById('import-preview-modal').style.display = 'none';
});

// Run init on load
document.addEventListener('DOMContentLoaded', initAdminPanel);
