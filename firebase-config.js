// === SHARED FIREBASE & DATA ENGINE ===
const firebaseConfig = {
  apiKey: "AIzaSyCMmJNA8aj906l-x07XzMkgpLhBk2a0j_E",
  authDomain: "smartstorage-62517.firebaseapp.com",
  projectId: "smartstorage-62517",
  storageBucket: "smartstorage-62517.firebasestorage.app",
  messagingSenderId: "385539276000",
  appId: "1:385539276000:web:74fbf3e8df18137540a485",
  measurementId: "G-MCP6LZHN9K"
};

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (err) {
    console.warn("Firebase initialization note:", err);
  }
}

// Global reference objects
const appAuth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const appDb = typeof firebase !== 'undefined' ? firebase.firestore() : null;
const appStorage = typeof firebase !== 'undefined' ? firebase.storage() : null;

// Initial starter seed data in LocalStorage if Firestore is initializing
const INITIAL_DEMO_EQUIPMENT = [
  {
    id: "eq-1",
    systemId: "TC-849201",
    name: "Dell Latitude 5420",
    model: "Dell Latitude 5420 i7 16GB",
    type: "Kompüter",
    subType: "Noutbuk",
    serial: "SN-DELL-882194",
    mac: "00:1A:2B:3C:4D:5E",
    status: "İşlək",
    holderName: "Məmməd Məmmədli",
    holderFaculty: "İnzibati İdarəetmə",
    holderDepartment: "Mükəmməllik Mərkəzi",
    purchaseDate: "2024-02-15",
    notes: "Mükəmməllik Mərkəzi rəhbərinə təhkim olunub.",
    imageUrl: "",
    addedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 30 }
  },
  {
    id: "eq-2",
    systemId: "TC-391842",
    name: "HP LaserJet Pro MFP",
    model: "HP LaserJet Pro M428fdw",
    type: "Printer",
    subType: "Çoxfunksiyalı",
    serial: "SN-HP-993821",
    mac: "00:1A:2B:44:55:66",
    status: "İşlək",
    holderName: "Məmməd Məmmədli",
    holderFaculty: "İnzibati İdarəetmə",
    holderDepartment: "Mükəmməllik Mərkəzi",
    purchaseDate: "2024-01-10",
    notes: "Mərkəzin ümumi istifadəsindədir.",
    imageUrl: "",
    addedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 20 }
  },
  {
    id: "eq-3",
    systemId: "TC-552910",
    name: "Samsung 27 inch Curved Monitor",
    model: "Samsung Odyssey G5",
    type: "Monitor",
    subType: "27 düym",
    serial: "SN-SAM-112039",
    mac: "",
    status: "İşlək",
    holderName: "Aysel Qasımova",
    holderFaculty: "İnzibati İdarəetmə",
    holderDepartment: "Mükəmməllik Mərkəzi",
    purchaseDate: "2024-03-01",
    notes: "Qrafik işlər üçün.",
    imageUrl: "",
    addedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 15 }
  },
  {
    id: "eq-4",
    systemId: "TC-619283",
    name: "Lenovo ThinkPad E14",
    model: "Lenovo ThinkPad Gen 4",
    type: "Kompüter",
    subType: "Noutbuk",
    serial: "SN-LEN-449102",
    mac: "00:1B:3C:77:88:99",
    status: "Təmirdə",
    holderName: "Rəşad Əliyev",
    holderFaculty: "Mühəndislik",
    holderDepartment: "Kompüter Mühəndisliyi Şöbəsi",
    purchaseDate: "2023-11-20",
    notes: "Ekran təmiri üçün IT şöbəsinə göndərilib.",
    imageUrl: "",
    addedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 40 }
  },
  {
    id: "eq-5",
    systemId: "TC-104928",
    name: "Cisco Catalyst 24-Port Switch",
    model: "Cisco Catalyst 2960X",
    type: "Şəbəkə Avadanlığı",
    subType: "Switch",
    serial: "SN-CS-002918",
    mac: "00:0C:29:1A:3B:4C",
    status: "İşlək",
    holderName: "Anbar",
    holderFaculty: "Anbar",
    holderDepartment: "",
    purchaseDate: "2024-04-12",
    notes: "Ehtiyat şəbəkə avadanlığı.",
    imageUrl: "",
    addedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 10 }
  },
  {
    id: "eq-6",
    systemId: "TC-928172",
    name: "Ofis Masası və Şkaf Dəsti",
    model: "IKEA Bekant",
    type: "Masa",
    subType: "Müəllim Masası",
    serial: "",
    mac: "",
    status: "İşlək",
    holderName: "Aysel Qasımova",
    holderFaculty: "İnzibati İdarəetmə",
    holderDepartment: "Mükəmməllik Mərkəzi",
    purchaseDate: "2023-09-01",
    notes: "",
    imageUrl: "",
    addedAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 60 }
  }
];

const INITIAL_DEMO_USERS = [
  {
    id: "usr-admin-1",
    name: "Təsərrüfat Müdiri (Baş Admin)",
    email: "admin@qu.edu.az",
    role: "admin",
    status: "active",
    faculty: "İnzibati İdarəetmə",
    department: "Təsərrüfat və Maddi-Texniki Təminat Şöbəsi"
  },
  {
    id: "usr-mgr-1",
    name: "Məmməd Məmmədli",
    email: "mahammadli@qu.edu.az",
    role: "manager",
    status: "active",
    faculty: "İnzibati İdarəetmə",
    department: "Mükəmməllik Mərkəzi"
  },
  {
    id: "usr-mgr-2",
    name: "Kənan Həsənov",
    email: "k.hasanov@qu.edu.az",
    role: "manager",
    status: "active",
    faculty: "Mühəndislik",
    department: "Kompüter Mühəndisliyi Şöbəsi"
  },
  {
    id: "usr-emp-1",
    name: "Aysel Qasımova",
    email: "a.gasimova@qu.edu.az",
    role: "employee",
    status: "active",
    faculty: "İnzibati İdarəetmə",
    department: "Mükəmməllik Mərkəzi"
  },
  {
    id: "usr-emp-2",
    name: "Rəşad Əliyev",
    email: "r.aliyev@qu.edu.az",
    role: "employee",
    status: "active",
    faculty: "Mühəndislik",
    department: "Kompüter Mühəndisliyi Şöbəsi"
  }
];

// Helper to get active session user
function getActiveSessionUser() {
  const stored = localStorage.getItem('smartstorage_active_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}

function setActiveSessionUser(userObj) {
  localStorage.setItem('smartstorage_active_user', JSON.stringify(userObj));
}

// Dynamic Department Structure Mapping
const DEPARTMENTS_BY_FACULTY = {
  "İnzibati İdarəetmə": [
    "Mükəmməllik Mərkəzi",
    "Rəqəmsal Tələbələrlə İş Mərkəzi",
    "İnformasiya Texnologiyaları Şöbəsi",
    "Sənədlərlə İş Şöbəsi (Kargüzarlıq)",
    "Təsərrüfat və Maddi-Texniki Təminat Şöbəsi"
  ],
  "Mühəndislik": [
    "Kompüter Mühəndisliyi Şöbəsi",
    "Elektrik-Elektronika Mühəndisliyi Şöbəsi",
    "İnşaat Mühəndisliyi Şöbəsi",
    "Energetika Mühəndisliyi Şöbəsi"
  ],
  "Pedaqoji": [
    "İbtidai Təhsil Kafedrası",
    "Xarici Dillər Kafedrası",
    "Riyaziyyat Kafedrası",
    "Pedaqogika Kafedrası"
  ],
  "Humanitar və Sosial Elmlər": [
    "Tarix Kafedrası",
    "Filologiya Kafedrası",
    "Psixologiya Kafedrası",
    "Beynəlxalq Münasibətlər Kafedrası"
  ],
  "İqtisadiyyat": [
    "Maliyyə Kafedrası",
    "Mühasibat Uçotu Kafedrası",
    "Marketinq Kafedrası",
    "Menecment Kafedrası"
  ],
  "İncəsənət": [
    "Dizayn Kafedrası",
    "Musiqi Kafedrası",
    "Rəssamlıq Kafedrası"
  ],
  "Rəqəmsal": [
    "Rəqəmsal Transformasiya Mərkəzi",
    "Data Analitika Şöbəsi",
    "IT Dəstək Qrupu"
  ],
  "Tibb": [
    "Terapiya Kafedrası",
    "Cərrahiyyə Kafedrası",
    "Tibbi Laborator Diaqnostika Kafedrası"
  ]
};

window.firebaseConfig = firebaseConfig;
window.INITIAL_DEMO_EQUIPMENT = INITIAL_DEMO_EQUIPMENT;
window.INITIAL_DEMO_USERS = INITIAL_DEMO_USERS;
window.getActiveSessionUser = getActiveSessionUser;
window.setActiveSessionUser = setActiveSessionUser;
window.DEPARTMENTS_BY_FACULTY = DEPARTMENTS_BY_FACULTY;
