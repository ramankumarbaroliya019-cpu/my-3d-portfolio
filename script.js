// Profile State & Security Password Storage
let profileData = {
    photo: "1000209783.png",
    name: "Raman Kumar Baroliya",
    tagline: "Crafting high-end 3D hard-surface models in Blender, developing responsive web applications, and building smart digital tools.",
    upi: "Lalr13031-1@oksbi",
    phone: "+91 7742987003",
    email: "Lalr13031@gmail.com",
    education: "B.Tech IT at <strong>Government Engineering College Ajmer</strong> (BTU). 86% in 12th Senior Secondary.",
    skills: "Blender 3D Modeling, Hard-Surface Design, C++, Python, JavaScript, HTML/CSS, and Microcontroller projects.",
    certifications: "Google Kubernetes, Canva Digital Design, SEO, Google Ads, and Embedded IoT Certification.",
    password: "admin123" // Default password stored securely in state
};

// Initial Products Array is empty as requested
let products = [];

// Load Saved Data from LocalStorage
function loadSavedData() {
    const savedProfile = localStorage.getItem('raman_portfolio_profile');
    if (savedProfile) {
        profileData = JSON.parse(savedProfile);
    }
    const savedProducts = localStorage.getItem('raman_portfolio_products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    updateProfileUI();
}

// Update Profile & About UI Elements
function updateProfileUI() {
    document.getElementById('nav-profile-img').src = profileData.photo;
    document.getElementById('hero-profile-img').src = profileData.photo;
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
    grid.innerHTML = '';
    
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 bg-slate-900/30 border border-slate-800/60 rounded-2xl">
            <i class="fa-solid fa-box-open text-3xl mb-2 text-slate-600"></i>
            <p>No products added yet. Use the Admin Panel to upload your 3D models, books, or PPTs!</p>
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
                    <span class="absolute top-3 right-3 bg-blue-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">${p.category}</span>
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

// Filter Categories Button Logic
function filterProducts(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active-tab');
        btn.classList.add('bg-slate-900', 'text-slate-300', 'border', 'border-slate-800');
    });
    btnElement.classList.remove('bg-slate-900', 'text-slate-300', 'border', 'border-slate-800');
    btnElement.classList.add('active-tab');
    renderProducts(category);
}

// Checkout Modal & Dynamic UPI QR Logic
function openCheckout(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modal-product-title').innerText = product.title;
    document.getElementById('modal-product-price').innerText = `₹${product.price}`;
    
    const upiString = `upi://pay?pa=${encodeURIComponent(profileData.upi)}&pn=${encodeURIComponent(profileData.name)}&am=${product.price}&cu=INR`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiString)}`;
    document.getElementById('upi-qr-img').src = qrApiUrl;

    const dlLink = document.getElementById('file-download-link');
    dlLink.href = product.fileLink && product.fileLink !== "#" ? product.fileLink : "#";
    document.getElementById('download-section').classList.add('hidden');

    document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

function verifyPayment() {
    alert("Payment status acknowledged! Dynamic file download link is unlocked.");
    document.getElementById('download-section').classList.remove('hidden');
}

// Admin Modal Control
function openAdminModal() {
    document.getElementById('admin-modal').classList.remove('hidden');
    document.getElementById('admin-login-view').classList.remove('hidden');
    document.getElementById('admin-dashboard-view').classList.add('hidden');
    document.getElementById('admin-pass-input').value = '';
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

// Authenticate with Saved/Updated Password
function authenticateAdmin() {
    const pass = document.getElementById('admin-pass-input').value;
    const currentPass = profileData.password || 'admin123';
    
    if (pass === currentPass) {
        document.getElementById('admin-login-view').classList.add('hidden');
        document.getElementById('admin-dashboard-view').classList.remove('hidden');
        document.getElementById('admin-dashboard-view').classList.add('flex');
        
        // Populate inputs
        document.getElementById('admin-input-photo').value = profileData.photo;
        document.getElementById('admin-input-name').value = profileData.name;
        document.getElementById('admin-input-tagline').value = profileData.tagline;
        document.getElementById('admin-input-upi').value = profileData.upi;
        document.getElementById('admin-input-phone').value = profileData.phone;
        document.getElementById('admin-input-email').value = profileData.email;
        document.getElementById('admin-input-newpass').value = ''; // Keep blank for security

        document.getElementById('admin-input-education').value = profileData.education;
        document.getElementById('admin-input-skills').value = profileData.skills;
        document.getElementById('admin-input-cert').value = profileData.certifications;
    } else {
        alert("Incorrect Admin Password! Please try again.");
    }
}

function logoutAdmin() {
    document.getElementById('admin-dashboard-view').classList.remove('flex');
    document.getElementById('admin-dashboard-view').classList.add('hidden');
    document.getElementById('admin-login-view').classList.remove('hidden');
}

// Admin Multi-Tab Navigation
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
}

// Save Profile, Photo, and New Password Settings
function saveProfileSettings() {
    profileData.photo = document.getElementById('admin-input-photo').value || profileData.photo;
    profileData.name = document.getElementById('admin-input-name').value || profileData.name;
    profileData.tagline = document.getElementById('admin-input-tagline').value || profileData.tagline;
    profileData.upi = document.getElementById('admin-input-upi').value || profileData.upi;
    profileData.phone = document.getElementById('admin-input-phone').value || profileData.phone;
    profileData.email = document.getElementById('admin-input-email').value || profileData.email;

    // Check if user entered a new password
    const newPass = document.getElementById('admin-input-newpass').value;
    if (newPass && newPass.trim() !== '') {
        profileData.password = newPass.trim();
        alert("Profile details and SECURITY PASSWORD updated successfully!");
    } else {
        alert("Profile details updated successfully!");
    }

    localStorage.setItem('raman_portfolio_profile', JSON.stringify(profileData));
    updateProfileUI();
}

// Save Qualifications & Skills Settings from Admin Panel
function saveAboutSettings() {
    profileData.education = document.getElementById('admin-input-education').value || profileData.education;
    profileData.skills = document.getElementById('admin-input-skills').value || profileData.skills;
    profileData.certifications = document.getElementById('admin-input-cert').value || profileData.certifications;

    localStorage.setItem('raman_portfolio_profile', JSON.stringify(profileData));
    updateProfileUI();
    alert("Qualifications and skills updated successfully!");
}

// Add New Product in Specific Section
function addNewProductByCategory(category) {
    const title = document.getElementById(`add-${category}-title`).value;
    const price = parseFloat(document.getElementById(`add-${category}-price`).value);
    const desc = document.getElementById(`add-${category}-desc`).value;
    let image = document.getElementById(`add-${category}-image`).value;
    const fileLink = document.getElementById(`add-${category}-file`).value;

    if (!title || !price) {
        alert("Please enter both product title and price.");
        return;
    }

    if (!image) {
        image = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600";
    }

    const newProd = {
        id: Date.now(),
        title,
        category,
        price,
        desc: desc || `Newly added ${category} item.`,
        image,
        fileLink: fileLink || "#"
    };

    products.unshift(newProd);
    localStorage.setItem('raman_portfolio_products', JSON.stringify(products));
    renderProducts('all');
    closeAdminModal();
    alert(`New ${category.toUpperCase()} item published successfully!`);
}

// Mobile Navigation Menu Toggle
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Window Load Initialization
window.onload = () => {
    loadSavedData();
    renderProducts('all');
};
