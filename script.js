let profileData = {
    photo: "raman-profile.jpg",
    name: "Raman Kumar Baroliya",
    tagline: "Crafting high-end 3D hard-surface models in Blender, developing responsive web applications, and building smart digital tools.",
    upi: "Lalr13031-1@oksbi",
    phone: "+91 7742987003",
    email: "Lalr13031@gmail.com",
    education: "B.Tech IT at <strong>Government Engineering College Ajmer</strong> (BTU). 86% in 12th Senior Secondary.",
    skills: "Blender 3D Modeling, Hard-Surface Design, C++, Python, JavaScript, HTML/CSS, and Microcontroller projects.",
    certifications: "Google Kubernetes, Canva Digital Design, SEO, Google Ads, and Embedded IoT Certification.",
    password: "admin123"
};

let products = [];
let orders = [];
let feedbacks = [];
let currentCheckoutProductId = null;
let currentFilterCategory = 'all';
let loggedInUser = null;

// Firebase Sync Initialization (Real-time with onValue)
function initFirebaseSync() {
    if (!window.db || !window.ref || !window.onValue) {
        setTimeout(initFirebaseSync, 500);
        return;
    }

    // Check saved login state from localStorage
    const savedUser = localStorage.getItem('raman_logged_in_user');
    if (savedUser) {
        loggedInUser = JSON.parse(savedUser);
        updateLoginUI();
    }

    // 1. Real-time Profile Sync
    window.onValue(window.ref(window.db, "profile"), (snapshot) => {
        if (snapshot.exists()) {
            profileData = snapshot.val();
            updateProfileUI();
        } else {
            saveDataToFirebase('profile', profileData);
        }
    });

    // 2. Real-time Products Sync
    window.onValue(window.ref(window.db, "products"), (snapshot) => {
        if (snapshot.exists()) {
            const val = snapshot.val();
            products = Array.isArray(val) ? val : Object.values(val);
        } else {
            products = [];
        }
        renderProducts(currentFilterCategory);
        renderAdminItemsList();
    });

    // 3. Real-time Orders Sync & Notification Badge Update
    window.onValue(window.ref(window.db, "orders"), (snapshot) => {
        if (snapshot.exists()) {
            const val = snapshot.val();
            orders = Array.isArray(val) ? val : Object.values(val);
        } else {
            orders = [];
        }
        updateOrderNotificationBadge();
        renderAdminOrdersList();
    });

    // 4. Real-time Feedbacks Sync
    window.onValue(window.ref(window.db, "feedbacks"), (snapshot) => {
        if (snapshot.exists()) {
            const val = snapshot.val();
            feedbacks = Array.isArray(val) ? val : Object.values(val);
        } else {
            feedbacks = [];
        }
    });
}

function loadSavedData() {
    updateProfileUI();
    renderProducts('all');
    initFirebaseSync();
}

// Helper to save to Firebase & LocalStorage
function saveDataToFirebase(path, data) {
    if (window.db && window.ref && window.set) {
        window.set(window.ref(window.db, path), data).catch(err => console.error("Firebase Save Error:", err));
    }
    localStorage.setItem(`raman_portfolio_${path}`, JSON.stringify(data));
}

// Update Login UI State in Navbar
function updateLoginUI() {
    const loginBtnText = document.getElementById('login-btn-text');
    if (loginBtnText && loggedInUser) {
        loginBtnText.innerText = loggedInUser.name || loggedInUser.email;
    }
}

// Open / Close Login Modal
function openLoginModal() {
    if (loggedInUser) {
        if (confirm(`आप पहले से ${loggedInUser.email} के रूप में लॉगिन हैं। क्या आप लॉगआउट करना चाहते हैं?`)) {
            localStorage.removeItem('raman_logged_in_user');
            loggedInUser = null;
            const btnText = document.getElementById('login-btn-text');
            if (btnText) btnText.innerText = "Login";
            alert("आप सफलतापूर्वक लॉगआउट हो गए हैं।");
            renderProducts(currentFilterCategory);
        }
        return;
    }
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

// Submit User Login
function submitUserLogin() {
    const emailInput = document.getElementById('user-email-input').value.trim();
    const nameInput = document.getElementById('user-name-input').value.trim();

    if (!emailInput || !emailInput.includes('@')) {
        alert("कृपया वैध ईमेल आईडी (Gmail) दर्ज करें।");
        return;
    }

    loggedInUser = {
        email: emailInput,
        name: nameInput || emailInput.split('@')[0]
    };

    localStorage.setItem('raman_logged_in_user', JSON.stringify(loggedInUser));
    updateLoginUI();
    closeLoginModal();
    alert(`स्वागत है, ${loggedInUser.name}! आप सफलतापूर्वक लॉगिन हो गए हैं।`);
    renderProducts(currentFilterCategory);
}

// Check Login Guard before actions
function checkLoginBeforeAction() {
    if (!loggedInUser) {
        alert("कृपया यह क्रिया करने से पहले ऊपर 'Login' बटन पर क्लिक करके अपनी ईमेल आईडी से लॉगिन करें।");
        openLoginModal();
        return false;
    }
    return true;
}

// Update Live Notification Badge (1, 2, 3...) for New/Pending Orders
function updateOrderNotificationBadge() {
    const unseenCount = orders.filter(o => o.isNewOrder === true || o.status === 'Pending').length;
    const navBadge = document.getElementById('admin-order-badge');
    const tabBadge = document.getElementById('tab-order-badge');

    if (navBadge) {
        if (unseenCount > 0) {
            navBadge.innerText = unseenCount;
            navBadge.classList.remove('hidden');
        } else {
            navBadge.classList.add('hidden');
        }
    }

    if (tabBadge) {
        if (unseenCount > 0) {
            tabBadge.innerText = unseenCount;
            tabBadge.classList.remove('hidden');
        } else {
            tabBadge.classList.add('hidden');
        }
    }
}

function updateProfileUI() {
    if (profileData.photo) {
        const navImg = document.getElementById('nav-profile-img');
        const heroImg = document.getElementById('hero-profile-img');
        if (navImg) navImg.src = profileData.photo;
        if (heroImg) heroImg.src = profileData.photo;
    }
    if (document.getElementById('hero-name')) document.getElementById('hero-name').innerText = profileData.name;
    if (document.getElementById('hero-tagline')) document.getElementById('hero-tagline').innerText = profileData.tagline;
    if (document.getElementById('display-email')) {
        document.getElementById('display-email').innerText = profileData.email;
        document.getElementById('display-email').href = `mailto:${profileData.email}`;
    }
    if (document.getElementById('display-phone')) {
        document.getElementById('display-phone').innerText = profileData.phone;
        const cleanPhone = profileData.phone.replace(/[^0-9]/g, '');
        document.getElementById('display-phone').href = `https://wa.me/${cleanPhone}`;
    }
    if (document.getElementById('display-upi-id')) document.getElementById('display-upi-id').innerText = profileData.upi;
    
    if (document.getElementById('display-education')) document.getElementById('display-education').innerHTML = profileData.education;
    if (document.getElementById('display-skills')) document.getElementById('display-skills').innerHTML = profileData.skills;
    if (document.getElementById('display-certifications')) document.getElementById('display-certifications').innerHTML = profileData.certifications;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Render Products Grid (Light Theme with Gradient Buy Now Buttons)
function renderProducts(filter = 'all') {
    currentFilterCategory = filter;
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <i class="fa-solid fa-box-open text-3xl mb-2 text-slate-400"></i>
            <p>No items found in this category. Use the Admin Panel to upload!</p>
        </div>`;
        return;
    }

    filtered.forEach(p => {
        const likes = p.likes || 0;
        const comments = Array.isArray(p.comments) ? p.comments : [];
        const likedUsers = Array.isArray(p.likedUsers) ? p.likedUsers : [];
        const categoryLabel = p.category === 'app' ? 'Android App' : p.category;
        
        const hasLiked = loggedInUser && likedUsers.includes(loggedInUser.email);

        const commentsHtml = comments.length > 0
            ? comments.map(c => `<div class="text-xs text-slate-700 py-1 border-b border-slate-100 last:border-0"><strong class="text-slate-900">${escapeHtml(c.user)}:</strong> ${escapeHtml(c.text)}</div>`).join('')
            : `<p class="text-[11px] text-slate-400">No comments yet. Be the first one!</p>`;

        const card = document.createElement('div');
        card.className = "product-card bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-pink-400 transition flex flex-col justify-between shadow-sm";
        card.innerHTML = `
            <div>
                <div class="h-48 overflow-hidden bg-slate-100 relative">
                    <img src="${p.image}" alt="${escapeHtml(p.title)}" class="product-card-img w-full h-full object-cover">
                    <span class="absolute top-3 right-3 gradient-btn text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow">${categoryLabel}</span>
                </div>
                <div class="p-5 pb-3">
                    <h3 class="font-bold text-lg text-slate-900 mb-1">${escapeHtml(p.title)}</h3>
                    <p class="text-slate-600 text-sm line-clamp-2 mb-3">${escapeHtml(p.desc)}</p>
                </div>
            </div>

            <div class="px-5 pb-5 space-y-4 mt-auto">
                <!-- Price & Action Row -->
                <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span class="text-xl font-bold text-pink-600">${p.price == 0 ? 'Free' : '₹' + p.price}</span>
                    <div class="flex items-center gap-2">
                        <!-- Like Button -->
                        <button onclick="likeProduct(${p.id})" class="px-3 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${hasLiked ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'}">
                            <i class="fa-solid fa-heart"></i> <span>${likes}</span>
                        </button>
                        ${p.price == 0 
                            ? `<a href="${p.fileLink || '#'}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-semibold transition shadow-sm">Download</a>`
                            : `<button onclick="openCheckout(${p.id})" class="gradient-btn px-4 py-2 rounded-full text-xs font-semibold transition shadow-sm">Buy Now</button>`
                        }
                    </div>
                </div>

                <!-- Interactive Comments & Feedback Box -->
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5">
                    <div class="flex justify-between items-center">
                        <span class="text-[11px] font-bold text-slate-700"><i class="fa-regular fa-comments text-pink-600 mr-1"></i> Comments (${comments.length})</span>
                        <button onclick="toggleFeedbackBox(${p.id})" class="text-[11px] font-semibold text-emerald-600 hover:underline"><i class="fa-regular fa-star mr-0.5"></i> Give Feedback</button>
                    </div>
                    
                    <div class="max-h-24 overflow-y-auto bg-white border border-slate-200 rounded-xl p-2 space-y-1">
                        ${commentsHtml}
                    </div>

                    <!-- Add Comment Input -->
                    <div class="flex gap-1.5">
                        <input type="text" id="comment-input-${p.id}" placeholder="Write a comment (Login required)..." class="flex-1 bg-white border border-slate-300 rounded-full px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500">
                        <button onclick="addProductComment(${p.id})" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition">Post</button>
                    </div>

                    <!-- Hidden Feedback Input Box -->
                    <div id="feedback-box-${p.id}" class="hidden pt-2 border-t border-slate-200 space-y-1.5">
                        <textarea id="feedback-input-${p.id}" rows="2" placeholder="Write your feedback for ${escapeHtml(p.title)}..." class="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"></textarea>
                        <button onclick="submitProductFeedback(${p.id})" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 rounded-full transition">Submit Feedback</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Like / Dislike Toggle Function (Login Protected & Permanent Firebase Sync)
function likeProduct(id) {
    if (!checkLoginBeforeAction()) return;

    const product = products.find(p => p.id === id);
    if (!product) return;

    if (!Array.isArray(product.likedUsers)) {
        product.likedUsers = [];
    }

    const userIndex = product.likedUsers.indexOf(loggedInUser.email);

    if (userIndex > -1) {
        // यदि यूज़र पहले लाइक कर चुका है, तो लाइक हटा दें (Dislike / Unlike)
        product.likedUsers.splice(userIndex, 1);
        product.likes = Math.max(0, (product.likes || 1) - 1);
    } else {
        // नया लाइक जोड़ें
        product.likedUsers.push(loggedInUser.email);
        product.likes = (product.likes || 0) + 1;
    }

    saveDataToFirebase('products', products);
    renderProducts(currentFilterCategory);
}

// Add Comment Function (Login Protected)
function addProductComment(id) {
    if (!checkLoginBeforeAction()) return;

    const input = document.getElementById(`comment-input-${id}`);
    if (!input) return;
    const text = input.value.trim();
    
    if (!text) {
        alert("कृपया पहले कमेंट लिखें!");
        return;
    }
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (!Array.isArray(product.comments)) {
        product.comments = [];
    }
    product.comments.push({
        user: loggedInUser.name,
        email: loggedInUser.email,
        text: text,
        timestamp: Date.now()
    });

    saveDataToFirebase('products', products);
    input.value = '';
    renderProducts(currentFilterCategory);
}

// Toggle Feedback Box
function toggleFeedbackBox(id) {
    const box = document.getElementById(`feedback-box-${id}`);
    if (box) {
        box.classList.toggle('hidden');
    }
}

// Submit Feedback Function
function submitProductFeedback(id) {
    const input = document.getElementById(`feedback-input-${id}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        alert("कृपया अपना फीडबैक लिखें!");
        return;
    }
    const product = products.find(p => p.id === id);
    const newFeedback = {
        id: Date.now(),
        productId: id,
        productTitle: product ? product.title : 'Store Item',
        text: text,
        date: new Date().toLocaleDateString('hi-IN')
    };

    feedbacks.unshift(newFeedback);
    saveDataToFirebase('feedbacks', feedbacks);
    input.value = '';
    toggleFeedbackBox(id);
    alert("धन्यवाद! आपका फीडबैक सफलतापूर्वक सबमिट हो गया है।");
}

function filterProducts(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'text-white');
        btn.classList.add('bg-white', 'text-slate-700', 'border', 'border-slate-200');
    });
    btnElement.classList.remove('bg-white', 'text-slate-700', 'border', 'border-slate-200');
    btnElement.classList.add('active-tab', 'text-white');
    renderProducts(category);
}

// Checkout Modal Functions (Login Protected)
function openCheckout(id) {
    if (!checkLoginBeforeAction()) return;

    const product = products.find(p => p.id === id);
    if (!product) return;

    currentCheckoutProductId = product.id;
    document.getElementById('modal-product-title').innerText = product.title;
    document.getElementById('modal-product-price').innerText = `₹${product.price}`;
    
    const upiString = `upi://pay?pa=${encodeURIComponent(profileData.upi)}&pn=${encodeURIComponent(profileData.name)}&am=${product.price}&cu=INR`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiString)}`;
    document.getElementById('upi-qr-img').src = qrApiUrl;

    const directPayBtn = document.getElementById('direct-upi-pay-btn');
    if (directPayBtn) {
        directPayBtn.href = upiString;
    }

    document.getElementById('user-utr-input').value = '';
    document.getElementById('order-status-msg').classList.add('hidden');
    document.getElementById('download-section').classList.add('hidden');

    const existingApproved = orders.find(o => o.productId === product.id && o.userEmail === loggedInUser.email && o.status === 'Approved');
    if (existingApproved) {
        document.getElementById('file-download-link').href = product.fileLink || '#';
        document.getElementById('download-section').classList.remove('hidden');
    }

    document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

// Submit UTR with User Email Tag
function submitOrderForApproval() {
    const utr = document.getElementById('user-utr-input').value.trim();
    if (!utr || utr.length < 6) {
        alert("कृपया सही UTR / Transaction ID दर्ज करें।");
        return;
    }

    const product = products.find(p => p.id === currentCheckoutProductId);
    if (!product) return;

    const newOrder = {
        orderId: Date.now(),
        productId: product.id,
        productTitle: product.title,
        price: product.price,
        userEmail: loggedInUser ? loggedInUser.email : 'Guest',
        userName: loggedInUser ? loggedInUser.name : 'Visitor',
        utr: utr,
        status: "Pending",
        isNewOrder: true,
        fileLink: product.fileLink || "#"
    };

    orders.unshift(newOrder);
    saveDataToFirebase('orders', orders);
    updateOrderNotificationBadge();

    document.getElementById('order-status-msg').classList.remove('hidden');
    alert("ऑर्डर सबमिट हो गया है! एडमिन द्वारा UTR वेरीफाई होने के बाद डाउनलोड लिंक अनलॉक कर दिया जाएगा।");
}

// Admin Control
function openAdminModal() {
    document.getElementById('admin-modal').classList.remove('hidden');
    document.getElementById('admin-login-view').classList.remove('hidden');
    document.getElementById('admin-dashboard-view').classList.add('hidden');
    document.getElementById('admin-pass-input').value = '';
    setTimeout(() => {
        document.getElementById('admin-pass-input').focus();
    }, 100);
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

function authenticateAdmin() {
    const pass = document.getElementById('admin-pass-input').value;
    const currentPass = profileData.password || 'admin123';
    
    if (pass === currentPass) {
        document.getElementById('admin-login-view').classList.add('hidden');
        document.getElementById('admin-dashboard-view').classList.remove('hidden');
        document.getElementById('admin-dashboard-view').classList.add('flex');
        
        document.getElementById('admin-input-photoname').value = profileData.photo;
        document.getElementById('admin-input-name').value = profileData.name;
        document.getElementById('admin-input-tagline').value = profileData.tagline;
        document.getElementById('admin-input-upi').value = profileData.upi;
        document.getElementById('admin-input-phone').value = profileData.phone;
        document.getElementById('admin-input-email').value = profileData.email;
        document.getElementById('admin-input-newpass').value = '';

        document.getElementById('admin-input-education').value = profileData.education;
        document.getElementById('admin-input-skills').value = profileData.skills;
        document.getElementById('admin-input-cert').value = profileData.certifications;

        renderAdminOrdersList();
        renderAdminItemsList();
    } else {
        alert("गलत पासवर्ड!");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('admin-pass-input');
    if (passInput) {
        passInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                authenticateAdmin();
            }
        });
    }
});

function logoutAdmin() {
    document.getElementById('admin-dashboard-view').classList.remove('flex');
    document.getElementById('admin-dashboard-view').classList.add('hidden');
    document.getElementById('admin-login-view').classList.remove('hidden');
    document.getElementById('admin-pass-input').value = '';
    setTimeout(() => {
        document.getElementById('admin-pass-input').focus();
    }, 100);
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active-admin-tab', 'text-white');
        btn.classList.add('bg-transparent', 'text-slate-600');
    });

    document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    activeBtn.classList.remove('bg-transparent', 'text-slate-600');
    activeBtn.classList.add('active-admin-tab', 'text-white');

    if (tabName === 'orders') {
        let updated = false;
        orders.forEach(o => {
            if (o.isNewOrder) {
                o.isNewOrder = false;
                updated = true;
            }
        });
        if (updated) {
            saveDataToFirebase('orders', orders);
            updateOrderNotificationBadge();
        }
        renderAdminOrdersList();
    }
    if (tabName === 'manage') renderAdminItemsList();
}

// Render Orders in Admin Panel (Light Theme)
function renderAdminOrdersList() {
    const listContainer = document.getElementById('admin-orders-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (orders.length === 0) {
        listContainer.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">कोई आर्डर नहीं है।</p>`;
        return;
    }

    orders.forEach(order => {
        const item = document.createElement('div');
        item.className = "bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";
        item.innerHTML = `
            <div>
                <h5 class="text-sm font-bold text-slate-900">${escapeHtml(order.productTitle)} <span class="text-pink-600 font-semibold">₹${order.price}</span></h5>
                <p class="text-xs text-slate-600 mt-0.5">User: <span class="font-medium text-slate-800">${escapeHtml(order.userEmail || 'N/A')}</span></p>
                <p class="text-xs text-slate-600">UTR: <span class="text-emerald-600 font-mono font-bold">${escapeHtml(order.utr)}</span></p>
                <p class="text-[10px] text-slate-500 mt-1">Status: <span class="${order.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'} font-semibold">${order.status}</span></p>
            </div>
            <div class="flex items-center gap-2">
                ${order.status === 'Pending' 
                    ? `<button onclick="approveOrder(${order.orderId})" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm">Approve & Unlock</button>`
                    : `<span class="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">Approved</span>`
                }
                <button onclick="deleteOrder(${order.orderId})" class="text-red-500 hover:text-red-600 text-xs px-2 py-1 font-medium">Delete</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function approveOrder(orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        order.status = "Approved";
        order.isNewOrder = false;
        saveDataToFirebase('orders', orders);
        updateOrderNotificationBadge();
        renderAdminOrdersList();
        alert(`आर्डर स्वीकृत कर दिया गया है! UTR: ${order.utr}`);
    }
}

function deleteOrder(orderId) {
    orders = orders.filter(o => o.orderId !== orderId);
    saveDataToFirebase('orders', orders);
    updateOrderNotificationBadge();
    renderAdminOrdersList();
}

// Render Catalog for Editing & Deleting
function renderAdminItemsList() {
    const container = document.getElementById('admin-items-list');
    if (!container) return;
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">कैटलॉग में कोई प्रोडक्ट नहीं है।</p>`;
        return;
    }

    products.forEach(p => {
        const div = document.createElement('div');
        div.className = "bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3";
        div.innerHTML = `
            <div class="flex justify-between items-center border-b border-slate-200 pb-2">
                <span class="text-xs uppercase bg-pink-50 text-pink-600 border border-pink-200 px-2 py-0.5 rounded font-bold">${p.category}</span>
                <button onclick="deleteProduct(${p.id})" class="text-xs text-red-500 hover:text-red-600 font-medium"><i class="fa-solid fa-trash mr-1"></i> Delete Product</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] text-slate-500">Title</label>
                    <input type="text" id="edit-title-${p.id}" value="${escapeHtml(p.title)}" class="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-900">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-500">Price (₹)</label>
                    <input type="number" id="edit-price-${p.id}" value="${p.price}" class="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-900">
                </div>
            </div>
            <div>
                <label class="block text-[10px] text-slate-500">Download Link (APK / Drive URL)</label>
                <input type="text" id="edit-file-${p.id}" value="${escapeHtml(p.fileLink)}" class="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-900">
            </div>
            <button onclick="saveProductEdit(${p.id})" class="gradient-btn text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition w-full">Save Changes</button>
        `;
        container.appendChild(div);
    });
}

function saveProductEdit(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.title = document.getElementById(`edit-title-${id}`).value;
        product.price = parseFloat(document.getElementById(`edit-price-${id}`).value) || 0;
        product.fileLink = document.getElementById(`edit-file-${id}`).value;

        saveDataToFirebase('products', products);
        renderProducts(currentFilterCategory);
        renderAdminItemsList();
        alert("प्रोडक्ट अपडेट हो गया!");
    }
}

function deleteProduct(id) {
    if (confirm("क्या आप वाकई इस प्रोडक्ट को डिलीट करना चाहते हैं?")) {
        products = products.filter(p => p.id !== id);
        saveDataToFirebase('products', products);
        renderProducts(currentFilterCategory);
        renderAdminItemsList();
    }
}

// Save Profile Settings
function saveProfileSettings() {
    profileData.name = document.getElementById('admin-input-name').value || profileData.name;
    profileData.tagline = document.getElementById('admin-input-tagline').value || profileData.tagline;
    profileData.upi = document.getElementById('admin-input-upi').value || profileData.upi;
    profileData.phone = document.getElementById('admin-input-phone').value || profileData.phone;
    profileData.email = document.getElementById('admin-input-email').value || profileData.email;
    profileData.photo = document.getElementById('admin-input-photoname').value || profileData.photo;

    const newPass = document.getElementById('admin-input-newpass').value;
    if (newPass && newPass.trim() !== '') {
        profileData.password = newPass.trim();
    }
    saveDataToFirebase('profile', profileData);
    updateProfileUI();
    alert("प्रोफाइल सेटिंग्स सफलतापूर्वक सेव हो गई हैं!");
    closeAdminModal();
}

function saveAboutSettings() {
    profileData.education = document.getElementById('admin-input-education').value || profileData.education;
    profileData.skills = document.getElementById('admin-input-skills').value || profileData.skills;
    profileData.certifications = document.getElementById('admin-input-cert').value || profileData.certifications;

    saveDataToFirebase('profile', profileData);
    updateProfileUI();
    alert("क्वालिफिकेशंस अपडेट हो गई हैं!");
}

// Add New Product
function addNewProduct() {
    const category = document.getElementById('add-item-category').value;
    const title = document.getElementById('add-item-title').value;
    const price = parseFloat(document.getElementById('add-item-price').value);
    const desc = document.getElementById('add-item-desc').value;
    const fileLink = document.getElementById('add-item-file').value;
    const imgFileInput = document.getElementById('add-item-file-img');

    if (!title || isNaN(price)) {
        alert("कृपया प्रोडक्ट का नाम और कीमत दर्ज करें।");
        return;
    }

    if (imgFileInput.files && imgFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageBase64 = e.target.result;
            saveNewProductObject(category, title, price, desc, imageBase64, fileLink);
        };
        reader.readAsDataURL(imgFileInput.files[0]);
    } else {
        const defaultImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600";
        saveNewProductObject(category, title, price, desc, defaultImage, fileLink);
    }
}

function saveNewProductObject(category, title, price, desc, image, fileLink) {
    const newProd = {
        id: Date.now(),
        title,
        category,
        price,
        desc: desc || `New ${category} item.`,
        image,
        fileLink: fileLink || "#",
        likes: 0,
        likedUsers: [],
        comments: []
    };

    products.unshift(newProd);
    try {
        saveDataToFirebase('products', products);
        renderProducts(currentFilterCategory);
        closeAdminModal();
        alert(`₹${price} का नया प्रोडक्ट सफलतापूर्वक पब्लिश हो गया!`);
    } catch (err) {
        alert("इमेज सेव करने में समस्या आई!");
    }
}

window.onload = () => {
    loadSavedData();
};
