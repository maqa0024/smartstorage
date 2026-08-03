// === FIREBASE CONFIG ===
const firebaseConfig = {
  apiKey: "AIzaSyCMmJNA8aj906l-x07XzMkgpLhBk2a0j_E",
  authDomain: "smartstorage-62517.firebaseapp.com",
  projectId: "smartstorage-62517",
  storageBucket: "smartstorage-62517.firebasestorage.app",
  messagingSenderId: "385539276000",
  appId: "1:385539276000:web:74fbf3e8df18137540a485",
  measurementId: "G-MCP6LZHN9K"
};

try { firebase.initializeApp(firebaseConfig); } catch (e) { console.error(e); }
const auth = firebase.auth();
const db = firebase.firestore();

// === KÖMƏKÇİ FUNKSİYALAR ===
function isKarabakhEmail(email) {
    return true;
}

// === TABLAR ===
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
tabLinks.forEach(link => {
    link.addEventListener('click', () => {
        const tabId = link.getAttribute('data-tab');
        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(tabId + '-form').classList.add('active');
    });
});

// === ŞİFRƏ GÖSTƏR/GİZLƏ ===
const passwordToggles = document.querySelectorAll('.toggle-password');
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        toggle.classList.toggle('fa-eye-slash');
        toggle.classList.toggle('fa-eye');
    });
});

// === MODAL ===
const helpModal = document.getElementById("help-modal");
if(helpModal) {
    document.getElementById("help-btn").onclick = () => { helpModal.style.display = "block"; }
    document.getElementById("help-modal-close").onclick = () => { helpModal.style.display = "none"; }
    window.addEventListener('click', (event) => { if (event.target == helpModal) helpModal.style.display = "none"; });
}

// =======================================================
// === QEYDİYYAT ===
// =======================================================
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value.toLowerCase().trim();
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        if (password !== passwordConfirm) {
            alert("Şifrələr uyğun deyil");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                let userRole = (email === 'admin@qu.edu.az') ? "admin" : "user";

                db.collection("users").doc(user.uid).set({
                    name: name,
                    email: user.email,
                    role: userRole,
                    status: 'active'
                })
                .then(() => {
                    user.sendEmailVerification().then(() => {
                        alert(`Uğurlu! Hesabınız yaradıldı. ${email} ünvanına gedən TƏSDİQ linkinə daxil olun.`);
                        auth.signOut();
                        registerForm.reset();
                        document.querySelector('.tab-link[data-tab="login"]').click();
                    });
                });
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') alert("Bu mail artıq qeydiyyatdan keçib.");
                else alert("Xəta: " + error.message);
            });
    });
}

// =======================================================
// === GİRİŞ SİSTEMİ ===
// =======================================================

const loginForm = document.getElementById('login-form');
const forgotLink = document.getElementById('forgot-link');
const loginBtn = document.getElementById('login-btn');
const resetBtn = document.getElementById('reset-btn');
const passwordGroup = document.getElementById('password-group');

let isResetMode = false;

if(forgotLink && loginBtn && resetBtn) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        isResetMode = !isResetMode;

        if (isResetMode) {
            if(passwordGroup) passwordGroup.style.display = 'none';
            loginBtn.style.display = 'none';
            resetBtn.style.display = 'block';
            forgotLink.textContent = "Geri qayıt";
        } else {
            if(passwordGroup) passwordGroup.style.display = 'block';
            loginBtn.style.display = 'block';
            resetBtn.style.display = 'none';
            forgotLink.textContent = "Şifrəni unutmuşam";
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;

        if (!email) { alert("Mail yazın!"); return; }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("Sıfırlama linki göndərildi!");
                forgotLink.click();
            })
            .catch((error) => {
                if(error.code === 'auth/user-not-found') alert("Bu istifadəçi tapılmadı.");
                else alert("Xəta: " + error.message);
            });
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(isResetMode) return;

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                if (!user.emailVerified) {
                    alert("Zəhmət olmasa mailinizi təsdiqləyin!");
                    auth.signOut();
                    return;
                }

                const userDocRef = db.collection("users").doc(user.uid);
                userDocRef.get().then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();

                        if (userData.status === 'deactivated') {
                            alert("Sizin hesabınız Admin tərəfindən deaktiv edilib. Giriş qadağandır.");
                            auth.signOut();
                            return;
                        }

                        const urlParams = new URLSearchParams(window.location.search);
                        const viewId = urlParams.get('viewId');
                        let redirectUrl = "";

                        if (userData.role === 'admin') {
                            redirectUrl = "admin.html";
                        } else {
                            redirectUrl = "dashboard.html";
                        }

                        if (viewId) {
                            redirectUrl += `?viewId=${viewId}`;
                        }

                        window.location.href = redirectUrl;
                    } else {
                        alert("İstifadəçi məlumatları tapılmadı.");
                        auth.signOut();
                    }
                });
            })
            .catch((error) => {
                console.error(error);
                alert("Giriş xətası: Şifrə və ya mail səhvdir.");
            });
    });
}
