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
let currentCheckoutProductId = null;

// Firebase Sync Initialization
function initFirebaseSync() {
    if (!window.db) return;
    const { ref, get, child } = window.DB_MODULE || {}; // handled via global scope
    
    const dbRef = window.ref(window.db);
    
    // Fetch Profile
    window.get(window.child(dbRef, "profile")).then((snapshot) => {
        if (snapshot.exists()) {
            profileData = snapshot.val();
            updateProfileUI();
        } else {
            saveDataToFirebase('profile', profileData);
        }
    }).catch((error) => { console.error(error); });

    // Fetch Products
    window.get(window.child(dbRef, "products")).then((snapshot) => {
        if (snapshot.exists()) {
            products = snapshot.val() || [];
            renderProducts('all');
        }
    });

    // Fetch Orders
    window.get(window.child(dbRef, "orders")).then((snapshot) => {
        if (snapshot.exists()) {
            orders = snapshot.val() || [];
        }
    });
}

// Fallback load data if firebase takes time
function loadSavedData() {
    updateProfileUI();
    renderProducts('all');
}

// Helper to save to Firebase & LocalStorage
function saveDataToFirebase(path, data) {
    if (window.db && window.ref && window.set) {
        window.set(window.ref(window.db, path), data).catch(err => console.log(err));
    }
    localStorage.setItem(`raman_portfolio_${path}`, JSON.stringify(data));
}

function updateProfileUI() {
    if (profileData.photo) {
        document.getElementById('nav-profile-img').src = profileData.photo;
        document.getElementById('hero-profile-img').src = profileData.photo;
    }
    document.getElementById('hero-name').innerText = profileData.name;
    document.getElementById('hero-tagline').innerText = profileData.tagline;
    document.getElementById('display-email').innerText = profileData.email;
    document.getElementById('display-phone').innerText = profileData.phone;
    document.getElementById('display-upi-id').innerText = profileData.upi;
    
    document.getElementById('display-education').innerHTML = profileData.education;
    document.getElementById('display-skills').innerHTML = profileData.skills;
    document.getElementById('display-certifications').innerHTML = profileData.certifications;
    
    document.getElementById('contact-email-btn').href = `mailto:${profileData.email}`;
    const cleanPhone = profileData.phone.replace(/[^0-9]/g, '');
    document.getElementById('contact-phone-btn').href = `https://wa.me/${cleanPhone}`;
}

// Render Products Grid
function renderProducts(filter = 'all') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 bg-slate-900/30 border border-slate-800/60 rounded-2xl">
            <i class="fa-solid fa-box-open text-3xl mb-2 text-slate-600"></i>
            <p>No products added yet. Use the Admin Panel to upload your items!</p>
        </div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = "product-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-lg";
        card.innerHTML = `
            <div>
                <div class="h-48 overflow-hidden bg-slate-950 relative">
                    <img src="${p.image}" alt="${p.title}" class="product-card-img w-full h-full object-cover">
                    <span class="absolute top-3 right-3 bg-blue-600/95 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">${p.category}</span>
                </div>
                <div class="p-5">
                    <h3 class="font-bold text-lg mb-1">${p.title}</h3>
                    <p class="text-slate-400 text-sm line-clamp-2 mb-4">${p.desc}</p>
                </div>
            </div>
            <div class="p-5 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-auto">
                <span class="text-xl font-bold text-blue-400">₹${p.price}</span>
                <button onclick="openCheckout(${p.id})" class="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md">
                    Buy Now
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterProducts(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active-tab');
        btn.classList.add('bg-slate-900', 'text-slate-300', 'border', 'border-slate-800');
    });
    btnElement.classList.remove('bg-slate-900', 'text-slate-300', 'border', 'border-slate-800');
    btnElement.classList.add('active-tab');
    renderProducts(category);
}

// Checkout Modal
function openCheckout(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    currentCheckoutProductId = product.id;
    document.getElementById('modal-product-title').innerText = product.title;
    document.getElementById('modal-product-price').innerText = `₹${product.price}`;
    
    const upiString = `upi://pay?pa=${encodeURIComponent(profileData.upi)}&pn=${encodeURIComponent(profileData.name)}&am=${product.price}&cu=INR`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiString)}`;
    document.getElementById('upi-qr-img').src = qrApiUrl;

    document.getElementById('user-utr-input').value = '';
    document.getElementById('order-status-msg').classList.add('hidden');
    document.getElementById('download-section').classList.add('hidden');

    const existingApproved = orders.find(o => o.productId === product.id && o.status === 'Approved');
    if (existingApproved) {
        document.getElementById('file-download-link').href = product.fileLink || '#';
        document.getElementById('download-section').classList.remove('hidden');
    }

    document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

// Submit UTR
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
        utr: utr,
        status: "Pending",
        fileLink: product.fileLink || "#"
    };

    orders.unshift(newOrder);
    saveDataToFirebase('orders', orders);

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
        btn.classList.remove('active-admin-tab');
        btn.classList.add('bg-slate-950', 'text-slate-400');
    });

    document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    activeBtn.classList.remove('bg-slate-950', 'text-slate-400');
    activeBtn.classList.add('active-admin-tab');

    if (tabName === 'orders') renderAdminOrdersList();
    if (tabName === 'manage') renderAdminItemsList();
}

// Render Orders in Admin Panel
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
        item.className = "bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";
        item.innerHTML = `
            <div>
                <h5 class="text-sm font-bold text-white">${order.productTitle} <span class="text-blue-400 font-semibold">₹${order.price}</span></h5>
                <p class="text-xs text-slate-400 mt-0.5">UTR: <span class="text-emerald-400 font-mono font-bold">${order.utr}</span></p>
                <p class="text-[10px] text-slate-500 mt-1">Status: <span class="${order.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'} font-semibold">${order.status}</span></p>
            </div>
            <div class="flex items-center gap-2">
                ${order.status === 'Pending' 
                    ? `<button onclick="approveOrder(${order.orderId})" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow">Approve & Unlock</button>`
                    : `<span class="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">Approved</span>`
                }
                <button onclick="deleteOrder(${order.orderId})" class="text-red-400 hover:text-red-300 text-xs px-2 py-1">Delete</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function approveOrder(orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        order.status = "Approved";
        saveDataToFirebase('orders', orders);
        renderAdminOrdersList();
        alert(`आर्डर स्वीकृत कर दिया गया है! UTR: ${order.utr}`);
    }
}

function deleteOrder(orderId) {
    orders = orders.filter(o => o.orderId !== orderId);
    saveDataToFirebase('orders', orders);
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
        div.className = "bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3";
        div.innerHTML = `
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <span class="text-xs uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">${p.category}</span>
                <button onclick="deleteProduct(${p.id})" class="text-xs text-red-400 hover:text-red-300"><i class="fa-solid fa-trash mr-1"></i> Delete Product</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] text-slate-400">Title</label>
                    <input type="text" id="edit-title-${p.id}" value="${p.title}" class="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400">Price (₹)</label>
                    <input type="number" id="edit-price-${p.id}" value="${p.price}" class="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white">
                </div>
            </div>
            <div>
                <label class="block text-[10px] text-slate-400">Google Drive Download Link</label>
                <input type="text" id="edit-file-${p.id}" value="${p.fileLink}" class="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white">
            </div>
            <button onclick="saveProductEdit(${p.id})" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition w-full">Save Changes</button>
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
        renderProducts('all');
        renderAdminItemsList();
        alert("प्रोडक्ट अपडेट हो गया!");
    }
}

function deleteProduct(id) {
    if (confirm("क्या आप वाकई इस प्रोडक्ट को डिलीट करना चाहते हैं?")) {
        products = products.filter(p => p.id !== id);
        saveDataToFirebase('products', products);
        renderProducts('all');
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
        fileLink: fileLink || "#"
    };

    products.unshift(newProd);
    try {
        saveDataToFirebase('products', products);
        renderProducts('all');
        closeAdminModal();
        alert(`₹${price} का नया प्रोडक्ट सफलतापूर्वक पब्लिश हो गया!`);
    } catch (err) {
        alert("इमेज सेव करने में समस्या आई!");
    }
}

document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

window.onload = () => {
    loadSavedData();
};
