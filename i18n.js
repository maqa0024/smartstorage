// === SMARTSTORAGE I18N DICTIONARY (AZ, EN, RU) ===
const translations = {
  az: {
    appName: "SmartStorage",
    appSubtitle: "İnventar İdarəetmə Sistemi",
    adminPanelTitle: "Təsərrüfat Müdiri (Admin) Paneli",
    managerPanelTitle: "Şöbə Müdiri Paneli",
    userPanelTitle: "Əməkdaş (Sıravi İşçi) Paneli",
    adminWelcome: "Təsərrüfat Müdiri",
    managerWelcome: "Şöbə Müdiri",
    userWelcome: "Əməkdaş",
    loading: "Yüklənir...",
    langAzerbaijani: "Azərbaycanca (AZ)",
    langEnglish: "English (EN)",
    langRussian: "Русский (RU)",
    logout: "Çıxış",
    
    // Roles
    roleAdmin: "Təsərrüfat Müdiri (Admin)",
    roleManager: "Şöbə Müdiri",
    roleEmployee: "Sıravi İşçi",
    roleUser: "Sıravi İşçi",
    btnMakeAdmin: "Admin Et",
    btnMakeManager: "Şöbə Müdiri Et",
    btnMakeEmployee: "İşçi Et",
    
    // Admin Tabs & Stats
    statTotalEquipment: "Ümumi Avadanlıq",
    statWorking: "İşlək Avadanlıq",
    statHolders: "İstifadəçilər (Sahiblər)",
    statWarehouse: "Anbarda Olanlar",
    statBroken: "Xarab / Təmirdə",
    statDepartmentStaff: "Şöbənin Əməkdaşları",
    statDeptEquipment: "Şöbənin Avadanlığı",
    statMyEquipment: "Mənim Avadanlığım",
    
    // Tabs
    adminTabAllInventory: "İnventar Siyahısı",
    tabHolders: "İstifadəçilər (Sahiblər)",
    adminTabUsers: "Sistem Personalı və Rollar",
    tabAddEquipment: "Avadanlıq Əlavə Et",
    tabDeptInventory: "Şöbənin İnventarı",
    tabDeptStaff: "Şöbə Əməkdaşları",
    tabReassign: "Avadanlıq Təhkim Et / Köçür",
    tabMyInventory: "Mənim İnventarım",
    tabReportIssue: "Nasazlıq Bildir",
    
    // Search & Filters
    searchPlaceholder: "Ad, sistem ID, model, nömrə və ya növ...",
    searchHoldersPlaceholder: "İstifadəçi adı və ya fakültə axtar...",
    searchUsersPlaceholder: "Ad, e-poçt və ya rola görə axtar...",
    searchDeptPlaceholder: "Şöbə daxili avadanlıq və ya işçi axtar...",
    filterAllTypes: "Bütün Növlər",
    filterAllStatuses: "Bütün Statuslar",
    filterAllDepts: "Bütün Şöbələr",
    
    // Forms & Fields
    lblHolderTitle: "Avadanlıq Sahibinin Məlumatları",
    lblHolderName: "Ad Soyad *",
    lblHolderFaculty: "Fakültə / Departament *",
    lblHolderDepartment: "Şöbə / Mərkəz *",
    deptSelectPlaceholder: "Əvvəlcə Fakültə seçin",
    lblSystemID: "Sistem ID (Avtomatik & Dəyişməz)",
    lblEquipSubtype: "Növ / Alt Növ *",
    subtypeSelectPlaceholder: "Əvvəlcə avadanlıq növünü seçin",
    formType: "Avadanlıq növü *",
    formTypeSelect: "Növü seçin",
    formTypeComputer: "Kompüter",
    formTypeMonitor: "Monitor",
    formTypePrinter: "Printer",
    formTypeNetwork: "Şəbəkə Avadanlığı",
    formTypeŞkaf: "Şkaf",
    formTypeMasa: "Masa",
    formTypeBoard: "Lövhə",
    formTypeChair: "Stul",
    formTypeCabinet: "Dolab",
    formTypeOther: "Digər",
    formName: "Avadanlığın adı *",
    formNamePlaceholder: "məs: Dell Latitude Laptop",
    formModel: "Marka/Model *",
    formModelPlaceholder: "məs: Dell Latitude 5420",
    formSerial: "Serial Nömrə",
    formSerialPlaceholder: "məs: SN123456789",
    formMac: "MAC Address",
    formMacPlaceholder: "məs: 00:1A:2B:3C:4D:5E",
    formStatus: "Status *",
    formStatusWorking: "İşlək",
    formStatusBroken: "Xarab",
    formStatusRepair: "Təmirdə",
    formDate: "Alınma Tarixi",
    formUpload: "Şəkil Yüklə",
    formNotes: "Qeyd/Şərh",
    formNotesPlaceholder: "Əlavə məlumat, xüsusi qeydlər...",
    submitAssignEquipment: "Yadda Saxla",
    
    // Faculties
    facEngineering: "Mühəndislik və Yüksək Texnologiyalar",
    facPedagogy: "Pedaqoji",
    facHumanities: "Humanitar və Sosial Elmlər",
    facEconomics: "İqtisadiyyat",
    facArts: "İncəsənət",
    facDigital: "Rəqəmsal",
    facMedicine: "Tibb",
    facAdmin: "İnzibati İdarəetmə",
    
    // Excel Import/Export
    btnImportExcel: "Excel-dən İdxal Et",
    btnExportExcel: "Excel-ə İxrac Et",
    importPreviewTitle: "Excel İdxalına Baxış",
    importTotalRows: "Ümumi Sətir",
    importValidRows: "Düzgün",
    importInvalidRows: "Xətalı",
    importConfirmBtn: "Sistemə Yüklə",
    importSuccess: "sətir uğurla sistemə yükləndi!",
    importPartialFail: "sətir xəta səbəbindən yüklənmədi.",
    exportNoData: "İxrac etmək üçün məlumat yoxdur.",
    
    // Modals & Actions
    equipmentDetails: "Avadanlıq Məlumatları",
    editEquipmentTitle: "Avadanlığı Düzəlt",
    deleteEquipment: "Avadanlığı Sil",
    returnToWarehouse: "Anbara Qaytar",
    viewImage: "Şəkilə Bax",
    viewInventory: "İnventara Bax",
    totalItems: "Say",
    okBtn: "Oldu",
    close: "Bağla",
    cancel: "Ləğv et",
    save: "Yadda saxla",
    addUser: "Yeni Personal Yarat",
    addUserTitle: "Yeni Personal Yarat",
    addUserP: "Sistemə giriş edə biləcək əməkdaş (Admin, Şöbə Müdiri və ya Sıravi İşçi)",
    initialPassword: "İlkin Şifrə *",
    profileSettings: "Profil Parametrləri",
    fullNameLabel: "Tam ad",
    emailLabel: "E-poçt ünvanı",
    changePassword: "Şifrəni Dəyiş",
    updateProfile: "Profili Yenilə",
    assignedDepartment: "Təhkim Olunmuş Şöbə / Mərkəz",
    
    // Status & Warnings
    statusActive: "AKTİV",
    statusDeactivated: "DEAKTİV",
    btnDeactivate: "Girişi Kilidlə",
    btnActivate: "Kilidi Aç",
    confirmDeleteEquipment: "Bu avadanlığı silmək istədiyinizə əminsiniz?",
    confirmReturn: "Bu avadanlığı Anbara qaytarmaq istəyirsiniz?",
    confirmChangeRole: "Bu istifadəçinin rolunu dəyişmək istəyirsiniz?",
    emptyStateInventory: "Heç bir avadanlıq tapılmadı.",
    emptyStateHolders: "Heç bir istifadəçi tapılmadı."
  },
  en: {
    appName: "SmartStorage",
    appSubtitle: "Inventory Management System",
    adminPanelTitle: "Head of Operations (Admin) Panel",
    managerPanelTitle: "Department Manager Panel",
    userPanelTitle: "Employee Dashboard",
    adminWelcome: "Head of Operations",
    managerWelcome: "Department Manager",
    userWelcome: "Employee",
    loading: "Loading...",
    langAzerbaijani: "Azərbaycanca (AZ)",
    langEnglish: "English (EN)",
    langRussian: "Русский (RU)",
    logout: "Logout",
    
    roleAdmin: "Operations Admin",
    roleManager: "Department Manager",
    roleEmployee: "Employee",
    roleUser: "Employee",
    btnMakeAdmin: "Make Admin",
    btnMakeManager: "Make Manager",
    btnMakeEmployee: "Make Employee",
    
    statTotalEquipment: "Total Equipment",
    statWorking: "Working Equipment",
    statHolders: "Holders / Staff",
    statWarehouse: "In Warehouse",
    statBroken: "Broken / Repair",
    statDepartmentStaff: "Dept Employees",
    statDeptEquipment: "Dept Equipment",
    statMyEquipment: "My Equipment",
    
    adminTabAllInventory: "Inventory List",
    tabHolders: "Users (Holders)",
    adminTabUsers: "System Staff & Roles",
    tabAddEquipment: "Add Equipment",
    tabDeptInventory: "Department Inventory",
    tabDeptStaff: "Department Staff",
    tabReassign: "Assign / Reassign",
    tabMyInventory: "My Inventory",
    tabReportIssue: "Report Issue",
    
    searchPlaceholder: "Search name, ID, model, serial or type...",
    searchHoldersPlaceholder: "Search holder or faculty...",
    searchUsersPlaceholder: "Search staff, email or role...",
    searchDeptPlaceholder: "Search department items or staff...",
    filterAllTypes: "All Types",
    filterAllStatuses: "All Statuses",
    filterAllDepts: "All Departments",
    
    lblHolderTitle: "Equipment Holder Details",
    lblHolderName: "Full Name *",
    lblHolderFaculty: "Faculty / Dept *",
    lblHolderDepartment: "Department / Center *",
    deptSelectPlaceholder: "Select faculty first",
    lblSystemID: "System ID (Auto)",
    lblEquipSubtype: "Type / Subtype *",
    subtypeSelectPlaceholder: "Select type first",
    formType: "Equipment Type *",
    formTypeSelect: "Select Type",
    formTypeComputer: "Computer",
    formTypeMonitor: "Monitor",
    formTypePrinter: "Printer",
    formTypeNetwork: "Network Equipment",
    formTypeŞkaf: "Wardrobe",
    formTypeMasa: "Desk",
    formTypeBoard: "Board",
    formTypeChair: "Chair",
    formTypeCabinet: "Cabinet",
    formTypeOther: "Other",
    formName: "Equipment Name *",
    formNamePlaceholder: "e.g. Dell Latitude Laptop",
    formModel: "Brand/Model *",
    formModelPlaceholder: "e.g. Dell Latitude 5420",
    formSerial: "Serial Number",
    formSerialPlaceholder: "e.g. SN123456789",
    formMac: "MAC Address",
    formMacPlaceholder: "e.g. 00:1A:2B:3C:4D:5E",
    formStatus: "Status *",
    formStatusWorking: "Working",
    formStatusBroken: "Broken",
    formStatusRepair: "In Repair",
    formDate: "Purchase Date",
    formUpload: "Upload Photo",
    formNotes: "Notes / Comments",
    formNotesPlaceholder: "Additional info...",
    submitAssignEquipment: "Save Equipment",
    
    facEngineering: "Engineering & High Technologies",
    facPedagogy: "Pedagogy",
    facHumanities: "Humanities & Social Sciences",
    facEconomics: "Economics",
    facArts: "Arts",
    facDigital: "Digital",
    facMedicine: "Medicine",
    facAdmin: "Administration",
    
    btnImportExcel: "Import from Excel",
    btnExportExcel: "Export to Excel",
    importPreviewTitle: "Excel Import Preview",
    importTotalRows: "Total Rows",
    importValidRows: "Valid",
    importInvalidRows: "Errors",
    importConfirmBtn: "Upload to System",
    importSuccess: "rows uploaded successfully!",
    importPartialFail: "rows failed to upload.",
    exportNoData: "No data to export.",
    
    equipmentDetails: "Equipment Details",
    editEquipmentTitle: "Edit Equipment",
    deleteEquipment: "Delete Equipment",
    returnToWarehouse: "Return to Warehouse",
    viewImage: "View Photo",
    viewInventory: "View Inventory",
    totalItems: "Count",
    okBtn: "OK",
    close: "Close",
    cancel: "Cancel",
    save: "Save",
    addUser: "Create Staff",
    addUserTitle: "Create New Staff Account",
    addUserP: "Create access for Admin, Department Manager, or Staff",
    initialPassword: "Initial Password *",
    profileSettings: "Profile Settings",
    fullNameLabel: "Full Name",
    emailLabel: "Email Address",
    changePassword: "Change Password",
    updateProfile: "Update Profile",
    assignedDepartment: "Assigned Department / Center",
    
    statusActive: "ACTIVE",
    statusDeactivated: "LOCKED",
    btnDeactivate: "Lock Access",
    btnActivate: "Unlock",
    confirmDeleteEquipment: "Are you sure you want to delete this equipment?",
    confirmReturn: "Return this equipment to warehouse?",
    confirmChangeRole: "Are you sure you want to change this role?",
    emptyStateInventory: "No equipment found.",
    emptyStateHolders: "No holders found."
  },
  ru: {
    appName: "SmartStorage",
    appSubtitle: "Система Управления Инвентарем",
    adminPanelTitle: "Панель Завхоза (Администратора)",
    managerPanelTitle: "Панель Начальника Отдела",
    userPanelTitle: "Панель Сотрудника",
    adminWelcome: "Завхоз (Администратор)",
    managerWelcome: "Начальник Отдела",
    userWelcome: "Сотрудник",
    loading: "Загрузка...",
    langAzerbaijani: "Azərbaycanca (AZ)",
    langEnglish: "English (EN)",
    langRussian: "Русский (RU)",
    logout: "Выход",
    
    roleAdmin: "Завхоз (Админ)",
    roleManager: "Начальник Отдела",
    roleEmployee: "Сотрудник",
    roleUser: "Сотрудник",
    btnMakeAdmin: "Сделать Админом",
    btnMakeManager: "Сделать Нач. Отдела",
    btnMakeEmployee: "Сделать Работником",
    
    statTotalEquipment: "Всего Оборудования",
    statWorking: "В Рабочем Состоянии",
    statHolders: "Держатели (Сотрудники)",
    statWarehouse: "На Складе",
    statBroken: "Сломано / В Ремонте",
    statDepartmentStaff: "Сотрудники Отдела",
    statDeptEquipment: "Инвентарь Отдела",
    statMyEquipment: "Мой Инвентарь",
    
    adminTabAllInventory: "Список Инвентаря",
    tabHolders: "Пользователи (Держатели)",
    adminTabUsers: "Персонал и Роли",
    tabAddEquipment: "Добавить Оборудование",
    tabDeptInventory: "Инвентарь Отдела",
    tabDeptStaff: "Сотрудники Отдела",
    tabReassign: "Закрепить / Передать",
    tabMyInventory: "Мой Инвентарь",
    tabReportIssue: "Сообщить о Поломке",
    
    searchPlaceholder: "Поиск по имени, ID, модели...",
    searchHoldersPlaceholder: "Поиск держателя или факультета...",
    searchUsersPlaceholder: "Поиск по имени, email или роли...",
    searchDeptPlaceholder: "Поиск по инвентарю отдела...",
    filterAllTypes: "Все типы",
    filterAllStatuses: "Все статусы",
    filterAllDepts: "Все отделы",
    
    lblHolderTitle: "Данные Владельца",
    lblHolderName: "ФИО Держателя *",
    lblHolderFaculty: "Факультет / Департамент *",
    lblHolderDepartment: "Отдел / Центр *",
    deptSelectPlaceholder: "Сначала выберите факультет",
    lblSystemID: "Системный ID (Авто)",
    lblEquipSubtype: "Тип / Подтип *",
    subtypeSelectPlaceholder: "Сначала выберите тип",
    formType: "Тип оборудования *",
    formTypeSelect: "Выберите тип",
    formTypeComputer: "Компьютер",
    formTypeMonitor: "Монитор",
    formTypePrinter: "Принтер",
    formTypeNetwork: "Сетевое оборудование",
    formTypeŞkaf: "Шкаф",
    formTypeMasa: "Стол",
    formTypeBoard: "Доска",
    formTypeChair: "Стул",
    formTypeCabinet: "Тумба",
    formTypeOther: "Другое",
    formName: "Название оборудования *",
    formNamePlaceholder: "напр: Ноутбук Dell Latitude",
    formModel: "Марка / Модель *",
    formModelPlaceholder: "напр: Dell Latitude 5420",
    formSerial: "Серийный Номер",
    formSerialPlaceholder: "напр: SN123456789",
    formMac: "MAC Адрес",
    formMacPlaceholder: "напр: 00:1A:2B:3C:4D:5E",
    formStatus: "Статус *",
    formStatusWorking: "Рабочий",
    formStatusBroken: "Сломан",
    formStatusRepair: "В Ремонте",
    formDate: "Дата Покупки",
    formUpload: "Загрузить Фото",
    formNotes: "Примечания",
    formNotesPlaceholder: "Дополнительные сведения...",
    submitAssignEquipment: "Сохранить",
    
    facEngineering: "Инженерия и высокие технологии",
    facPedagogy: "Педагогика",
    facHumanities: "Гуманитарные и социальные науки",
    facEconomics: "Экономика",
    facArts: "Искусство",
    facDigital: "Цифровые технологии",
    facMedicine: "Медицина",
    facAdmin: "Администрация",
    
    btnImportExcel: "Импорт из Excel",
    btnExportExcel: "Экспорт в Excel",
    importPreviewTitle: "Просмотр импорта",
    importTotalRows: "Всего строк",
    importValidRows: "Корректно",
    importInvalidRows: "С ошибками",
    importConfirmBtn: "Загрузить в систему",
    importSuccess: "строк(и) успешно загружено!",
    importPartialFail: "строк(и) не удалось загрузить.",
    exportNoData: "Нет данных для экспорта.",
    
    equipmentDetails: "Детали Оборудования",
    editEquipmentTitle: "Редактировать Оборудование",
    deleteEquipment: "Удалить Оборудование",
    returnToWarehouse: "Вернуть на Склад",
    viewImage: "Посмотреть Фото",
    viewInventory: "Смотреть Инвентарь",
    totalItems: "Кол-во",
    okBtn: "ОК",
    close: "Закрыть",
    cancel: "Отмена",
    save: "Сохранить",
    addUser: "Создать Персонал",
    addUserTitle: "Создать Аккаунт Персонала",
    addUserP: "Доступ для Завхоза, Начальника Отдела или Работника",
    initialPassword: "Начальный Пароль *",
    profileSettings: "Настройки Профиля",
    fullNameLabel: "Полное Имя",
    emailLabel: "Email Адрес",
    changePassword: "Сменить Пароль",
    updateProfile: "Обновить Профиль",
    assignedDepartment: "Закрепленный Отдел / Центр",
    
    statusActive: "АКТИВЕН",
    statusDeactivated: "ЗАБЛОКИРОВАН",
    btnDeactivate: "Блокировать",
    btnActivate: "Разблокировать",
    confirmDeleteEquipment: "Удалить это оборудование?",
    confirmReturn: "Вернуть это оборудование на склад?",
    confirmChangeRole: "Сменить роль пользователя?",
    emptyStateInventory: "Оборудование не найдено.",
    emptyStateHolders: "Держатели не найдены."
  }
};

let currentLang = localStorage.getItem('appLang') || 'az';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('appLang', lang);

  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    const value = translations?.[lang]?.[key];
    if (!value) return;

    if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.hasAttribute('placeholder')) {
      el.placeholder = value;
      return;
    }

    if (el.tagName === 'OPTION') {
      el.textContent = value;
      return;
    }

    if (el.children.length > 0 && el.querySelector('i')) {
      const icon = el.querySelector('i').outerHTML;
      el.innerHTML = icon + ' ' + value;
    } else {
      el.textContent = value;
    }
  });

  const langBtnText = document.querySelector('.lang-btn-text');
  if (langBtnText) langBtnText.textContent = lang.toUpperCase();

  const dropdown = document.getElementById('lang-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

function t(key) {
  return translations?.[currentLang]?.[key] || key;
}

window.setLanguage = setLanguage;
window.t = t;

document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.getElementById('lang-btn');
  const dropdown = document.getElementById('lang-dropdown');

  if (langBtn && dropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });
    window.addEventListener('click', () => {
      if (dropdown.classList.contains('show')) dropdown.classList.remove('show');
    });
  }

  document.querySelectorAll('.lang-dropdown a').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const selected = e.target.getAttribute('data-lang');
      if (selected) setLanguage(selected);
    });
  });

  setLanguage(currentLang);
});
