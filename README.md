# Split Tab - Chrome Extension

A Chrome extension that allows you to split one browser tab into multiple tabs with different content to enhance multitasking and productivity while browsing.

## 🎯 What We're Going To Build

### **Core Functionality**
- **Split Current Tab**: Transform one active browser tab into 2, 3, or 4 separate tabs
- **Smart Content Selection**: Choose what to display in each new tab:
  - Current page (duplicate for reference)
  - Blank new tab
  - Specific bookmarked sites
  - Search results page
  - Commonly used tools (Gmail, Calendar, Notes, etc.)
- **Automatic Tab Management**: Intelligently organize and position new tabs for optimal workflow

### **Key Features**

#### 1. **Multiple Split Options**
- Split into 2 tabs (side-by-side browsing)
- Split into 3 tabs (main content + 2 reference tabs)
- Split into 4 tabs (quad view for maximum multitasking)

#### 2. **User Interface**
- **Browser Action Button**: Click extension icon for split options
- **Context Menu**: Right-click on any tab for split options
- **Keyboard Shortcuts**: Configurable hotkeys (e.g., `Ctrl+Shift+2/3/4`)
- **Popup Interface**: Choose content for each new tab

#### 3. **Smart Workflows**
- **Research Mode**: Split into main article + search + notes + reference
- **Shopping Mode**: Split into product page + reviews + price comparison + wishlist
- **Work Mode**: Split into current task + email + calendar + documentation
- **Social Mode**: Split into multiple social platforms
- **Custom Mode**: User-defined combinations

### **Technical Architecture**

#### **Project Structure**
```
split-tab/
├── manifest.json              # Extension manifest (v3)
├── popup/
│   ├── popup.html            # Extension popup interface
│   ├── popup.css             # Popup styling
│   └── popup.js              # Popup logic
├── background/
│   └── service-worker.js     # Background script for tab management
├── content/
│   └── content-script.js     # Content script for page interaction
├── assets/
│   ├── icons/               # Extension icons (16x16, 48x48, 128x128)
│   └── images/              # UI images and assets
├── lib/
│   ├── tab-manager.js       # Core tab splitting logic
│   ├── storage-manager.js   # Settings and preferences storage
│   └── utils.js             # Utility functions
└── README.md                # This file
```

#### **Technology Stack**
- **Language**: JavaScript (ES6+)
- **Framework**: Chrome Extension Manifest V3
- **Key APIs Used**:
  - `chrome.tabs.create()`
  - `chrome.tabs.query()`
  - `chrome.tabs.update()`
  - `chrome.contextMenus.create()`
  - `chrome.storage.sync`
  - `chrome.action.onClicked`

### **User Experience Flow**

#### **Example Workflow:**
1. **User is browsing a Wikipedia article**
2. **Clicks extension icon** → "Split into 3 tabs"
3. **Extension shows popup for each new tab:**
   - Tab 1: "Keep current page (Wikipedia article)"
   - Tab 2: "Open Google search" 
   - Tab 3: "Open blank tab for notes"
4. **Result**: 3 tabs created:
   - Tab 1: Original Wikipedia article
   - Tab 2: Google search page ready for related queries
   - Tab 3: Blank tab for taking notes

#### **Configuration Options**
- Default split configurations
- Favorite sites for quick access
- Custom keyboard shortcuts
- Tab positioning preferences
- Auto-pin important tabs

### **Development Status** ✅

#### **Phase 1: Core Functionality** ✅ COMPLETED
- [x] Project setup and extension structure
- [x] Implement basic 2-tab splitting
- [x] Create popup interface
- [x] Add basic tab management

#### **Phase 2: Enhanced Features** ✅ COMPLETED
- [x] 3-tab and 4-tab splitting
- [x] Context menu integration
- [x] Keyboard shortcuts
- [x] Preset site combinations

#### **Phase 3: Advanced Features** ✅ COMPLETED
- [x] Smart workflow modes
- [x] User preferences storage
- [x] Site suggestions based on current page
- [x] Tab grouping and organization
- [x] Content script integration
- [x] Usage statistics tracking

#### **Phase 4: Polish & Release** ✅ COMPLETED
- [x] Comprehensive settings page
- [x] Export/import functionality
- [x] Performance optimization
- [x] User documentation
- [x] Installation guide
- [x] Ready for Chrome Web Store

## 🚀 Getting Started

### **Installation & Development**
```bash
# Navigate to project directory
cd split-tab

# Load extension in Chrome:
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select this folder
# 4. Extension will appear in toolbar
```

### **Usage**
1. Browse to any website
2. Click the Split Tab extension icon in toolbar
3. Choose "Split into 2/3/4 tabs"
4. Select what to open in each new tab
5. Enjoy your multitasking setup!

## 🚀 Installation & Testing

### **Quick Start**
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select this project folder
4. The Split Tab icon (⚡) will appear in your toolbar

### **Full Installation Guide**
See [INSTALLATION.md](INSTALLATION.md) for detailed installation instructions, testing procedures, and troubleshooting tips.

### **Current Project Status** 🎉
✅ **FULLY FUNCTIONAL** - All core and advanced features implemented and ready for use!

## 📋 Planned Features

### **Split Options**
- **2-Tab Split**: Current page + one choice
- **3-Tab Split**: Current page + two choices  
- **4-Tab Split**: Current page + three choices
- **Quick Splits**: Predefined combinations

### **Content Choices**
- Keep current page (duplicate)
- Blank new tab
- Google search
- Popular sites (Gmail, YouTube, Twitter, etc.)
- Bookmarked sites
- Recently visited pages

## ⚙️ Configuration

Users will be able to customize:
- Default split layouts
- Favorite sites list
- Keyboard shortcuts
- Tab positioning
- Auto-grouping behavior

---

## 🎯 **Extension is Ready for Use!**

The Split Tab Chrome extension is now fully developed with all planned features implemented:

### **✅ What's Working:**
- Complete popup interface with modern UI
- 2, 3, and 4-tab splitting functionality
- Smart workflow modes (Research, Shopping, Work, Social)
- Context menu integration
- Keyboard shortcuts (Ctrl+Shift+2/3/4)
- Tab grouping and organization
- Comprehensive settings page
- Usage statistics and analytics
- Export/import functionality
- Content script integration
- Smart URL suggestions
- Favorite URLs management

### **🚀 Ready for:**
- Local development and testing
- Chrome Web Store submission
- Production use

**Installation:** See [INSTALLATION.md](INSTALLATION.md) for step-by-step setup instructions.