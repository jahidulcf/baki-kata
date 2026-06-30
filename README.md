# বাকি খাতা - Digital Credit Ledger

একটি সুন্দর ডিজিটাল বাকি খাতা | A Beautiful Digital Credit Ledger for Bengali Shop Owners

## 📱 About

**বাকি খাতা** is a mobile-first Progressive Web App (PWA) designed to help small Bengali shop owners easily manage customer credit and track outstanding payments. It replicates the simplicity of traditional paper ledgers with modern digital conveniences.

### Key Features

- ✅ **100% Bangla Interface** - সম্পূর্ণ বাংলায় ইউজার ইন্টারফেস
- ✅ **Offline First** - অফলাইনেও সম্পূর্ণভাবে কাজ করে
- ✅ **Mobile Optimized** - স্মার্টফোনের জন্য নিখুঁত ডিজাইন
- ✅ **No Login Required** - কোনো লগইন বা রেজিস্ট্রেশন নেই
- ✅ **Local Data Storage** - সমস্ত ডাটা আপনার ফোনে সংরক্ষিত
- ✅ **PDF Reports** - গ্রাহক রিপোর্ট পিডিএফ তৈরি করুন
- ✅ **Installable** - হোম স্ক্রিনে ইনস্টল করে ব্যবহার করুন

## 🚀 Getting Started

### Installation

1. **Local Development**
   ```bash
   # Serve files using any local server
   python -m http.server 8000
   # or
   npx http-server
   # or
   php -S localhost:8000
   ```

2. **Deploy to Web**
   - Upload all files to your web server:
     - `index.html`
     - `app.js`
     - `sw.js`
     - `manifest.json`
   - Make sure server uses HTTPS (required for PWA)
   - Access via mobile browser

3. **Install as App**
   - Open in mobile browser
   - Tap "Add to Home Screen" (varies by browser)
   - App will install like native app

## 📋 Features Explained

### Dashboard (ড্যাশবোর্ড)
- **মোট পাওনা** - Total outstanding balance across all customers
- **এই মাসে আদায়** - Payments collected this month
- **মোট গ্রাহক** - Total number of customers
- **সক্রিয় হিসাব** - Number of customers with outstanding balance
- Recent transactions feed

### Customer List (গ্রাহক তালিকা)
- View all customers
- Search by name or phone number
- Click customer to view details
- See outstanding balance for each customer
- Last transaction date

### Customer Details (গ্রাহকের বিবরণ)
- Full customer information
- Complete transaction history
- Running balance after each transaction
- Add new transaction
- Call customer
- Generate and share PDF report
- Delete customer (only if balance is zero)

### Add Transaction (নতুন হিসাব)
Two types:
1. **ক্রেডিট বিক্রয়** (Credit Sale) - Increases customer due
2. **অর্থ আদায়** (Payment Collection) - Decreases customer due

Fields:
- Transaction type
- Amount in Taka (৳)
- Date (auto-filled with today)
- Optional note

### PDF Report
Generate beautiful Bangla reports containing:
- Shop information
- Customer details
- Transaction history with dates and amounts
- Final outstanding balance
- Report generation date

### Settings (সেটিংস)
- **দোকানের তথ্য** - Store shop name, phone, address
- **ডাটা ম্যানেজমেন্ট**
  - Export data as JSON backup
  - Import previous backups
  - Clear all data (with confirmation)
- **About** - App information

## 💾 Data Storage

### Local Storage
- All data stored in browser's localStorage
- No cloud sync
- Data persists when app closes
- Data cleared only if you clear browser data or app data

### Data Structure

**Customer:**
```json
{
  "id": "unique-id",
  "name": "গ্রাহকের নাম",
  "phone": "০১৭X XXXX XXXX",
  "address": "ঠিকানা",
  "createdAt": "ISO-date"
}
```

**Transaction:**
```json
{
  "id": "unique-id",
  "customerId": "customer-id",
  "type": "sale" | "payment",
  "amount": 1000,
  "date": "YYYY-MM-DD",
  "note": "optional note"
}
```

**Shop:**
```json
{
  "name": "দোকানের নাম",
  "phone": "ফোন নম্বর",
  "address": "ঠিকানা"
}
```

## 🔄 Backup & Restore

### Export Data
1. Go to Settings
2. Tap "📥 ডাটা এক্সপোর্ট করুন"
3. JSON file downloads
4. Save safely (Google Drive, email, etc.)

### Import Data
1. Go to Settings
2. Tap "📤 ডাটা আমদানি করুন"
3. Select previously exported JSON file
4. Data imported instantly

## 🌐 Offline Functionality

- **Fully Offline** - App works completely without internet
- **Service Worker** - Caches app files for instant loading
- **Data Persistence** - All changes saved locally
- **Sync Ready** - Architecture ready for future cloud sync

## 📱 Browser Support

- ✅ Chrome/Chromium (best)
- ✅ Firefox
- ✅ Safari (iOS 14+)
- ✅ Edge
- ✅ All modern mobile browsers

## ⚡ Performance

- **Fast** - Loads in <1 second on 3G
- **Light** - No external dependencies (except CDN)
- **Responsive** - Optimized for all screen sizes
- **Smooth** - 60fps animations

## 🔐 Privacy & Security

- **No Cloud Storage** - Data never leaves your device
- **No Tracking** - No analytics or user tracking
- **No Ads** - Completely ad-free
- **No Login** - No accounts or passwords
- **Open Source Ready** - Code is simple and transparent

## 🛠️ Technical Stack

- **HTML5** - Semantic structure
- **Tailwind CSS** - Utility-first styling (via CDN)
- **Vanilla JavaScript** - No dependencies
- **Lucide Icons** - Beautiful icons (via CDN)
- **Service Worker** - Offline support
- **Local Storage API** - Data persistence
- **PWA** - Installable web app

## 📦 File Structure

```
baki-khata/
├── index.html          # Main HTML file
├── app.js             # Application logic
├── sw.js              # Service worker
├── manifest.json      # PWA manifest
└── README.md          # This file
```

## 🎯 Usage Tips

1. **First Time Setup**
   - Add shop information in Settings
   - Add your first customer
   - Record first transaction

2. **Daily Use**
   - Open app from home screen
   - Click customer name to view details
   - Add new transactions
   - Generate reports when needed

3. **Regular Backups**
   - Export data weekly to safe location
   - Keep multiple backup copies
   - Test restore occasionally

4. **Data Accuracy**
   - Always check amount before saving
   - Review transaction history regularly
   - Use notes for important details

## ⚠️ Important Notes

- **No Automatic Backup** - You must manually export data
- **Single Device** - Data stored only on one phone
- **Clear Data Risk** - Clearing app data will erase everything
- **Balance Calculation** - Customer can only be deleted when balance is zero

## 🔧 Customization

### Change Colors
Edit the Tailwind color classes in `index.html`:
- `bg-gray-900` → Dark elements
- `bg-gray-50` → Light backgrounds
- `text-green-600` → Credit amounts
- `text-blue-600` → Payments

### Change Language
Replace all Bangla text with English or other language in `index.html` and `app.js`.

### Add Features
The code is modular and extensible:
- Storage layer - Easy to add API sync
- UI state management - Ready for more screens
- Data models - Ready for additional fields

## 📞 Support

For issues or feature requests:
1. Check that you're using latest browser
2. Clear cache and reload
3. Try importing a backup
4. Reset app data and start fresh

## 📄 License

This app is provided as-is for personal and business use.

## 🙏 Credits

Built with ❤️ for Bengali shop owners everywhere.

**বাকি খাতা** - Making credit tracking simple, beautiful, and accessible.

---

**Version:** 1.0
**Last Updated:** June 2024
**Language:** Bangla (বাংলা) with English documentation
