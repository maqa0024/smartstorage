// === DEPARTMENT MANAGER CONTROLLER (Şöbə Müdiri Məntiqi) ===

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

let currentManagerDept = "Mükəmməllik Mərkəzi";
let managerUser = null;
let allEquipmentCache = [];
let allUsersCache = [];

function initManagerPanel() {
    managerUser = window.getActiveSessionUser ? window.getActiveSessionUser() : null;
    if (!managerUser) {
        managerUser = {
            id: "mgr-demo-1",
            name: "Məmməd Məmmədli",
            email: "mahammadli@qu.edu.az",
            role: "manager",
            department: "Mükəmməllik Mərkəzi"
        };
    }

    if (managerUser.department) {
        currentManagerDept = managerUser.department;
    }

    const nameEl = document.getElementById('manager-name-display');
    if (nameEl) nameEl.innerText = managerUser.name || "Şöbə Müdiri";
    const headerPic = document.getElementById('profile-pic-header');
    if (headerPic) headerPic.innerText = (managerUser.name || "ŞM").split(' ').map(n=>n[0]).join('').substring(0,2);

    const titleEl = document.getElementById('managed-dept-title');
    if (titleEl) titleEl.innerText = currentManagerDept;
    const deptSwitcher = document.getElementById('dept-switcher-select');
    if (deptSwitcher) {
        deptSwitcher.value = currentManagerDept;
        deptSwitcher.onchange = function() {
            currentManagerDept = this.value;
            if (titleEl) titleEl.innerText = currentManagerDept;
            filterAndRenderDeptData();
        };
    }

    const profName = document.getElementById('profile-name');
    const profEmail = document.getElementById('profile-email');
    const profDept = document.getElementById('profile-dept');
    if (profName) profName.value = managerUser.name || '';
    if (profEmail) profEmail.value = managerUser.email || '';
    if (profDept) profDept.value = currentManagerDept;

    loadData();
}

function loadData() {
    if (db) {
        db.collection("equipment").onSnapshot(snapshot => {
            if (!snapshot.empty) {
                allEquipmentCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else if (allEquipmentCache.length === 0) {
                allEquipmentCache = [...window.INITIAL_DEMO_EQUIPMENT];
            }
            filterAndRenderDeptData();
            checkUrlForQR();
        }, err => {
            console.warn("Manager Firestore listener note:", err);
            allEquipmentCache = [...window.INITIAL_DEMO_EQUIPMENT];
            filterAndRenderDeptData();
        });

        db.collection("users").onSnapshot(snapshot => {
            if (!snapshot.empty) {
                allUsersCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else if (allUsersCache.length === 0) {
                allUsersCache = [...window.INITIAL_DEMO_USERS];
            }
            renderDeptStaff();
            populateTransferSelects();
        }, err => {
            allUsersCache = [...window.INITIAL_DEMO_USERS];
            renderDeptStaff();
            populateTransferSelects();
        });
    } else {
        allEquipmentCache = [...window.INITIAL_DEMO_EQUIPMENT];
        allUsersCache = [...window.INITIAL_DEMO_USERS];
        filterAndRenderDeptData();
        renderDeptStaff();
        populateTransferSelects();
    }
}

// Get only items belonging to this department
function getDeptEquipment() {
    return allEquipmentCache.filter(e => {
        const itemDept = e.holderDepartment || '';
        const itemFac = e.holderFaculty || '';
        return itemDept === currentManagerDept || itemFac === currentManagerDept;
    });
}

function filterAndRenderDeptData() {
    const deptItems = getDeptEquipment();
    const islekCount = deptItems.filter(e => e.status === 'İşlək').length;
    const xarabCount = deptItems.filter(e => e.status !== 'İşlək').length;

    const deptStaff = allUsersCache.filter(u => (u.department || '') === currentManagerDept);

    document.getElementById('stat-dept-total').innerText = deptItems.length;
    document.getElementById('stat-dept-islek').innerText = islekCount;
    document.getElementById('stat-dept-xarab').innerText = xarabCount;
    document.getElementById('stat-dept-staff').innerText = deptStaff.length || new Set(deptItems.map(e=>e.holderName).filter(Boolean)).size;

    renderDeptInventoryCards(deptItems);
    renderDeptStaff();
    populateTransferSelects();
}

function renderDeptInventoryCards(items) {
    const container = document.getElementById('dept-equipment-list');
    const emptyState = document.getElementById('dept-empty-state');
    if (!container) return;
    container.innerHTML = '';

    const searchTerm = (document.getElementById('dept-inv-search')?.value || '').toLowerCase();
    const filterType = document.getElementById('dept-filter-type')?.value || '';
    const filterStatus = document.getElementById('dept-filter-status')?.value || '';

    let filtered = items;
    if (filterType) filtered = filtered.filter(e => e.type === filterType);
    if (filterStatus) filtered = filtered.filter(e => e.status === filterStatus);
    if (searchTerm) {
        filtered = filtered.filter(e => {
            const raw = `${e.name} ${e.model} ${e.serial} ${e.holderName} ${e.systemId} ${e.notes}`.toLowerCase();
            return raw.includes(searchTerm);
        });
    }

    if (filtered.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    filtered.forEach(equip => {
        const statusClass = (equip.status || 'işlək').toLowerCase();
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
                    <span class="tag holder-tag"><i class="fas fa-user"></i> ${equip.holderName || 'Şöbə daxili'}</span>
                    <span class="tag" style="background:#f3e8ff; color:#7e22ce;"><i class="fas fa-building"></i> ${currentManagerDept}</span>
                    <span class="tag" style="background:#f1f5f9; color:#475569; font-family:monospace;">${equip.systemId || '-'}</span>
                </div>
                <div class="card-details-list">
                    <div><span>Növ:</span> <span>${equip.type} ${equip.subType ? `(${equip.subType})` : ''}</span></div>
                    <div><span>Serial:</span> <span style="font-family:monospace;">${equip.serial || '-'}</span></div>
                    <div><span>Alınma:</span> <span>${equip.purchaseDate || '-'}</span></div>
                </div>
                <div class="card-footer">
                    <span><i class="fas fa-info-circle"></i> Şöbə inventarı</span>
                    <div class="card-action-buttons">
                        <button class="action-btn btn-qr" onclick="openQRModal('${equip.id}')" title="QR Kod"><i class="fas fa-qrcode"></i></button>
                        <button class="action-btn btn-view" onclick="viewItemDetails('${equip.id}')" title="Ətraflı"><i class="fas fa-eye"></i></button>
                        <button class="action-btn" style="background:#fdf4ff; color:#9333ea;" onclick="quickReassign('${equip.id}')" title="Köçür"><i class="fas fa-right-left"></i></button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

document.getElementById('dept-inv-search')?.addEventListener('input', () => filterAndRenderDeptData());
document.getElementById('dept-filter-type')?.addEventListener('change', () => filterAndRenderDeptData());
document.getElementById('dept-filter-status')?.addEventListener('change', () => filterAndRenderDeptData());

// Staff tab
function renderDeptStaff() {
    const container = document.getElementById('dept-staff-list');
    const emptyState = document.getElementById('staff-empty-state');
    if (!container) return;
    container.innerHTML = '';

    const searchTerm = (document.getElementById('dept-staff-search')?.value || '').toLowerCase();
    const deptItems = getDeptEquipment();

    // Map holders in this dept
    const staffMap = {};
    allUsersCache.filter(u => (u.department || '') === currentManagerDept).forEach(u => {
        staffMap[u.name] = { name: u.name, email: u.email, count: 0 };
    });

    deptItems.forEach(e => {
        if (e.holderName && e.holderName !== 'Anbar') {
            if (!staffMap[e.holderName]) {
                staffMap[e.holderName] = { name: e.holderName, email: `${e.holderName.toLowerCase().replace(/\s+/g, '.')}@qu.edu.az`, count: 0 };
            }
            staffMap[e.holderName].count++;
        }
    });

    const staffList = Object.values(staffMap);
    let hasItems = false;

    staffList.forEach(st => {
        const raw = `${st.name} ${st.email}`.toLowerCase();
        if (searchTerm && !raw.includes(searchTerm)) return;

        hasItems = true;
        const initials = st.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();
        const card = `
            <div class="holder-card">
                <div class="holder-header">
                    <div class="holder-icon" style="background:#f3e8ff; color:#9333ea;">${initials}</div>
                    <div class="holder-details">
                        <h3>${st.name}</h3>
                        <p>${st.email} • <span style="color:#7e22ce; font-weight:600;">${currentManagerDept}</span></p>
                    </div>
                </div>
                <div class="holder-stats">
                    <span>Təhkim Olunmuş Avadanlıq:</span>
                    <span class="holder-count" style="color:#9333ea;">${st.count} ədəd</span>
                </div>
                <button class="action-btn" style="width:100%; padding:9px; background:#9333ea; color:white; justify-content:center;" onclick="openHolderInventory('${st.name}')">
                    <i class="fas fa-list-check"></i> Əməkdaşın Avadanlıqlarına Bax
                </button>
            </div>
        `;
        container.innerHTML += card;
    });

    if (emptyState) emptyState.style.display = hasItems ? 'none' : 'block';
}

document.getElementById('dept-staff-search')?.addEventListener('input', renderDeptStaff);

// Transfer Tab Logic
function populateTransferSelects() {
    const equipSelect = document.getElementById('transfer-equip-select');
    const targetHolderSelect = document.getElementById('transfer-target-holder');
    if (!equipSelect || !targetHolderSelect) return;

    const deptItems = getDeptEquipment();
    equipSelect.innerHTML = '<option value="" disabled selected>Avadanlıq seçin...</option>';
    deptItems.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = `${e.name} (${e.model || '-'}) - Sahib: ${e.holderName || 'Yoxdur'}`;
        equipSelect.appendChild(opt);
    });

    equipSelect.onchange = function() {
        const selected = deptItems.find(e => e.id === this.value);
        if (selected) {
            document.getElementById('transfer-current-holder').value = selected.holderName || 'Təyin edilməyib';
        }
    };

    targetHolderSelect.innerHTML = '<option value="" disabled selected>Əməkdaş seçin...</option>';
    const deptStaff = allUsersCache.filter(u => (u.department || '') === currentManagerDept);
    deptStaff.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.name;
        opt.textContent = `${u.name} (${u.email})`;
        targetHolderSelect.appendChild(opt);
    });

    const anbarOpt = document.createElement('option');
    anbarOpt.value = "Anbar";
    anbarOpt.textContent = "🏢 Anbara Qaytar (Təsərrüfat şöbəsi)";
    targetHolderSelect.appendChild(anbarOpt);
}

window.quickReassign = function(equipId) {
    document.querySelector('.tab-link[data-tab="dept-transfer-tab"]')?.click();
    const select = document.getElementById('transfer-equip-select');
    if (select) {
        select.value = equipId;
        select.dispatchEvent(new Event('change'));
    }
};

document.getElementById('dept-transfer-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const equipId = document.getElementById('transfer-equip-select').value;
    const targetHolder = document.getElementById('transfer-target-holder').value;
    const notes = document.getElementById('transfer-notes').value;

    const equip = allEquipmentCache.find(item => item.id === equipId);
    if (!equip) return;

    const updates = {
        holderName: targetHolder,
        holderDepartment: targetHolder === 'Anbar' ? '' : currentManagerDept,
        notes: (equip.notes ? equip.notes + " | " : "") + `Köçürmə (${new Date().toLocaleDateString()}): ${targetHolder}. ${notes}`
    };

    const idx = allEquipmentCache.findIndex(item => item.id === equipId);
    if (idx !== -1) {
        allEquipmentCache[idx] = { ...allEquipmentCache[idx], ...updates };
        filterAndRenderDeptData();
    }

    if (db) {
        db.collection("equipment").doc(equipId).update(updates).catch(console.warn);
    }

    alert(`Avadanlıq uğurla "${targetHolder}" adlı əməkdaşa təhkim edildi!`);
    e.target.reset();
    document.querySelector('.tab-link[data-tab="dept-inventory-tab"]')?.click();
});

// View Details Modal
window.viewItemDetails = function(id) {
    const item = allEquipmentCache.find(e => e.id === id);
    if (!item) return;

    const content = document.getElementById('item-details-content');
    if (content) {
        content.innerHTML = `
            <div class="detail-item full-width"><span class="detail-label">SİSTEM ID</span><span class="detail-value" style="color:#9333ea; font-size:15px;">${item.systemId || 'N/A'}</span></div>
            <div class="detail-item full-width"><span class="detail-label">Sahib</span><span class="detail-value">${item.holderName || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Şöbə</span><span class="detail-value">${item.holderDepartment || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${item.status || 'İşlək'}</span></div>
            <div class="detail-item"><span class="detail-label">Avadanlıq Adı</span><span class="detail-value">${item.name}</span></div>
            <div class="detail-item"><span class="detail-label">Model</span><span class="detail-value">${item.model || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Serial No</span><span class="detail-value">${item.serial || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">MAC</span><span class="detail-value">${item.mac || '-'}</span></div>
            <div class="detail-item full-width"><span class="detail-label">Qeyd</span><span class="detail-value">${item.notes || 'Qeyd yoxdur'}</span></div>
        `;
    }

    const imgContainer = document.getElementById('item-image-container');
    if (imgContainer) {
        imgContainer.innerHTML = item.imageUrl ? `<button class="action-btn" style="width:100%; padding:10px; background:#9333ea; color:white; justify-content:center;" onclick="window.open('${item.imageUrl}', '_blank')"><i class="fas fa-image"></i> Şəkilə Bax</button>` : '';
    }

    document.getElementById('item-details-modal').style.display = 'flex';
};

document.getElementById('item-details-close')?.addEventListener('click', () => { document.getElementById('item-details-modal').style.display = 'none'; });
document.getElementById('item-details-ok')?.addEventListener('click', () => { document.getElementById('item-details-modal').style.display = 'none'; });

// QR Modal
window.openQRModal = function(id) {
    const item = allEquipmentCache.find(e => e.id === id);
    if (!item) return;

    const qrModal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';

    const path = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    const qrUrl = `${path}manager-dashboard.html?viewId=${encodeURIComponent(item.id)}`;
    document.getElementById('qr-link-text').innerText = qrUrl;

    new QRCode(qrContainer, {
        text: qrUrl,
        width: 180,
        height: 180,
        colorDark: "#6b21a8",
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
        a.download = `SmartStorage_DeptQR_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

function checkUrlForQR() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get('viewId');
    if (viewId && allEquipmentCache.length > 0) {
        viewItemDetails(viewId);
    }
}

// Open specific employee inventory
window.openHolderInventory = function(holderName) {
    const modal = document.getElementById('view-equipment-modal');
    document.getElementById('view-equip-holder-name').innerText = holderName;
    const tbody = document.getElementById('user-specific-equipment-tbody');
    const emptyState = document.getElementById('user-specific-empty-state');
    tbody.innerHTML = '';

    const items = getDeptEquipment().filter(e => e.holderName === holderName);
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
                    <td style="font-family:monospace; color:#9333ea;">${equip.systemId || '-'}</td>
                    <td>
                        <button class="action-btn btn-qr" onclick="openQRModal('${equip.id}')" title="QR Kod"><i class="fas fa-qrcode"></i></button>
                        <button class="action-btn btn-view" onclick="viewItemDetails('${equip.id}')" title="Ətraflı"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }
    if (modal) modal.style.display = 'flex';
};
document.getElementById('view-equipment-close-btn')?.addEventListener('click', () => { document.getElementById('view-equipment-modal').style.display = 'none'; });
document.getElementById('view-equipment-close-footer-btn')?.addEventListener('click', () => { document.getElementById('view-equipment-modal').style.display = 'none'; });

// Excel Export for department
document.getElementById('dept-export-excel-btn')?.addEventListener('click', () => {
    const deptItems = getDeptEquipment();
    if (!deptItems.length) { alert("Şöbəyə aid ixrac ediləcək avadanlıq yoxdur."); return; }
    const rows = deptItems.map(e => ({
        "Sistem ID": e.systemId || "",
        "Növ": e.type || "",
        "Ad": e.name || "",
        "Marka/Model": e.model || "",
        "Serial Nömrə": e.serial || "",
        "MAC Address": e.mac || "",
        "Status": e.status || "",
        "Təhkim Olunan Əməkdaş": e.holderName || "",
        "Şöbə/Mərkəz": currentManagerDept,
        "Alınma Tarixi": e.purchaseDate || "",
        "Qeydlər": e.notes || ""
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Şöbə İnventarı");
    XLSX.writeFile(wb, `SmartStorage_${currentManagerDept.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`);
});

// Profile Modal
document.getElementById('profile-btn')?.addEventListener('click', () => {
    document.getElementById('profile-modal').style.display = 'flex';
});
document.getElementById('profile-modal-close')?.addEventListener('click', () => { document.getElementById('profile-modal').style.display = 'none'; });
document.getElementById('profile-cancel-btn')?.addEventListener('click', () => { document.getElementById('profile-modal').style.display = 'none'; });
document.getElementById('profile-settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = document.getElementById('profile-name').value;
    if (managerUser) managerUser.name = newName;
    if (window.setActiveSessionUser) window.setActiveSessionUser(managerUser);
    document.getElementById('manager-name-display').innerText = newName;
    alert("Profil məlumatları yeniləndi!");
    document.getElementById('profile-modal').style.display = 'none';
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (auth) auth.signOut();
    localStorage.removeItem('smartstorage_active_user');
    window.location.href = "index.html";
});

// Tabs
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

document.addEventListener('DOMContentLoaded', initManagerPanel);
