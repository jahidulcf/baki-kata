# বাকি খাতা - Quick Setup Guide

দ্রুত সেটআপ এবং স্থাপনা নির্দেশিকা

## 🚀 5-Minute Setup

### Option 1: Test Locally (Easy)

#### Windows
```batch
# Open Command Prompt in the folder with the files
python -m http.server 8000
```

Then open browser and go to: `http://localhost:8000`

#### Mac/Linux
```bash
cd path/to/baki-khata
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

### Option 2: Deploy to Free Hosting

#### Using Vercel (Recommended - Super Easy)

1. Go to https://vercel.com
2. Click "Create Git Repository" or "Deploy"
3. Upload your files (or connect GitHub)
4. Click Deploy
5. Get a live URL instantly

#### Using Netlify

1. Go to https://netlify.com
2. Drag and drop your folder
3. Done! Get live URL

#### Using GitHub Pages

1. Create GitHub account
2. Create new repository: `username.github.io`
3. Upload these 4 files:
   - `index.html`
   - `app.js`
   - `sw.js`
   - `manifest.json`
4. Access at: `https://username.github.io`

### Option 3: Your Own Web Server

1. Login to your hosting (cPanel, etc.)
2. Upload files to public folder:
   - `index.html`
   - `app.js`
   - `sw.js`
   - `manifest.json`
3. Make sure site uses HTTPS
4. Access at: `https://yourdomain.com`

## 🔧 Important Settings

### HTTPS is Required
- PWA needs HTTPS to work properly
- Free hosting sites (Vercel, Netlify) provide HTTPS automatically
- If using your own server, get free SSL certificate from Let's Encrypt

### File Uploads Required
Make sure ALL these files are uploaded:
- ✅ `index.html` (main file)
- ✅ `app.js` (logic)
- ✅ `sw.js` (offline support)
- ✅ `manifest.json` (PWA config)

Missing any file = app won't work!

## 📱 Install on Phone

### Android
1. Open app in Chrome browser
2. Tap menu (3 dots)
3. Tap "Install app" or "Add to Home screen"
4. App will appear on home screen

### iPhone/iPad
1. Open app in Safari
2. Tap Share button (arrow up)
3. Tap "Add to Home Screen"
4. Name it "বাকি খাতা"
5. App will appear on home screen

## ✅ Testing Checklist

After deployment, test:

- [ ] App loads without errors
- [ ] Can add new customer
- [ ] Can add transaction
- [ ] Customer list shows correctly
- [ ] Dashboard stats update
- [ ] Search works
- [ ] Settings saves data
- [ ] PDF reports generate
- [ ] Can install as app (Android)
- [ ] Can install as app (iOS)
- [ ] Works offline (turn off WiFi and internet)

## 🐛 Troubleshooting

### "App not loading"
- Check all 4 files uploaded
- Clear browser cache
- Try different browser
- Check for HTTPS

### "PWA not installing"
- Must use HTTPS
- Try Chrome first
- Check manifest.json is uploaded
- Clear browser cache

### "Offline not working"
- Service worker needs time to cache
- Reload page 2-3 times
- Check browser supports Service Worker
- Check HTTPS is enabled

### "Data not saving"
- Check browser allows localStorage
- Try different browser
- Check phone storage isn't full
- Clear browser cache

## 📝 Customization Tips

### Change App Name
In `manifest.json`, change:
```json
"name": "আপনার পছন্দের নাম"
```

### Change Colors
In `index.html`, find and replace:
- `bg-gray-900` with any Tailwind color
- Example: `bg-blue-900`, `bg-green-900`

### Add Your Logo
In `index.html`, find:
```html
<link rel="icon" type="image/png" href="...">
```
And replace with your image URL.

## 🌐 Domain Setup (Optional)

### Get Custom Domain
1. Buy domain from: GoDaddy, Namecheap, etc.
2. Point to your hosting provider
3. Set up SSL certificate
4. Now works with `https://yourdomain.com`

## 📊 User Tips

### First Time Users
1. Go to Settings
2. Add shop information
3. Add first customer
4. Add a transaction
5. Check Dashboard

### Regular Backup
1. Every week, go to Settings
2. Tap "এক্সপোর্ট ডাটা"
3. Save file to cloud (Google Drive, Dropbox, etc.)
4. Keep safe!

### Multiple Devices
Currently data only syncs within one device. If you need multiple devices:
- Export from Device 1
- Import to Device 2
- Or set up backend database (advanced)

## 🔐 Security Best Practices

1. **Regular Backups** - Export weekly
2. **Safe Storage** - Save backups in cloud
3. **Don't Share** - Don't give others access unless trusted
4. **Device Security** - Lock your phone
5. **Clear Cache** - Sometimes clear old data

## 💡 Pro Tips

- Add notes for special transactions
- Use phone numbers to search quickly
- Generate reports at month-end
- Back up before deleting customers
- Check dashboard daily to monitor
- Use for multiple shops by clearing data

## 🆘 Getting Help

If stuck:
1. Check README.md
2. Review app features
3. Test with sample data first
4. Try different browser
5. Clear cache and restart app

## 📞 Contact & Feedback

This app was built with care for small Bengali shop owners. If you have feedback or suggestions, the code is simple and ready to be modified.

---

**Ready to start? Pick one deployment option and follow the steps above!**

Happy ledger keeping! 📊✨

**বাকি খাতা - একটি সুন্দর ডিজিটাল ক্রেডিট লেজার**
