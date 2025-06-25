# 🚀 Split Tab - Installation & Testing Guide

## 📦 Installation Instructions

### **Method 1: Load as Unpacked Extension (For Development)**

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click Chrome menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the `split-tab` folder: `c:\Users\zackweb\Desktop\split-tab`
   - Select the folder and click "Select Folder"

4. **Verify Installation**
   - You should see "Split Tab" extension in the list
   - The extension icon (⚡) should appear in the Chrome toolbar

## 🧪 Testing the Extension

### **Basic Functionality Tests**

#### **1. Test Popup Interface**
- Click the Split Tab icon in the toolbar
- Verify the popup opens with split options
- Try clicking different split options (2, 3, 4 tabs)
- Test the quick workflow modes (Research, Shopping, Work, Social)

#### **2. Test Tab Splitting**
- Navigate to any website (e.g., Wikipedia article)
- Click the extension icon
- Choose "Split into 2 tabs"
- Configure the new tab content in the modal
- Click "Split Tabs"
- Verify that new tabs are created as expected

#### **3. Test Context Menu**
- Right-click on any tab
- Look for "Split Tab" in the context menu
- Test the submenu options

#### **4. Test Keyboard Shortcuts**
- Navigate to any website
- Try these keyboard shortcuts:
  - `Ctrl+Shift+2` - Split into 2 tabs
  - `Ctrl+Shift+3` - Split into 3 tabs
  - `Ctrl+Shift+4` - Split into 4 tabs

#### **5. Test Quick Workflow Modes**
- Open any webpage
- Click extension icon
- Try each quick mode:
  - 🔍 Research Mode
  - 🛒 Shopping Mode
  - 💼 Work Mode
  - 📱 Social Mode

### **Settings Page Tests**

#### **6. Access Settings**
- Right-click the extension icon
- Click "Options" to open settings page
- Or go to `chrome://extensions/` → Split Tab → Details → Extension options

#### **7. Test Settings Configuration**
- Modify default split count
- Toggle various options
- Add favorite URLs
- Save settings and verify they persist

### **Advanced Features Tests**

#### **8. Test Tab Grouping (Chrome 88+)**
- Split tabs and verify they get grouped together
- Check group naming and coloring

#### **9. Test Smart Suggestions**
- Visit different types of websites:
  - GitHub repository
  - Wikipedia article
  - Shopping site
- Split tabs and observe if suggestions are contextually relevant

## 🐛 Common Issues & Troubleshooting

### **Extension Not Loading**
- Ensure all files are in the correct directory structure
- Check the browser console for errors (`F12` → Console)
- Verify manifest.json is valid JSON

### **Icons Not Displaying**
- Make sure PNG icons exist in `assets/icons/`
- Check if SVG icons need to be converted to PNG
- Use the `convert-icons.html` file to generate PNG versions

### **Permissions Issues**
- Extension needs tabs, contextMenus, and storage permissions
- Check if any permission dialogs were blocked

### **Tab Creation Fails**
- Some URLs might be restricted (chrome:// pages)
- Check if popup blockers are interfering
- Verify the current tab is not a special Chrome page

## 📋 Feature Checklist

### **Core Features** ✅
- [x] Extension popup interface
- [x] 2, 3, 4 tab splitting options
- [x] Tab configuration modal
- [x] Basic tab creation and management
- [x] Context menu integration
- [x] Keyboard shortcuts

### **Smart Features** ✅
- [x] Quick workflow modes
- [x] Smart URL suggestions
- [x] Tab grouping and organization
- [x] Settings page with customization
- [x] Usage statistics tracking

### **Advanced Features** ✅
- [x] Content script integration
- [x] Storage management
- [x] Export/import settings
- [x] Favorite URLs management
- [x] Performance optimizations

## 🔧 Development Commands

### **Testing in Development**
```bash
# Navigate to project directory
cd "c:\Users\zackweb\Desktop\split-tab"

# Open Chrome with extension loaded
chrome.exe --load-extension="c:\Users\zackweb\Desktop\split-tab"
```

### **Debugging**
- Open Chrome DevTools (`F12`)
- Check Console for any JavaScript errors
- Use `chrome://extensions/` → Split Tab → Inspect views → service worker (for background script)
- Use `chrome://extensions/` → Split Tab → Inspect views → popup.html (for popup script)

## 📊 Performance Testing

### **Memory Usage**
- Monitor extension memory usage in Chrome Task Manager
- Check for memory leaks with prolonged use

### **Speed Testing**
- Measure time from click to tab creation
- Test with different numbers of tabs
- Verify responsiveness with many tabs open

## 🚢 Preparing for Production

### **Before Publishing**
1. Test on different Chrome versions
2. Test on different operating systems
3. Verify all icons and assets are optimized
4. Review and clean up console.log statements
5. Test with various websites and edge cases
6. Ensure privacy policy compliance
7. Update version number in manifest.json

### **Chrome Web Store Preparation**
1. Create high-quality screenshots
2. Write compelling store description
3. Prepare promotional graphics
4. Set up developer account
5. Package extension as .zip file

## 📞 Support & Feedback

If you encounter any issues during testing:
1. Check the browser console for error messages
2. Verify file permissions and directory structure
3. Test in Chrome Incognito mode to rule out conflicts
4. Try disabling other extensions temporarily

---

**Happy Testing! 🎉**

The Split Tab extension is now ready for comprehensive testing. Follow this guide to ensure all features work correctly before any potential publication to the Chrome Web Store.
