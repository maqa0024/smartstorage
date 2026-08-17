// === EMPLOYEE CONTROLLER (Sıravi İşçi / Əməkdaş Məntiqi) ===

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

let currentEmployee = null;
let allEquipmentCache = [];

function initUserPanel() {
    currentEmployee = window.getActiveSessionUser ? window.getActiveSessionUser() : null;
    if (!currentEmployee) {
        currentEmployee = {
            id: "emp-demo-1",
            name: "Aysel Qasımova",
            email: "a.gasimova@qu.edu.az",
            role: "employee",
            department: "Mükəmməllik Mərkəzi"
        };
    }

    const nameEl = document.getElementById('user-name-display');
    if (nameEl) nameEl.innerText = currentEmployee.name || "Sıravi Əməkdaş";
    const headerPic = document.getElementById('profile-pic-header');
    if (headerPic) headerPic.innerText = (currentEmployee.name || "ƏM").split(' ').map(n=>n[0]).join('').substring(0,2);

    const titleEl = document.getElementById('personal-welcome-title');
    if (titleEl) titleEl.innerText = `${currentEmployee.name} - Şəxsi İnventar`;

    const userSwitch = document.getElementById('user-switch-test');
    if (userSwitch) {
        userSwitch.value = currentEmployee.name || "Aysel Qasımova";
        userSwitch.onchange = function() {
            currentEmployee.name = this.value;
            if (titleEl) titleEl.innerText = `${currentEmployee.name} - Şəxsi İnventar`;
            if (nameEl) nameEl.innerText = currentEmployee.name;
            if (window.setActiveSessionUser) window.setActiveSessionUser(currentEmployee);
            filterAndRenderMyInventory();
        };
    }

    const profName = document.getElementById('profile-name');
    const profEmail = document.getElementById('profile-email');
    if (profName) profName.value = currentEmployee.name || '';
    if (profEmail) profEmail.value = currentEmployee.email || '';

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
            filterAndRenderMyInventory();
            checkUrlForQR();
        }, err => {
            console.warn("User Firestore listener fallback:", err);
            allEquipmentCache = [...window.INITIAL_DEMO_EQUIPMENT];
            filterAndRenderMyInventory();
        });
    } else {
        allEquipmentCache = [...window.INITIAL_DEMO_EQUIPMENT];
        filterAndRenderMyInventory();
    }
}

// Get only items assigned to this employee
function getMyEquipment() {
    const empName = (currentEmployee?.name || '').trim().toLowerCase();
    return allEquipmentCache.filter(e => {
        const holder = (e.holderName || '').trim().toLowerCase();
        return holder === empName || (empName && holder.includes(empName));
    });
}

function filterAndRenderMyInventory() {
    const myItems = getMyEquipment();
    const islekCount = myItems.filter(e => e.status === 'İşlək').length;
    const xarabCount = myItems.filter(e => e.status !== 'İşlək').length;

    const myTotalEl = document.getElementById('stat-my-total');
    const myIslekEl = document.getElementById('stat-my-islek');
    const myXarabEl = document.getElementById('stat-my-xarab');

    if (myTotalEl) myTotalEl.innerText = myItems.length;
    if (myIslekEl) myIslekEl.innerText = islekCount;
    if (myXarabEl) myXarabEl.innerText = xarabCount;

    renderCards(myItems);
    populateReportSelect(myItems);
}

function renderCards(items) {
    const container = document.getElementById('my-equipment-list');
    const emptyState = document.getElementById('my-empty-state');
    if (!container) return;
    container.innerHTML = '';

    const searchTerm = (document.getElementById('my-inv-search')?.value || '').toLowerCase();

    let filtered = items;
    if (searchTerm) {
        filtered = filtered.filter(e => {
            const raw = `${e.name} ${e.model} ${e.serial} ${e.type} ${e.systemId} ${e.notes}`.toLowerCase();
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
                    <span class="tag holder-tag"><i class="fas fa-user-check"></i> Şəxsi təhkim</span>
                    <span class="tag" style="background:#dcfce7; color:#15803d;"><i class="fas fa-barcode"></i> ${equip.systemId || '-'}</span>
                </div>
                <div class="card-details-list">
                    <div><span>Növ:</span> <span>${equip.type} ${equip.subType ? `(${equip.subType})` : ''}</span></div>
                    <div><span>Serial No:</span> <span style="font-family:monospace;">${equip.serial || '-'}</span></div>
                    <div><span>MAC:</span> <span style="font-family:monospace;">${equip.mac || '-'}</span></div>
                    <div><span>Alınma:</span> <span>${equip.purchaseDate || '-'}</span></div>
                </div>
                <div class="card-footer">
                    <span><i class="fas fa-circle-check" style="color:#059669;"></i> Şəxsi inventar</span>
                    <div class="card-action-buttons">
                        <button class="action-btn btn-qr" onclick="openQRModal('${equip.id}')" title="QR Kod"><i class="fas fa-qrcode"></i> QR</button>
                        <button class="action-btn btn-view" onclick="viewItemDetails('${equip.id}')" title="Ətraflı"><i class="fas fa-eye"></i> Detallar</button>
                        <button class="action-btn" style="background:#fef3c7; color:#d97706;" onclick="reportThisItem('${equip.id}')" title="Nasazlıq Bildir"><i class="fas fa-triangle-exclamation"></i></button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

document.getElementById('my-inv-search')?.addEventListener('input', () => filterAndRenderMyInventory());

// Populate report select
function populateReportSelect(items) {
    const select = document.getElementById('report-equip-select');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Avadanlığı seçin...</option>';
    items.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = `${e.name} (${e.model || '-'}) - Sistem ID: ${e.systemId || '-'}`;
        select.appendChild(opt);
    });
}

window.reportThisItem = function(id) {
    document.querySelector('.tab-link[data-tab="report-issue-tab"]')?.click();
    const select = document.getElementById('report-equip-select');
    if (select) select.value = id;
};

// Report form submission
document.getElementById('report-issue-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const equipId = document.getElementById('report-equip-select').value;
    const newStatus = document.getElementById('report-status-select').value;
    const desc = document.getElementById('report-problem-desc').value;

    const equip = allEquipmentCache.find(i => i.id === equipId);
    if (!equip) return;

    const updates = {
        status: newStatus,
        notes: (equip.notes ? equip.notes + " | " : "") + `[Nasazlıq Bildirişi - ${new Date().toLocaleDateString()}]: ${desc}`
    };

    const idx = allEquipmentCache.findIndex(i => i.id === equipId);
    if (idx !== -1) {
        allEquipmentCache[idx] = { ...allEquipmentCache[idx], ...updates };
        filterAndRenderMyInventory();
    }

    if (db) {
        db.collection("equipment").doc(equipId).update(updates).catch(console.warn);
    }

    alert("Müraciətiniz qeydə alındı və rəhbərliyə göndərildi!");
    e.target.reset();
    document.querySelector('.tab-link[data-tab="my-inventory-tab"]')?.click();
});

// View Details Modal
window.viewItemDetails = function(id) {
    const item = allEquipmentCache.find(e => e.id === id);
    if (!item) return;

    const content = document.getElementById('item-details-content');
    if (content) {
        content.innerHTML = `
            <div class="detail-item full-width"><span class="detail-label">SİSTEM ID</span><span class="detail-value" style="color:#059669; font-size:15px;">${item.systemId || 'N/A'}</span></div>
            <div class="detail-item full-width"><span class="detail-label">Sahib</span><span class="detail-value">${item.holderName || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Avadanlıq Adı</span><span class="detail-value">${item.name}</span></div>
            <div class="detail-item"><span class="detail-label">Marka / Model</span><span class="detail-value">${item.model || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Növ</span><span class="detail-value">${item.type} ${item.subType ? `(${item.subType})` : ''}</span></div>
            <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${item.status || 'İşlək'}</span></div>
            <div class="detail-item"><span class="detail-label">Serial Nömrə</span><span class="detail-value">${item.serial || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">MAC Address</span><span class="detail-value">${item.mac || '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Alınma Tarixi</span><span class="detail-value">${item.purchaseDate || '-'}</span></div>
            <div class="detail-item full-width"><span class="detail-label">Qeyd</span><span class="detail-value">${item.notes || 'Qeyd yoxdur'}</span></div>
        `;
    }

    const imgContainer = document.getElementById('item-image-container');
    if (imgContainer) {
        imgContainer.innerHTML = item.imageUrl ? `<button class="action-btn" style="width:100%; padding:10px; background:#059669; color:white; justify-content:center;" onclick="window.open('${item.imageUrl}', '_blank')"><i class="fas fa-image"></i> Şəkilə Bax</button>` : '';
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
    const qrUrl = `${path}user-dashboard.html?viewId=${encodeURIComponent(item.id)}`;
    document.getElementById('qr-link-text').innerText = qrUrl;

    new QRCode(qrContainer, {
        text: qrUrl,
        width: 180,
        height: 180,
        colorDark: "#047857",
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
        a.download = `SmartStorage_UserQR_${Date.now()}.png`;
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

// Profile Modal
document.getElementById('profile-btn')?.addEventListener('click', () => {
    document.getElementById('profile-modal').style.display = 'flex';
});
document.getElementById('profile-modal-close')?.addEventListener('click', () => { document.getElementById('profile-modal').style.display = 'none'; });
document.getElementById('profile-cancel-btn')?.addEventListener('click', () => { document.getElementById('profile-modal').style.display = 'none'; });
document.getElementById('profile-settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = document.getElementById('profile-name').value;
    if (currentEmployee) currentEmployee.name = newName;
    if (window.setActiveSessionUser) window.setActiveSessionUser(currentEmployee);
    document.getElementById('user-name-display').innerText = newName;
    document.getElementById('personal-welcome-title').innerText = `${newName} - Şəxsi İnventar`;
    filterAndRenderMyInventory();
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

document.addEventListener('DOMContentLoaded', initUserPanel);
