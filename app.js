// ===== Data Management =====
class Database {
    constructor() {
        this.loadData();
    }

    loadData() {
        const data = localStorage.getItem('baki_khata_data');
        if (data) {
            const parsed = JSON.parse(data);
            this.customers = parsed.customers || [];
            this.transactions = parsed.transactions || [];
            this.shop = parsed.shop || { name: '', phone: '', address: '' };
        } else {
            this.customers = [];
            this.transactions = [];
            this.shop = { name: '', phone: '', address: '' };
        }
    }

    saveData() {
        const data = {
            customers: this.customers,
            transactions: this.transactions,
            shop: this.shop,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('baki_khata_data', JSON.stringify(data));
    }

    // Customer methods
    addCustomer(name, phone, address = '') {
        const customer = {
            id: Date.now().toString(),
            name,
            phone,
            address,
            createdAt: new Date().toISOString()
        };
        this.customers.push(customer);
        this.saveData();
        return customer;
    }

    getCustomer(id) {
        return this.customers.find(c => c.id === id);
    }

    getAllCustomers() {
        return this.customers;
    }

    updateCustomer(id, name, phone, address) {
        const customer = this.getCustomer(id);
        if (customer) {
            customer.name = name;
            customer.phone = phone;
            customer.address = address;
            this.saveData();
            return customer;
        }
    }

    deleteCustomer(id) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            this.customers.splice(index, 1);
            // Also delete associated transactions
            this.transactions = this.transactions.filter(t => t.customerId !== id);
            this.saveData();
            return true;
        }
        return false;
    }

    getCustomerBalance(customerId) {
        let balance = 0;
        this.transactions
            .filter(t => t.customerId === customerId)
            .forEach(t => {
                if (t.type === 'due') {
                    balance += t.amount;
                } else if (t.type === 'collection') {
                    balance -= t.amount;
                }
            });
        return balance;
    }

    getCustomerTransactions(customerId) {
        return this.transactions
            .filter(t => t.customerId === customerId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Transaction methods
    addTransaction(customerId, type, amount, note = '', date = new Date().toISOString().split('T')[0]) {
        const transaction = {
            id: Date.now().toString(),
            customerId,
            type,
            amount: parseFloat(amount),
            note,
            date,
            createdAt: new Date().toISOString()
        };
        this.transactions.push(transaction);
        this.saveData();
        return transaction;
    }

    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    }

    updateTransaction(id, type, amount, note, date) {
        const transaction = this.getTransaction(id);
        if (transaction) {
            transaction.type = type;
            transaction.amount = parseFloat(amount);
            transaction.note = note;
            transaction.date = date;
            this.saveData();
            return transaction;
        }
    }

    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // Shop info
    setShopInfo(name, phone, address) {
        this.shop = { name, phone, address };
        this.saveData();
    }

    getShopInfo() {
        return this.shop;
    }

    // Statistics
    getTotalDue() {
        return this.customers.reduce((sum, customer) => {
            return sum + this.getCustomerBalance(customer.id);
        }, 0);
    }

    getThisMonthPaid() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        return this.transactions
            .filter(t => t.type === 'collection' && t.date >= monthStart)
            .reduce((sum, t) => sum + t.amount, 0);
    }

    getThisMonthNewCustomers() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        return this.customers.filter(c => c.createdAt >= monthStart).length;
    }

    getRecentTransactions(limit = 5) {
        return this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }
}

// ===== UI Management =====
class App {
    constructor() {
        this.db = new Database();
        this.currentCustomerId = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupEventListeners();
        this.showDashboard();
        this.updateShopInfo();
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.getElementById('nav-dashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('nav-customers').addEventListener('click', () => this.showCustomerList());
        document.getElementById('nav-settings').addEventListener('click', () => this.showSettings());

        // Dashboard
        document.getElementById('add-customer-btn').addEventListener('click', () => this.showAddCustomerModal());

        // Customer List
        document.getElementById('add-customer-btn-list').addEventListener('click', () => this.showAddCustomerModal());
        document.getElementById('customer-search').addEventListener('input', (e) => this.filterCustomers(e.target.value));

        // Customer Details - New split transaction buttons
        document.getElementById('add-due-btn').addEventListener('click', () => this.showAddDueModal());
        document.getElementById('add-collection-btn').addEventListener('click', () => this.showAddCollectionModal());
        document.getElementById('share-pdf-btn').addEventListener('click', () => this.generatePDF());
        document.getElementById('customer-menu-btn').addEventListener('click', () => this.showCustomerMenu());

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Add Customer Modal
        document.getElementById('save-new-customer').addEventListener('click', () => this.saveNewCustomer());

        // Add Due Modal
        document.getElementById('save-due').addEventListener('click', () => this.saveDue());

        // Add Collection Modal
        document.getElementById('save-collection').addEventListener('click', () => this.saveCollection());

        // Customer Menu Modal
        document.getElementById('edit-customer-btn').addEventListener('click', () => this.showEditCustomerModal());
        document.getElementById('call-customer-btn').addEventListener('click', () => this.callCustomer());
        document.getElementById('delete-customer-btn').addEventListener('click', () => this.deleteCustomer());

        // Edit Customer Modal
        document.getElementById('save-edited-customer').addEventListener('click', () => this.saveEditedCustomer());

        // Settings
        document.getElementById('save-shop-info').addEventListener('click', () => this.saveShopInfo());

        // Header menu
        document.getElementById('menu-btn').addEventListener('click', () => this.showMenuModal());
        document.getElementById('menu-close').addEventListener('click', () => this.closeAllModals());

        // Set today's date in transaction modals
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('due-date').value = today;
        document.getElementById('collection-date').value = today;
    }

    // View Management
    hideAllViews() {
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('customer-list-view').classList.add('hidden');
        document.getElementById('customer-details-view').classList.add('hidden');
        document.getElementById('settings-view').classList.add('hidden');
    }

    showDashboard() {
        this.hideAllViews();
        document.getElementById('dashboard-view').classList.remove('hidden');
        document.getElementById('header-title').textContent = 'বাকি খাতা';
        
        // Update nav
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-t-2', 'border-blue-600');
            btn.classList.add('text-gray-600');
        });
        document.getElementById('nav-dashboard').classList.add('text-blue-600', 'border-t-2', 'border-blue-600');
        document.getElementById('nav-dashboard').classList.remove('text-gray-600');

        this.updateDashboard();
    }

    showCustomerList() {
        this.hideAllViews();
        document.getElementById('customer-list-view').classList.remove('hidden');
        document.getElementById('header-title').textContent = 'গ্রাহক';

        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-t-2', 'border-blue-600');
            btn.classList.add('text-gray-600');
        });
        document.getElementById('nav-customers').classList.add('text-blue-600', 'border-t-2', 'border-blue-600');
        document.getElementById('nav-customers').classList.remove('text-gray-600');

        this.updateCustomerList();
    }

    showCustomerDetails(customerId) {
        this.currentCustomerId = customerId;
        this.hideAllViews();
        document.getElementById('customer-details-view').classList.remove('hidden');

        const customer = this.db.getCustomer(customerId);
        document.getElementById('header-title').textContent = customer.name;

        this.updateCustomerDetails(customerId);
    }

    showSettings() {
        this.hideAllViews();
        document.getElementById('settings-view').classList.remove('hidden');
        document.getElementById('header-title').textContent = 'সেটিংস';

        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-t-2', 'border-blue-600');
            btn.classList.add('text-gray-600');
        });
        document.getElementById('nav-settings').classList.add('text-blue-600', 'border-t-2', 'border-blue-600');
        document.getElementById('nav-settings').classList.remove('text-gray-600');

        this.updateShopInfoUI();
    }

    // Dashboard Updates
    updateDashboard() {
        // Calculate stats
        const totalDue = this.db.getTotalDue();
        const thisMonthPaid = this.db.getThisMonthPaid();
        const totalCustomers = this.db.getAllCustomers().length;
        const thisMonthNew = this.db.getThisMonthNewCustomers();

        document.getElementById('total-due').textContent = this.formatCurrency(totalDue);
        document.getElementById('this-month-paid').textContent = this.formatCurrency(thisMonthPaid);
        document.getElementById('total-customers').textContent = totalCustomers;
        document.getElementById('this-month-new').textContent = thisMonthNew;

        // Recent transactions
        const recentTrans = this.db.getRecentTransactions(5);
        const recentContainer = document.getElementById('recent-transactions');
        
        if (recentTrans.length === 0) {
            recentContainer.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">কোন হিসাব নেই</p>';
        } else {
            recentContainer.innerHTML = recentTrans.map(trans => {
                const customer = this.db.getCustomer(trans.customerId);
                const type = trans.type === 'due' ? '+ বাকি' : '- জমা';
                const typeClass = trans.type === 'due' ? 'text-red-600' : 'text-green-600';
                return `
                    <div class="flex justify-between items-center text-sm py-1 border-b pb-1">
                        <div>
                            <p class="font-medium">${customer.name}</p>
                            <p class="text-xs text-gray-500">${this.formatDate(trans.date)}</p>
                        </div>
                        <p class="font-semibold ${typeClass}">${type} ${this.formatCurrency(trans.amount)}</p>
                    </div>
                `;
            }).join('');
        }
    }

    // Customer List Updates
    updateCustomerList() {
        const customers = this.db.getAllCustomers();
        const listContainer = document.getElementById('customer-list');

        if (customers.length === 0) {
            listContainer.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">গ্রাহক ���েই</p>';
        } else {
            listContainer.innerHTML = customers.map(customer => {
                const balance = this.db.getCustomerBalance(customer.id);
                const lastTrans = this.db.getCustomerTransactions(customer.id)[0];
                const lastDate = lastTrans ? this.formatDate(lastTrans.date) : '-';
                const balanceClass = balance > 0 ? 'text-red-600' : 'text-gray-600';

                return `
                    <div class="bg-white rounded-lg p-3 border border-gray-100 cursor-pointer hover:border-gray-300 transition" onclick="app.showCustomerDetails('${customer.id}')">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <p class="font-semibold">${customer.name}</p>
                                <p class="text-xs text-gray-600">${customer.phone}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold ${balanceClass}">${this.formatCurrency(balance)}</p>
                                <p class="text-xs text-gray-500">${lastDate}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    filterCustomers(query) {
        const customers = this.db.getAllCustomers();
        const filtered = customers.filter(c => 
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.phone.includes(query)
        );

        const listContainer = document.getElementById('customer-list');
        if (filtered.length === 0) {
            listContainer.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">গ্রাহক পাওয়া যায়নি</p>';
        } else {
            listContainer.innerHTML = filtered.map(customer => {
                const balance = this.db.getCustomerBalance(customer.id);
                const lastTrans = this.db.getCustomerTransactions(customer.id)[0];
                const lastDate = lastTrans ? this.formatDate(lastTrans.date) : '-';
                const balanceClass = balance > 0 ? 'text-red-600' : 'text-gray-600';

                return `
                    <div class="bg-white rounded-lg p-3 border border-gray-100 cursor-pointer hover:border-gray-300 transition" onclick="app.showCustomerDetails('${customer.id}')">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <p class="font-semibold">${customer.name}</p>
                                <p class="text-xs text-gray-600">${customer.phone}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold ${balanceClass}">${this.formatCurrency(balance)}</p>
                                <p class="text-xs text-gray-500">${lastDate}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Customer Details Updates
    updateCustomerDetails(customerId) {
        const customer = this.db.getCustomer(customerId);
        const balance = this.db.getCustomerBalance(customerId);
        const transactions = this.db.getCustomerTransactions(customerId);

        document.getElementById('customer-name').textContent = customer.name;
        document.getElementById('customer-phone').textContent = customer.phone || '-';
        document.getElementById('customer-due').textContent = this.formatCurrency(Math.abs(balance));

        const lastTrans = transactions[0];
        document.getElementById('customer-last-transaction').textContent = lastTrans ? this.formatDate(lastTrans.date) : '-';

        // Transaction history
        const historyContainer = document.getElementById('transaction-history');
        if (transactions.length === 0) {
            historyContainer.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">কোন লেনদেন নেই</p>';
        } else {
            historyContainer.innerHTML = transactions.map(trans => {
                const type = trans.type === 'due' ? 'বাকি' : 'জমা';
                const typeClass = trans.type === 'due' ? 'text-red-600' : 'text-green-600';
                return `
                    <div class="grid grid-cols-3 gap-2 text-xs py-1 border-b pb-1 hover:bg-gray-50 px-1 rounded">
                        <div>${this.formatDate(trans.date)}</div>
                        <div class="text-right">${type}</div>
                        <div class="text-right font-semibold ${typeClass}">${this.formatCurrency(trans.amount)}</div>
                    </div>
                `;
            }).join('');
        }
    }

    // Modal Management
    closeAllModals() {
        document.querySelectorAll('.fixed[id$="-modal"]').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    showAddCustomerModal() {
        this.closeAllModals();
        document.getElementById('add-customer-modal').classList.remove('hidden');
        document.getElementById('new-customer-name').focus();
    }

    saveNewCustomer() {
        const name = document.getElementById('new-customer-name').value.trim();
        const phone = document.getElementById('new-customer-phone').value.trim();
        const address = document.getElementById('new-customer-address').value.trim();

        if (!name) {
            alert('দয়া করে গ্রাহকের নাম প্রবেশ করুন');
            return;
        }

        this.db.addCustomer(name, phone, address);
        this.closeAllModals();
        document.getElementById('new-customer-name').value = '';
        document.getElementById('new-customer-phone').value = '';
        document.getElementById('new-customer-address').value = '';
        
        this.updateCustomerList();
        this.updateDashboard();
    }

    showAddDueModal() {
        this.closeAllModals();
        document.getElementById('due-amount').value = '';
        document.getElementById('due-note').value = '';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('due-date').value = today;
        document.getElementById('add-due-modal').classList.remove('hidden');
        document.getElementById('due-amount').focus();
    }

    saveDue() {
        const amount = document.getElementById('due-amount').value;
        const note = document.getElementById('due-note').value.trim();
        const date = document.getElementById('due-date').value;

        if (!amount || amount <= 0) {
            alert('দয়া করে সঠিক পরিমাণ প্রবেশ করুন');
            return;
        }

        this.db.addTransaction(this.currentCustomerId, 'due', amount, note, date);
        this.closeAllModals();
        this.updateCustomerDetails(this.currentCustomerId);
        this.updateDashboard();
    }

    showAddCollectionModal() {
        this.closeAllModals();
        document.getElementById('collection-amount').value = '';
        document.getElementById('collection-note').value = '';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('collection-date').value = today;
        document.getElementById('add-collection-modal').classList.remove('hidden');
        document.getElementById('collection-amount').focus();
    }

    saveCollection() {
        const amount = document.getElementById('collection-amount').value;
        const note = document.getElementById('collection-note').value.trim();
        const date = document.getElementById('collection-date').value;

        if (!amount || amount <= 0) {
            alert('দয়া করে সঠিক পরিমাণ প্রবেশ করুন');
            return;
        }

        this.db.addTransaction(this.currentCustomerId, 'collection', amount, note, date);
        this.closeAllModals();
        this.updateCustomerDetails(this.currentCustomerId);
        this.updateDashboard();
    }

    showEditCustomerModal() {
        this.closeAllModals();
        const customer = this.db.getCustomer(this.currentCustomerId);
        document.getElementById('edit-customer-name').value = customer.name;
        document.getElementById('edit-customer-phone').value = customer.phone;
        document.getElementById('edit-customer-address').value = customer.address;
        document.getElementById('edit-customer-modal').classList.remove('hidden');
    }

    saveEditedCustomer() {
        const name = document.getElementById('edit-customer-name').value.trim();
        const phone = document.getElementById('edit-customer-phone').value.trim();
        const address = document.getElementById('edit-customer-address').value.trim();

        if (!name) {
            alert('দয়া করে গ্রাহকের নাম প্রবেশ করুন');
            return;
        }

        this.db.updateCustomer(this.currentCustomerId, name, phone, address);
        this.closeAllModals();
        this.updateCustomerDetails(this.currentCustomerId);
        this.updateCustomerList();
    }

    callCustomer() {
        const customer = this.db.getCustomer(this.currentCustomerId);
        if (customer.phone) {
            window.location.href = `tel:${customer.phone}`;
        } else {
            alert('ফোন নম্বর নেই');
        }
        this.closeAllModals();
    }

    deleteCustomer() {
        const customer = this.db.getCustomer(this.currentCustomerId);
        const balance = this.db.getCustomerBalance(this.currentCustomerId);

        if (balance !== 0) {
            alert('কেবলমাত্র শূন্য পাওনা সহ গ্রাহক মুছতে পারেন।');
            return;
        }

        if (confirm(`${customer.name} মুছতে নিশ্চিত?`)) {
            this.db.deleteCustomer(this.currentCustomerId);
            this.closeAllModals();
            this.showCustomerList();
            this.updateDashboard();
        }
    }

    showCustomerMenu() {
        this.closeAllModals();
        document.getElementById('customer-menu-modal').classList.remove('hidden');
    }

    showMenuModal() {
        this.closeAllModals();
        document.getElementById('menu-modal').classList.remove('hidden');
    }

    // Settings
    updateShopInfoUI() {
        const shop = this.db.getShopInfo();
        document.getElementById('shop-name').value = shop.name;
        document.getElementById('shop-phone').value = shop.phone;
        document.getElementById('shop-address').value = shop.address;
    }

    updateShopInfo() {
        this.updateShopInfoUI();
    }

    saveShopInfo() {
        const name = document.getElementById('shop-name').value.trim();
        const phone = document.getElementById('shop-phone').value.trim();
        const address = document.getElementById('shop-address').value.trim();

        this.db.setShopInfo(name, phone, address);
        alert('দোকানের তথ্য সংরক্ষিত হয়েছে');
    }

    // PDF Generation
    generatePDF() {
        const customer = this.db.getCustomer(this.currentCustomerId);
        const transactions = this.db.getCustomerTransactions(this.currentCustomerId);
        const shop = this.db.getShopInfo();

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .shop-info { margin-bottom: 20px; }
                    .customer-info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f3f4f6; }
                    .summary { margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>বাকি খাতা রিপোর্ট</h1>
                </div>

                <div class="shop-info">
                    <h3>দোকানের তথ্য</h3>
                    <p><strong>নাম:</strong> ${shop.name || '-'}</p>
                    <p><strong>ফোন:</strong> ${shop.phone || '-'}</p>
                    <p><strong>ঠিকানা:</strong> ${shop.address || '-'}</p>
                </div>

                <div class="customer-info">
                    <h3>গ্রাহক তথ্য</h3>
                    <p><strong>নাম:</strong> ${customer.name}</p>
                    <p><strong>ফোন:</strong> ${customer.phone || '-'}</p>
                    <p><strong>ঠিকানা:</strong> ${customer.address || '-'}</p>
                </div>

                <h3>লেনদেন</h3>
                <table>
                    <tr>
                        <th>তারিখ</th>
                        <th>বিবরণ</th>
                        <th>পরিমাণ</th>
                    </tr>
        `;

        transactions.forEach(trans => {
            const type = trans.type === 'due' ? 'বাকি' : 'জমা';
            html += `
                <tr>
                    <td>${this.formatDate(trans.date)}</td>
                    <td>${type}</td>
                    <td>${this.formatCurrency(trans.amount)}</td>
                </tr>
            `;
        });

        const balance = this.db.getCustomerBalance(this.currentCustomerId);
        html += `
                </table>

                <div class="summary">
                    <h3>সারসংক্ষেপ</h3>
                    <p><strong>মোট পাওনা:</strong> ${this.formatCurrency(Math.abs(balance))}</p>
                    <p><strong>রিপোর্ট তৈরি:</strong> ${new Date().toLocaleDateString('bn-BD')}</p>
                </div>
            </body>
            </html>
        `;

        const opt = {
            margin: 10,
            filename: `${customer.name}_report.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        html2pdf().set(opt).from(html).save();
    }

    // Utilities
    formatCurrency(amount) {
        const formatted = new Intl.NumberFormat('bn-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
        return formatted;
    }

    formatDate(date) {
        return new Date(date + 'T00:00:00').toLocaleDateString('bn-BD');
    }

    // Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});