// ============================================================================
// বাকি খাতা - App.js
// Digital Credit Ledger for Bengali Shop Owners
// ============================================================================

// ============================================================================
// Data Storage Layer
// ============================================================================
const Storage = {
    prefix: 'baki_khata_',
    
    // Initialize default data
    init() {
        if (!this.getShop()) {
            this.setShop({ name: '', phone: '', address: '' });
        }
        if (!this.getCustomers()) {
            this.setCustomers([]);
        }
        if (!this.getTransactions()) {
            this.setTransactions([]);
        }
    },

    // Shop Information
    getShop() {
        const data = localStorage.getItem(this.prefix + 'shop');
        return data ? JSON.parse(data) : null;
    },

    setShop(data) {
        localStorage.setItem(this.prefix + 'shop', JSON.stringify(data));
    },

    // Customers
    getCustomers() {
        const data = localStorage.getItem(this.prefix + 'customers');
        return data ? JSON.parse(data) : [];
    },

    setCustomers(customers) {
        localStorage.setItem(this.prefix + 'customers', JSON.stringify(customers));
    },

    addCustomer(customer) {
        const customers = this.getCustomers();
        customer.id = Date.now().toString();
        customer.createdAt = new Date().toISOString();
        customers.push(customer);
        this.setCustomers(customers);
        return customer;
    },

    updateCustomer(id, updates) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === id);
        if (index >= 0) {
            customers[index] = { ...customers[index], ...updates };
            this.setCustomers(customers);
        }
    },

    deleteCustomer(id) {
        const customers = this.getCustomers().filter(c => c.id !== id);
        this.setCustomers(customers);
        // Also delete all transactions for this customer
        const transactions = this.getTransactions().filter(t => t.customerId !== id);
        this.setTransactions(transactions);
    },

    getCustomer(id) {
        return this.getCustomers().find(c => c.id === id);
    },

    // Transactions
    getTransactions() {
        const data = localStorage.getItem(this.prefix + 'transactions');
        return data ? JSON.parse(data) : [];
    },

    setTransactions(transactions) {
        localStorage.setItem(this.prefix + 'transactions', JSON.stringify(transactions));
    },

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = Date.now().toString();
        transactions.push(transaction);
        this.setTransactions(transactions);
        return transaction;
    },

    updateTransaction(id, updates) {
        const transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index >= 0) {
            transactions[index] = { ...transactions[index], ...updates };
            this.setTransactions(transactions);
        }
    },

    deleteTransaction(id) {
        const transactions = this.getTransactions().filter(t => t.id !== id);
        this.setTransactions(transactions);
    },

    getCustomerTransactions(customerId) {
        return this.getTransactions()
            .filter(t => t.customerId === customerId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Export all data
    exportData() {
        return {
            shop: this.getShop(),
            customers: this.getCustomers(),
            transactions: this.getTransactions(),
            exportedAt: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        if (data.shop) this.setShop(data.shop);
        if (data.customers) this.setCustomers(data.customers);
        if (data.transactions) this.setTransactions(data.transactions);
    },

    // Clear all data
    clearAll() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
        keys.forEach(k => localStorage.removeItem(k));
        this.init();
    }
};

// ============================================================================
// UI State Management
// ============================================================================
const UIState = {
    currentScreen: 'dashboard',
    currentCustomerId: null,
    currentTransactionType: 'sale',
    editingTransactionId: null,

    switchScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.remove('active');
        });
        // Show new screen
        const screen = document.getElementById(screenName + '-screen');
        if (screen) {
            screen.classList.add('active');
        }
        this.currentScreen = screenName;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-gray-900', 'border-gray-900');
            btn.classList.add('text-gray-500', 'border-transparent');
        });
        
        const navMap = {
            'dashboard': 'nav-dashboard',
            'customer-list': 'nav-customers',
            'report': 'nav-report',
            'settings': 'nav-settings'
        };
        
        if (navMap[screenName]) {
            const btn = document.getElementById(navMap[screenName]);
            if (btn) {
                btn.classList.remove('text-gray-500', 'border-transparent');
                btn.classList.add('text-gray-900', 'border-gray-900');
            }
        }
    }
};

// ============================================================================
// Formatting Utilities
// ============================================================================
const Format = {
    currency(amount) {
        if (amount === null || amount === undefined) return '৳০';
        return '৳' + parseInt(amount || 0).toLocaleString('bn-BD');
    },

    date(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('bn-BD', options);
    },

    dateShort(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    },

    today() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};

// ============================================================================
// Dashboard Screen Logic
// ============================================================================
const Dashboard = {
    render() {
        this.updateStats();
        this.updateRecentTransactions();
    },

    updateStats() {
        const customers = Storage.getCustomers();
        const transactions = Storage.getTransactions();
        
        // Total due
        const totalDue = customers.reduce((sum, c) => {
            const customerTransactions = transactions.filter(t => t.customerId === c.id);
            const balance = customerTransactions.reduce((bal, t) => {
                return bal + (t.type === 'sale' ? t.amount : -t.amount);
            }, 0);
            return sum + balance;
        }, 0);

        // This month collected
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthCollected = transactions
            .filter(t => t.type === 'payment' && new Date(t.date) >= monthStart)
            .reduce((sum, t) => sum + t.amount, 0);

        // Active accounts
        const activeAccounts = customers.filter(c => {
            const customerTransactions = transactions.filter(t => t.customerId === c.id);
            const balance = customerTransactions.reduce((bal, t) => {
                return bal + (t.type === 'sale' ? t.amount : -t.amount);
            }, 0);
            return balance > 0;
        }).length;

        document.getElementById('total-due').textContent = Format.currency(totalDue);
        document.getElementById('month-collected').textContent = Format.currency(monthCollected);
        document.getElementById('total-customers').textContent = customers.length;
        document.getElementById('active-accounts').textContent = activeAccounts;
    },

    updateRecentTransactions() {
        const transactions = Storage.getTransactions()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const container = document.getElementById('recent-transactions');
        
        if (transactions.length === 0) {
            container.innerHTML = '<div class="text-sm text-gray-500 text-center py-8">কোনো লেনদেন নেই</div>';
            return;
        }

        container.innerHTML = transactions.map(t => {
            const customer = Storage.getCustomer(t.customerId);
            const isCredit = t.type === 'sale';
            const symbol = isCredit ? '+' : '−';
            const color = isCredit ? 'text-green-600' : 'text-blue-600';
            
            return `
                <div class="bg-white p-3 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-semibold text-sm text-gray-900">${customer?.name || 'অজানা'}</div>
                            <div class="text-xs text-gray-500">${Format.dateShort(t.date)}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-sm ${color}">${symbol}${Format.currency(t.amount).substring(1)}</div>
                            <div class="text-xs text-gray-500">${t.type === 'sale' ? 'ক্রেডিট' : 'আদায়'}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// ============================================================================
// Customer List Screen Logic
// ============================================================================
const CustomerListScreen = {
    allCustomers: [],

    render() {
        this.allCustomers = Storage.getCustomers();
        this.displayCustomers(this.allCustomers);
    },

    displayCustomers(customers) {
        const container = document.getElementById('customer-list');
        const transactions = Storage.getTransactions();

        if (customers.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500 text-sm">কোনো গ্রাহক নেই</div>';
            return;
        }

        container.innerHTML = customers.map(customer => {
            const balance = transactions
                .filter(t => t.customerId === customer.id)
                .reduce((sum, t) => {
                    return sum + (t.type === 'sale' ? t.amount : -t.amount);
                }, 0);

            const lastTransaction = transactions
                .filter(t => t.customerId === customer.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            return `
                <button class="customer-item w-full text-left px-4 py-3 hover:bg-gray-50" data-customer-id="${customer.id}">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="font-semibold text-gray-900">${customer.name}</div>
                            <div class="text-xs text-gray-500">${customer.phone || 'কোনো ফোন নেই'}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-lg ${balance > 0 ? 'text-green-600' : 'text-gray-500'}">${Format.currency(balance)}</div>
                            ${lastTransaction ? `<div class="text-xs text-gray-500">${Format.dateShort(lastTransaction.date)}</div>` : ''}
                        </div>
                    </div>
                </button>
            `;
        }).join('');

        // Add event listeners
        document.querySelectorAll('.customer-item').forEach(btn => {
            btn.addEventListener('click', () => {
                UIState.currentCustomerId = btn.dataset.customerId;
                CustomerDetailsScreen.render();
                UIState.switchScreen('customer-details');
            });
        });
    },

    search(query) {
        const filtered = this.allCustomers.filter(c => 
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.phone && c.phone.includes(query))
        );
        this.displayCustomers(filtered);
    }
};

// ============================================================================
// Customer Details Screen Logic
// ============================================================================
const CustomerDetailsScreen = {
    render() {
        const customer = Storage.getCustomer(UIState.currentCustomerId);
        if (!customer) return;

        const transactions = Storage.getCustomerTransactions(customer.id);
        const balance = transactions.reduce((sum, t) => {
            return sum + (t.type === 'sale' ? t.amount : -t.amount);
        }, 0);

        document.getElementById('customer-name-header').textContent = customer.name;
        document.getElementById('customer-phone-header').textContent = customer.phone || '---';
        document.getElementById('customer-due-header').textContent = Format.currency(balance);

        this.displayTransactions(customer, transactions);
    },

    displayTransactions(customer, transactions) {
        const container = document.getElementById('transaction-history');

        if (transactions.length === 0) {
            container.innerHTML = '<div class="text-sm text-gray-500 text-center py-8">কোনো লেনদেন নেই</div>';
            return;
        }

        let runningBalance = 0;
        const entries = transactions.map(t => {
            const isCredit = t.type === 'sale';
            runningBalance += isCredit ? t.amount : -t.amount;
            
            return {
                ...t,
                runningBalance
            };
        }).reverse();

        container.innerHTML = `
            <div class="text-xs text-gray-500 grid grid-cols-3 gap-2 mb-3 pb-2 border-b border-gray-200">
                <div>তারিখ</div>
                <div>বিবরণ</div>
                <div class="text-right">পরিমাণ</div>
            </div>
        ` + entries.map(t => {
            const isCredit = t.type === 'sale';
            const color = isCredit ? 'text-green-600' : 'text-blue-600';
            const symbol = isCredit ? '+' : '−';
            const desc = isCredit ? 'ক্রেডিট বিক্রয়' : 'অর্থ আদায়';
            
            return `
                <div class="grid grid-cols-3 gap-2 text-xs py-2 border-b border-gray-100">
                    <div class="text-gray-600">${Format.dateShort(t.date)}</div>
                    <div>
                        <div class="font-semibold text-gray-900">${desc}</div>
                        ${t.note ? `<div class="text-gray-500">${t.note}</div>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="font-semibold ${color}">${symbol}${Format.currency(t.amount).substring(1)}</div>
                        <div class="text-gray-500">${Format.currency(t.runningBalance)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// ============================================================================
// Event Listeners
// ============================================================================
function initializeEventListeners() {
    // Navigation
    document.getElementById('nav-dashboard').addEventListener('click', () => {
        UIState.switchScreen('dashboard');
        Dashboard.render();
    });

    document.getElementById('nav-customers').addEventListener('click', () => {
        UIState.switchScreen('customer-list');
        CustomerListScreen.render();
    });

    document.getElementById('nav-settings').addEventListener('click', () => {
        UIState.switchScreen('settings');
        loadSettingsScreen();
    });

    document.getElementById('nav-report').addEventListener('click', () => {
        UIState.switchScreen('report');
        ReportScreen.render();
    });

    // Dashboard
    document.getElementById('add-customer-btn').addEventListener('click', () => {
        resetAddCustomerForm();
        UIState.switchScreen('add-customer');
    });

    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => {
        UIState.switchScreen('dashboard');
        Dashboard.render();
    });

    // Customer List
    document.getElementById('search-input').addEventListener('input', (e) => {
        CustomerListScreen.search(e.target.value);
    });

    document.getElementById('back-to-list-btn').addEventListener('click', () => {
        UIState.switchScreen('customer-list');
        CustomerListScreen.render();
    });

    // Customer Details
    document.getElementById('add-transaction-btn').addEventListener('click', () => {
        resetAddTransactionForm();
        UIState.editingTransactionId = null;
        UIState.currentTransactionType = 'sale';
        selectTransactionType('sale');
        UIState.switchScreen('add-transaction');
    });

    document.getElementById('customer-menu-btn').addEventListener('click', () => {
        document.getElementById('customer-menu-modal').style.display = 'flex';
    });

    // Customer Menu Modal
    document.getElementById('close-menu-btn').addEventListener('click', () => {
        document.getElementById('customer-menu-modal').style.display = 'none';
    });

    document.getElementById('customer-menu-modal').addEventListener('click', (e) => {
        if (e.target.id === 'customer-menu-modal') {
            document.getElementById('customer-menu-modal').style.display = 'none';
        }
    });

    document.getElementById('call-customer-btn').addEventListener('click', () => {
        const customer = Storage.getCustomer(UIState.currentCustomerId);
        if (customer && customer.phone) {
            window.location.href = 'tel:' + customer.phone;
        }
        document.getElementById('customer-menu-modal').style.display = 'none';
    });

    document.getElementById('share-pdf-btn').addEventListener('click', () => {
        generateAndSharePDF();
        document.getElementById('customer-menu-modal').style.display = 'none';
    });

    document.getElementById('delete-customer-btn').addEventListener('click', () => {
        const customer = Storage.getCustomer(UIState.currentCustomerId);
        const transactions = Storage.getCustomerTransactions(customer.id);
        const balance = transactions.reduce((sum, t) => {
            return sum + (t.type === 'sale' ? t.amount : -t.amount);
        }, 0);

        if (balance > 0) {
            alert('এই গ্রাহকের এখনও বাকি আছে। প্রথমে সম্পূর্ণ অর্থ আদায় করুন।');
        } else if (confirm(`${customer.name} কে মুছে ফেলতে কি নিশ্চিত?`)) {
            Storage.deleteCustomer(UIState.currentCustomerId);
            document.getElementById('customer-menu-modal').style.display = 'none';
            UIState.switchScreen('customer-list');
            CustomerListScreen.render();
        }
    });

    // Add Customer
    document.getElementById('cancel-add-customer-btn').addEventListener('click', () => {
        UIState.switchScreen('customer-list');
        CustomerListScreen.render();
    });

    document.getElementById('save-customer-btn').addEventListener('click', saveNewCustomer);

    // Add Transaction
    document.getElementById('cancel-add-transaction-btn').addEventListener('click', () => {
        UIState.switchScreen('customer-details');
        CustomerDetailsScreen.render();
    });

    document.querySelectorAll('.transaction-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectTransactionType(btn.dataset.type);
        });
    });

    document.getElementById('save-transaction-btn').addEventListener('click', saveNewTransaction);

    // Settings
    document.getElementById('back-to-dashboard-from-settings-btn').addEventListener('click', () => {
        UIState.switchScreen('dashboard');
        Dashboard.render();
    });

    document.getElementById('save-shop-info-btn').addEventListener('click', saveShopInfo);

    document.getElementById('export-data-btn').addEventListener('click', exportData);

    document.getElementById('import-data-btn').addEventListener('click', () => {
        document.getElementById('import-file-input').click();
    });

    document.getElementById('import-file-input').addEventListener('change', importData);

    document.getElementById('clear-all-data-btn').addEventListener('click', () => {
        if (confirm('সমস্ত ডাটা মুছে যাবে! কি নিশ্চিত?')) {
            Storage.clearAll();
            alert('সমস্ত ডাটা মুছে ফেলা হয়েছে।');
            location.reload();
        }
    });

    // Report
    document.getElementById('back-to-dashboard-from-report-btn').addEventListener('click', () => {
        UIState.switchScreen('dashboard');
        Dashboard.render();
    });
}

// ============================================================================
// Form Functions
// ============================================================================
function resetAddCustomerForm() {
    document.getElementById('new-customer-name').value = '';
    document.getElementById('new-customer-phone').value = '';
    document.getElementById('new-customer-address').value = '';
}

function saveNewCustomer() {
    const name = document.getElementById('new-customer-name').value.trim();
    const phone = document.getElementById('new-customer-phone').value.trim();
    const address = document.getElementById('new-customer-address').value.trim();

    if (!name) {
        alert('গ্রাহকের নাম প্রয়োজন');
        return;
    }

    Storage.addCustomer({ name, phone, address });
    resetAddCustomerForm();
    UIState.switchScreen('customer-list');
    CustomerListScreen.render();
}

function resetAddTransactionForm() {
    document.getElementById('transaction-amount').value = '';
    document.getElementById('transaction-date').value = Format.today();
    document.getElementById('transaction-note').value = '';
}

function selectTransactionType(type) {
    UIState.currentTransactionType = type;
    const saleBtn = document.getElementById('type-sale-btn');
    const paymentBtn = document.getElementById('type-payment-btn');

    saleBtn.classList.remove('border-gray-900');
    paymentBtn.classList.remove('border-gray-900');
    saleBtn.classList.add('border-gray-300');
    paymentBtn.classList.add('border-gray-300');

    if (type === 'sale') {
        saleBtn.classList.remove('border-gray-300');
        saleBtn.classList.add('border-gray-900');
    } else {
        paymentBtn.classList.remove('border-gray-300');
        paymentBtn.classList.add('border-gray-900');
    }
}

function saveNewTransaction() {
    const amount = parseInt(document.getElementById('transaction-amount').value || 0);
    const date = document.getElementById('transaction-date').value;
    const note = document.getElementById('transaction-note').value.trim();

    if (amount <= 0) {
        alert('পরিমাণ প্রয়োজন');
        return;
    }

    if (!date) {
        alert('তারিখ প্রয়োজন');
        return;
    }

    Storage.addTransaction({
        customerId: UIState.currentCustomerId,
        type: UIState.currentTransactionType,
        amount,
        date,
        note
    });

    resetAddTransactionForm();
    UIState.switchScreen('customer-details');
    CustomerDetailsScreen.render();
}

// ============================================================================
// Settings Functions
// ============================================================================
function loadSettingsScreen() {
    const shop = Storage.getShop();
    document.getElementById('shop-name').value = shop.name || '';
    document.getElementById('shop-phone').value = shop.phone || '';
    document.getElementById('shop-address').value = shop.address || '';
}

function saveShopInfo() {
    const shop = {
        name: document.getElementById('shop-name').value.trim(),
        phone: document.getElementById('shop-phone').value.trim(),
        address: document.getElementById('shop-address').value.trim()
    };
    Storage.setShop(shop);
    alert('দোকানের তথ্য সংরক্ষণ করা হয়েছে।');
}

function exportData() {
    const data = Storage.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `baki-khata-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            Storage.importData(data);
            alert('ডাটা সফলভাবে আমদানি করা হয়েছে।');
            Dashboard.render();
        } catch (err) {
            alert('ফাইল পড়তে ব্যর্থ হয়েছে।');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ============================================================================
// Report Generation
// ============================================================================
const ReportScreen = {
    render() {
        const customers = Storage.getCustomers();
        const transactions = Storage.getTransactions();
        const shop = Storage.getShop();

        const container = document.getElementById('report-content');

        if (!container) {
            console.error('Report content container not found');
            return;
        }

        if (customers.length === 0) {
            container.innerHTML = '<div class="text-sm text-gray-500 text-center py-12">কোনো গ্রাহক নেই</div>';
            return;
        }

        let reportHTML = '';

        customers.forEach(customer => {
            const balance = transactions
                .filter(t => t.customerId === customer.id)
                .reduce((sum, t) => {
                    return sum + (t.type === 'sale' ? t.amount : -t.amount);
                }, 0);

            reportHTML += `
                <div class="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h3 class="font-bold text-gray-900 text-base">${customer.name}</h3>
                            <p class="text-xs text-gray-600 mt-1">${customer.phone || 'ফোন নেই'}</p>
                        </div>
                        <button class="generate-pdf-btn px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold whitespace-nowrap ml-2" data-customer-id="${customer.id}">
                            পিডিএফ
                        </button>
                    </div>
                    <div class="bg-gray-50 rounded p-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">মোট পাওনা:</span>
                            <span class="font-bold text-green-600">${Format.currency(balance)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = reportHTML;

        // Add event listeners
        document.querySelectorAll('.generate-pdf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const customerId = btn.dataset.customerId;
                generatePDFForCustomer(customerId);
            });
        });
    }
};

// ============================================================================
// PDF Generation
// ============================================================================
function generateAndSharePDF() {
    generatePDFForCustomer(UIState.currentCustomerId);
}

function generatePDFForCustomer(customerId) {
    const customer = Storage.getCustomer(customerId);
    const shop = Storage.getShop();
    const transactions = Storage.getCustomerTransactions(customerId);
    const balance = transactions.reduce((sum, t) => {
        return sum + (t.type === 'sale' ? t.amount : -t.amount);
    }, 0);

    // Create PDF content as HTML
    const date = new Date();
    const dateStr = date.toLocaleDateString('bn-BD');

    let htmlContent = `
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                body { padding: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { font-size: 24px; margin-bottom: 5px; }
                .header p { color: #666; font-size: 12px; }
                .section { margin-bottom: 20px; }
                .section-title { font-weight: bold; margin-bottom: 8px; font-size: 12px; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 8px; text-align: left; font-size: 12px; border-bottom: 1px solid #ddd; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .total { background-color: #f9f9f9; font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>বাকি খাতা</h1>
                <p>${shop.name || 'আমাদের দোকান'}</p>
            </div>

            <div class="section">
                <div class="section-title">দোকানের তথ্য</div>
                <table>
                    <tr>
                        <td style="width: 30%;">নাম:</td>
                        <td>${shop.name || '---'}</td>
                    </tr>
                    <tr>
                        <td>ফোন:</td>
                        <td>${shop.phone || '---'}</td>
                    </tr>
                    <tr>
                        <td>ঠিকানা:</td>
                        <td>${shop.address || '---'}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">গ্রাহক তথ্য</div>
                <table>
                    <tr>
                        <td style="width: 30%;">নাম:</td>
                        <td>${customer.name}</td>
                    </tr>
                    <tr>
                        <td>ফোন:</td>
                        <td>${customer.phone || '---'}</td>
                    </tr>
                    <tr>
                        <td>ঠিকানা:</td>
                        <td>${customer.address || '---'}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">লেনদেন ইতিহাস</div>
                <table>
                    <thead>
                        <tr>
                            <th>তারিখ</th>
                            <th>বিবরণ</th>
                            <th style="text-align: right;">পরিমাণ</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    transactions.reverse().forEach(t => {
        const isCredit = t.type === 'sale';
        const desc = isCredit ? 'ক্রেডিট বিক্রয়' : 'অর্থ আদায়';
        htmlContent += `
                        <tr>
                            <td>${Format.dateShort(t.date)}</td>
                            <td>${desc}${t.note ? ` (${t.note})` : ''}</td>
                            <td style="text-align: right;">${isCredit ? '+' : '−'}${t.amount}</td>
                        </tr>
        `;
    });

    htmlContent += `
                    </tbody>
                </table>
            </div>

            <div class="section total">
                <table>
                    <tr>
                        <td style="width: 70%;">মোট বাকি:</td>
                        <td style="text-align: right; font-size: 16px;">৳${balance}</td>
                    </tr>
                </table>
            </div>

            <div class="footer">
                <p>প্রতিবেদন তৈরির তারিখ: ${dateStr}</p>
                <p>বাকি খাতা - ডিজিটাল ক্রেডিট লেজার</p>
            </div>
        </body>
        </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
}

// ============================================================================
// Service Worker Registration
// ============================================================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {
            // Service worker registration failed, app still works offline with cache
        });
    }
}

// ============================================================================
// App Initialization
// ============================================================================
function initializeApp() {
    // Initialize data storage
    Storage.init();

    // Register service worker for PWA
    registerServiceWorker();

    // Set transaction date to today
    document.getElementById('transaction-date').value = Format.today();

    // Initialize event listeners
    initializeEventListeners();

    // Initial render
    Dashboard.render();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
