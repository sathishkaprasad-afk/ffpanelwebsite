// ==========================================
// JSONBIN DETAILS & CACHE CONTROL
// ==========================================
const BIN_ID = '6abc2dffffd5d160533ced21';
const MASTER_KEY = '$2a$10$xATlV11cf0tlJLSuEq5uv.GUZ58mW6JT8ojnq/ILKrSVJBvbtutTS';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// SHA-256 HASH OF "Sathishka@1234"
const PASSCODE_HASH = '70f3f50edc51b7fa1fbf0465249aed9726284ba5ad5eb25ef90059c3f0b2f5ef';

const DEFAULT_DATA = {
    settings: {
        logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
        title: 'S4G X CHEATZ',
        subtitle: 'Sri Lanka Trusted Android/iOS/PC Panel Seller',
        whatsappNumber: '94700000000',
        feat1Title: '100% Anti-Ban', feat1Desc: 'Bypass technology to keep main ID safe.',
        feat2Title: 'Instant Delivery', feat2Desc: 'Get panel access immediately after payment.',
        feat3Title: '24/7 Support', feat3Desc: 'Support team always online.'
    },
    products: []
};

let appData = null;
let isAuthenticatedAdmin = false;

// Helper function to calculate SHA-256 Hash
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fetchCloudData() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
    try {
        const res = await fetch(`${API_URL}/latest?t=${Date.now()}`, {
            method: 'GET',
            headers: { 
                'X-Master-Key': MASTER_KEY,
                'X-Bin-Meta': 'false'
            },
            cache: 'no-cache'
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        
        if (json && json.settings) {
            appData = json;
        } else if (json.record && json.record.settings) {
            appData = json.record;
        } else {
            appData = DEFAULT_DATA;
            await syncCloudData();
        }
    } catch (e) {
        console.error("Cloud Fetch Error:", e);
        appData = DEFAULT_DATA;
    }
    document.getElementById('loadingOverlay').classList.add('hidden');
    renderMainSite();
}

async function syncCloudData() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
    try {
        const res = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(appData)
        });

        if (!res.ok) {
            throw new Error("Save Failed");
        }
    } catch (e) {
        console.error("Cloud Sync Error:", e);
        alert("Cloud Sync Failed! Check internet connection.");
    }
    document.getElementById('loadingOverlay').classList.add('hidden');
    renderMainSite();
}

function renderMainSite() {
    if(!appData) return;
    const s = appData.settings || {};
    document.getElementById('displayLogo').src = s.logoUrl || '';
    document.getElementById('adminLogoDisplay').src = s.logoUrl || '';
    document.getElementById('displayTitle').innerText = s.title || '';
    document.getElementById('displaySubtitle').innerText = s.subtitle || '';

    const waNumber = (s.whatsappNumber || '').replace(/[^0-9]/g, '');
    document.getElementById('adminWhatsAppBtn').href = `https://wa.me/${waNumber}`;

    document.getElementById('displayFeat1Title').innerText = s.feat1Title || '';
    document.getElementById('displayFeat1Desc').innerText = s.feat1Desc || '';
    document.getElementById('displayFeat2Title').innerText = s.feat2Title || '';
    document.getElementById('displayFeat2Desc').innerText = s.feat2Desc || '';
    document.getElementById('displayFeat3Title').innerText = s.feat3Title || '';
    document.getElementById('displayFeat3Desc').innerText = s.feat3Desc || '';

    const prods = appData.products || [];
    document.getElementById('iosCountBadge').innerText = `${prods.filter(p => p.platform === 'ios').length} Products`;
    document.getElementById('androidCountBadge').innerText = `${prods.filter(p => p.platform === 'android').length} Products`;
    document.getElementById('pcCountBadge').innerText = `${prods.filter(p => p.platform === 'pc').length} Products`;

    if(isAuthenticatedAdmin) {
        renderProductManager();
        populateSettingsForm();
    }
}

function toggleMainView() {
    const homePage = document.getElementById('homePage');
    const adminViewPage = document.getElementById('adminViewPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const toggleText = document.getElementById('toggleText');

    if (isAuthenticatedAdmin) {
        homePage.classList.remove('hidden');
        adminViewPage.classList.add('hidden');
        dashboardPage.classList.add('hidden');
        toggleText.innerText = "Admin Page";
        isAuthenticatedAdmin = false;
        return;
    }

    if (homePage.classList.contains('hidden')) {
        homePage.classList.remove('hidden');
        adminViewPage.classList.add('hidden');
        dashboardPage.classList.add('hidden');
        toggleText.innerText = "Admin Page";
    } else {
        homePage.classList.add('hidden');
        adminViewPage.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
        toggleText.innerText = "Main Page";
    }
}

function openCatalogModal(platform) {
    const modal = document.getElementById('catalogModal');
    const container = document.getElementById('catalogProductContainer');
    const prods = (appData.products || []).filter(p => p.platform === platform);

    if (prods.length === 0) {
        container.innerHTML = `<div class="py-10 text-center text-slate-500">No products active</div>`;
    } else {
        const waNum = (appData.settings.whatsappNumber || '').replace(/[^0-9]/g, '');
        container.innerHTML = prods.map(p => `
            <div class="glass-panel p-4 border-slate-700 flex flex-col gap-2">
                <div class="flex justify-between">
                    <h3 class="font-bold text-white">${p.name}</h3>
                    <span class="text-cyan-400 font-bold">${p.price}</span>
                </div>
                <p class="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded">${p.description}</p>
                <a href="https://wa.me/${waNum}?text=I%20want%20to%20buy%20${encodeURIComponent(p.name)}" target="_blank" class="w-full py-2.5 bg-emerald-600 text-center font-bold text-xs rounded-xl text-white">Buy on WhatsApp</a>
            </div>
        `).join('');
    }
    modal.classList.remove('hidden');
}

function closeCatalogModal() { document.getElementById('catalogModal').classList.add('hidden'); }
function openPasswordModal() { document.getElementById('passwordModal').classList.remove('hidden'); }
function closePasswordModal() { document.getElementById('passwordModal').classList.add('hidden'); }

async function verifyPassword() {
    const inputVal = document.getElementById('passcodeInput').value;
    const inputHash = await sha256(inputVal);

    if (inputHash === PASSCODE_HASH) {
        closePasswordModal();
        isAuthenticatedAdmin = true;
        document.getElementById('homePage').classList.add('hidden');
        document.getElementById('adminViewPage').classList.add('hidden');
        document.getElementById('dashboardPage').classList.remove('hidden');
        renderMainSite();
    } else {
        document.getElementById('passcodeError').classList.remove('hidden');
    }
}

function logoutAdmin() {
    isAuthenticatedAdmin = false;
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('homePage').classList.remove('hidden');
}

function switchDashTab(tab) {
    document.getElementById('dashTabProducts').classList.toggle('hidden', tab !== 'products');
    document.getElementById('dashTabSettings').classList.toggle('hidden', tab !== 'settings');
}

function renderProductManager() {
    const container = document.getElementById('adminProductList');
    const prods = appData.products || [];
    container.innerHTML = prods.map((p, i) => `
        <div class="glass-panel p-3 flex justify-between items-center text-left">
            <div>
                <span class="text-[10px] uppercase font-bold text-cyan-400">${p.platform}</span>
                <h4 class="text-xs font-bold text-white">${p.name}</h4>
            </div>
            <button onclick="deleteProduct(${i})" class="text-rose-500 font-bold text-xs px-2 py-1 bg-slate-800 rounded">Delete</button>
        </div>
    `).join('');
}

function openProductForm() { document.getElementById('productFormModal').classList.remove('hidden'); }
function closeProductForm() { document.getElementById('productFormModal').classList.add('hidden'); }

async function handleProductSubmit(e) {
    e.preventDefault();
    const newProd = {
        id: 'prod-' + Date.now(),
        name: document.getElementById('formProductName').value,
        platform: document.getElementById('formProductPlatform').value,
        price: document.getElementById('formProductPrice').value,
        videoUrl: document.getElementById('formProductVideo').value,
        description: document.getElementById('formProductDesc').value,
        inStock: document.getElementById('formProductInStock').checked
    };
    if(!appData.products) appData.products = [];
    appData.products.push(newProd);
    closeProductForm();
    await syncCloudData();
}

async function deleteProduct(index) {
    appData.products.splice(index, 1);
    await syncCloudData();
}

function populateSettingsForm() {
    const s = appData.settings || {};
    document.getElementById('inputLogoUrl').value = s.logoUrl || '';
    document.getElementById('inputMainTitle').value = s.title || '';
    document.getElementById('inputSubtitle').value = s.subtitle || '';
    document.getElementById('inputWhatsApp').value = s.whatsappNumber || '';
    document.getElementById('inputFeat1Title').value = s.feat1Title || '';
    document.getElementById('inputFeat1Desc').value = s.feat1Desc || '';
    document.getElementById('inputFeat2Title').value = s.feat2Title || '';
    document.getElementById('inputFeat2Desc').value = s.feat2Desc || '';
    document.getElementById('inputFeat3Title').value = s.feat3Title || '';
    document.getElementById('inputFeat3Desc').value = s.feat3Desc || '';
}

async function saveSiteSettings() {
    appData.settings = {
        logoUrl: document.getElementById('inputLogoUrl').value,
        title: document.getElementById('inputMainTitle').value,
        subtitle: document.getElementById('inputSubtitle').value,
        whatsappNumber: document.getElementById('inputWhatsApp').value,
        feat1Title: document.getElementById('inputFeat1Title').value,
        feat1Desc: document.getElementById('inputFeat1Desc').value,
        feat2Title: document.getElementById('inputFeat2Title').value,
        feat2Desc: document.getElementById('inputFeat2Desc').value,
        feat3Title: document.getElementById('inputFeat3Title').value,
        feat3Desc: document.getElementById('inputFeat3Desc').value,
    };
    await syncCloudData();
    alert("Settings Updated Globally!");
}

window.addEventListener('DOMContentLoaded', fetchCloudData);
