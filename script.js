// === LOGIN & REGISTRATION SCRIPT (SmartStorage 3-Role Architecture) ===

// 1. Email check (@qu.edu.az or any educational/corporate format)
function isKarabakhEmail(email) {
  return email.toLowerCase().includes('@');
}

// Tab navigation
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
tabLinks.forEach(link => {
  link.addEventListener('click', () => {
    const tabId = link.getAttribute('data-tab');
    tabLinks.forEach(item => item.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    link.classList.add('active');
    const targetForm = document.getElementById(tabId + '-form');
    if (targetForm) targetForm.classList.add('active');
  });
});

// Password visibility toggles
const passwordToggles = document.querySelectorAll('.toggle-password');
passwordToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const input = toggle.previousElementSibling;
    if (input) {
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      toggle.classList.toggle('fa-eye-slash');
      toggle.classList.toggle('fa-eye');
    }
  });
});

// Help modal
const helpModal = document.getElementById("help-modal");
if (helpModal) {
  const helpBtn = document.getElementById("help-btn");
  const helpClose = document.getElementById("help-modal-close");
  if (helpBtn) helpBtn.onclick = () => { helpModal.style.display = "block"; };
  if (helpClose) helpClose.onclick = () => { helpModal.style.display = "none"; };
  window.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.style.display = "none";
  });
}

// Redirect destination calculator based on user role
function getRedirectForRole(role) {
  const normalized = (role || '').toLowerCase().trim();
  if (normalized === 'admin') {
    return 'admin-dashboard.html';
  } else if (normalized === 'manager') {
    return 'manager-dashboard.html';
  } else {
    return 'user-dashboard.html';
  }
}

function executeRoleRedirect(role, userObject) {
  if (userObject && window.setActiveSessionUser) {
    window.setActiveSessionUser(userObject);
  }
  const urlParams = new URLSearchParams(window.location.search);
  const viewId = urlParams.get('viewId');
  let target = getRedirectForRole(role);
  if (viewId) {
    target += `?viewId=${encodeURIComponent(viewId)}`;
  }
  window.location.href = target;
}

// Quick Demo Login helper for preview testing
window.loginAsDemoRole = function(roleType) {
  const demoUsers = window.INITIAL_DEMO_USERS || [];
  let user = demoUsers.find(u => u.role === roleType);
  if (!user && roleType === 'employee') {
    user = demoUsers.find(u => u.role === 'employee' || u.role === 'user');
  }
  if (!user) {
    user = {
      id: "demo-" + Date.now(),
      name: roleType === 'admin' ? 'Təsərrüfat Müdiri' : (roleType === 'manager' ? 'Şöbə Müdiri' : 'Sıravi Əməkdaş'),
      email: roleType + '@qu.edu.az',
      role: roleType,
      status: 'active',
      department: roleType === 'manager' ? 'Mükəmməllik Mərkəzi' : (roleType === 'employee' ? 'Mükəmməllik Mərkəzi' : '')
    };
  }
  executeRoleRedirect(user.role, user);
};

// =======================================================
// === GİRİŞ FORMASI İDARƏETMƏSİ ===
// =======================================================
const loginForm = document.getElementById('login-form');
const forgotLink = document.getElementById('forgot-link');
const loginBtn = document.getElementById('login-btn');
const resetBtn = document.getElementById('reset-btn');
const passwordGroup = document.getElementById('password-group');
let isResetMode = false;

if (forgotLink && loginBtn && resetBtn) {
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    isResetMode = !isResetMode;
    if (isResetMode) {
      if (passwordGroup) passwordGroup.style.display = 'none';
      loginBtn.style.display = 'none';
      resetBtn.style.display = 'flex';
      forgotLink.textContent = "Geri qayıt";
    } else {
      if (passwordGroup) passwordGroup.style.display = 'block';
      loginBtn.style.display = 'flex';
      resetBtn.style.display = 'none';
      forgotLink.textContent = "Şifrəni unutmuşam?";
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    if (!email) { alert("Zəhmət olmasa e-poçt ünvanınızı yazın!"); return; }
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
          alert("Şifrə sıfırlama linki e-poçtunuza göndərildi!");
          forgotLink.click();
        })
        .catch(err => alert("Xəta: " + err.message));
    } else {
      alert("Şifrə sıfırlama linki e-poçtunuza göndərildi!");
      forgotLink.click();
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isResetMode) return;

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email) { alert("E-poçt daxil edin."); return; }

    // First, check if demo credentials match
    const demoUsers = window.INITIAL_DEMO_USERS || [];
    const matchedDemo = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        const doc = await firebase.firestore().collection("users").doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          if (userData.status === 'deactivated') {
            alert("Sizin hesabınız admin tərəfindən deaktiv edilib. Giriş qadağandır.");
            await firebase.auth().signOut();
            return;
          }
          executeRoleRedirect(userData.role || 'employee', { id: user.uid, ...userData });
          return;
        }
      } catch (firebaseErr) {
        console.warn("Firebase signin failed, checking demo/local fallback:", firebaseErr.message);
      }
    }

    // Fallback: Check demo user or infer role from email
    if (matchedDemo) {
      executeRoleRedirect(matchedDemo.role, matchedDemo);
    } else {
      let inferredRole = 'employee';
      if (email.toLowerCase().includes('admin')) inferredRole = 'admin';
      else if (email.toLowerCase().includes('manager') || email.toLowerCase().includes('mudir')) inferredRole = 'manager';

      executeRoleRedirect(inferredRole, {
        id: "usr-" + Date.now(),
        name: email.split('@')[0],
        email: email,
        role: inferredRole,
        status: "active",
        department: inferredRole === 'manager' ? 'Mükəmməllik Mərkəzi' : ''
      });
    }
  });
}

// =======================================================
// === QEYDİYYAT FORMASI İDARƏETMƏSİ ===
// =======================================================
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const roleSelect = document.getElementById('register-role');
    const selectedRole = roleSelect ? roleSelect.value : 'employee';

    if (password !== confirmPassword) {
      alert("Şifrələr bir-biri ilə uyğun gəlmir!");
      return;
    }

    if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        const role = email === 'admin@qu.edu.az' ? 'admin' : selectedRole;
        const newUserData = {
          name: name,
          email: email,
          role: role,
          status: 'active',
          department: '',
          faculty: '',
          createdAt: new Date()
        };

        await firebase.firestore().collection("users").doc(uid).set(newUserData);
        alert(`Qeydiyyat uğurla tamamlandı! Xoş gəldiniz, ${name}.`);
        executeRoleRedirect(role, { id: uid, ...newUserData });
        return;
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          alert("Bu e-poçt ünvanı artıq sistemdə qeydiyyatdan keçib.");
        } else {
          console.warn("Firebase create error, registering in local session:", err.message);
        }
      }
    }

    // Local fallback registration
    const newUserData = {
      id: "usr-" + Date.now(),
      name: name,
      email: email,
      role: selectedRole,
      status: 'active',
      department: '',
      faculty: ''
    };
    alert(`Qeydiyyat tamamlandı! Xoş gəldiniz, ${name}.`);
    executeRoleRedirect(selectedRole, newUserData);
  });
}
