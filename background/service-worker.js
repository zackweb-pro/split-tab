// Background service worker for Split Tab extension
class SplitTabManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupContextMenus();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        // Handle messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Handle extension installation
        chrome.runtime.onInstalled.addListener(() => {
            this.onInstalled();
        });

        // Handle tab updates for smart suggestions
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.onTabUpdated(tabId, tab);
            }
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'splitTabs':
                    await this.splitTabs(request);
                    sendResponse({ success: true });
                    break;
                
                case 'getCurrentTab':
                    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    sendResponse({ tab: currentTab });
                    break;
                
                case 'getTabSuggestions':
                    const suggestions = await this.getTabSuggestions(request.currentUrl);
                    sendResponse({ suggestions });
                    break;
                
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    async splitTabs(request) {
        const { currentTabId, newTabUrls, splitCount, mode } = request;
        
        try {
            // Get current tab info
            const currentTab = await chrome.tabs.get(currentTabId);
            const currentWindow = await chrome.windows.get(currentTab.windowId);
            
            // Create new tabs
            const createdTabs = [];
            
            for (let i = 0; i < newTabUrls.length; i++) {
                const newTab = await chrome.tabs.create({
                    url: newTabUrls[i],
                    windowId: currentTab.windowId,
                    index: currentTab.index + i + 1,
                    active: false
                });
                createdTabs.push(newTab);
            }
            
            // Organize tabs based on split type
            await this.organizeTabs(currentTab, createdTabs, splitCount, mode);
            
            // Save split session for later reference
            await this.saveSplitSession({
                originalTab: currentTab,
                createdTabs: createdTabs,
                splitCount: splitCount,
                mode: mode,
                timestamp: Date.now()
            });
            
            console.log(`Successfully split into ${splitCount} tabs`);
            
        } catch (error) {
            console.error('Error splitting tabs:', error);
            throw error;
        }
    }

    async organizeTabs(originalTab, newTabs, splitCount, mode) {
        try {
            // Group tabs together for better organization
            if (chrome.tabs.group) {
                const tabIds = [originalTab.id, ...newTabs.map(tab => tab.id)];
                const groupId = await chrome.tabs.group({ tabIds });
                
                // Set group title and color based on mode
                const groupConfig = this.getGroupConfig(mode, splitCount);
                await chrome.tabGroups.update(groupId, groupConfig);
            }
            
            // Pin important tabs if needed
            if (mode === 'work') {
                // Pin work-related tabs
                for (const tab of newTabs) {
                    if (tab.url.includes('gmail.com') || tab.url.includes('calendar.google.com')) {
                        await chrome.tabs.update(tab.id, { pinned: true });
                    }
                }
            }
            
        } catch (error) {
            console.error('Error organizing tabs:', error);
            // Continue even if organization fails
        }
    }

    getGroupConfig(mode, splitCount) {
        const configs = {
            research: { title: '🔍 Research Session', color: 'blue' },
            shopping: { title: '🛒 Shopping Session', color: 'green' },
            work: { title: '💼 Work Session', color: 'orange' },
            social: { title: '📱 Social Session', color: 'pink' },
            default: { title: `⚡ Split Session (${splitCount})`, color: 'grey' }
        };
        
        return configs[mode] || configs.default;
    }

    async saveSplitSession(session) {
        try {
            const result = await chrome.storage.local.get(['splitSessions']);
            const sessions = result.splitSessions || [];
            
            // Keep only last 10 sessions
            sessions.push(session);
            if (sessions.length > 10) {
                sessions.shift();
            }
            
            await chrome.storage.local.set({ splitSessions: sessions });
        } catch (error) {
            console.error('Error saving split session:', error);
        }
    }

    setupContextMenus() {
        chrome.contextMenus.create({
            id: 'split-tab-main',
            title: 'Split Tab',
            contexts: ['page', 'tab']
        });

        chrome.contextMenus.create({
            id: 'split-2',
            parentId: 'split-tab-main',
            title: 'Split into 2 tabs',
            contexts: ['page', 'tab']
        });

        chrome.contextMenus.create({
            id: 'split-3',
            parentId: 'split-tab-main',
            title: 'Split into 3 tabs',
            contexts: ['page', 'tab']
        });

        chrome.contextMenus.create({
            id: 'split-4',
            parentId: 'split-tab-main',
            title: 'Split into 4 tabs',
            contexts: ['page', 'tab']
        });

        chrome.contextMenus.create({
            id: 'separator',
            parentId: 'split-tab-main',
            type: 'separator',
            contexts: ['page', 'tab']
        });

        chrome.contextMenus.create({
            id: 'quick-research',
            parentId: 'split-tab-main',
            title: '🔍 Research Mode',
            contexts: ['page', 'tab']
        });

        chrome.contextMenus.create({
            id: 'quick-work',
            parentId: 'split-tab-main',
            title: '💼 Work Mode',
            contexts: ['page', 'tab']
        });

        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    async handleContextMenuClick(info, tab) {
        try {
            if (info.menuItemId.startsWith('split-')) {
                const splitCount = parseInt(info.menuItemId.split('-')[1]);
                await this.quickSplit(tab, splitCount);
            } else if (info.menuItemId.startsWith('quick-')) {
                const mode = info.menuItemId.split('-')[1];
                await this.executeQuickMode(tab, mode);
            }
        } catch (error) {
            console.error('Error handling context menu click:', error);
        }
    }

    async quickSplit(tab, splitCount) {
        const defaultUrls = [
            'chrome://newtab/',
            'https://www.google.com/search?q=' + encodeURIComponent(tab.title),
            'chrome://newtab/'
        ];
        
        const urlsToCreate = defaultUrls.slice(0, splitCount - 1);
        
        await this.splitTabs({
            currentTabId: tab.id,
            newTabUrls: urlsToCreate,
            splitCount: splitCount
        });
    }

    async executeQuickMode(tab, mode) {
        const quickModes = {
            research: [
                'https://www.google.com/search?q=' + encodeURIComponent(tab.title),
                'https://scholar.google.com',
                'chrome://newtab/'
            ],
            work: [
                'https://mail.google.com',
                'https://calendar.google.com',
                'https://drive.google.com'
            ]
        };
        
        const urls = quickModes[mode] || [];
        
        await this.splitTabs({
            currentTabId: tab.id,
            newTabUrls: urls,
            splitCount: urls.length + 1,
            mode: mode
        });
    }

    setupKeyboardShortcuts() {
        chrome.commands.onCommand.addListener(async (command) => {
            try {
                const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                if (command === 'split-2-tabs') {
                    await this.quickSplit(currentTab, 2);
                } else if (command === 'split-3-tabs') {
                    await this.quickSplit(currentTab, 3);
                } else if (command === 'split-4-tabs') {
                    await this.quickSplit(currentTab, 4);
                }
            } catch (error) {
                console.error('Error handling keyboard shortcut:', error);
            }
        });
    }

    onInstalled() {
        console.log('Split Tab extension installed');
        
        // Set default preferences
        chrome.storage.sync.set({
            splitTabPreferences: {
                defaultSplit: 2,
                autoGroup: true,
                favoriteUrls: [
                    'https://mail.google.com',
                    'https://calendar.google.com',
                    'https://drive.google.com'
                ]
            }
        });
    }

    onTabUpdated(tabId, tab) {
        // Could be used for smart suggestions based on current page content
        // For now, just log for debugging
        if (tab.url && !tab.url.startsWith('chrome://')) {
            console.log('Tab updated:', tab.url);
        }
    }

    async getTabSuggestions(currentUrl) {
        // Smart suggestions based on current page
        try {
            const domain = new URL(currentUrl).hostname;
            const suggestions = [];
            
            // Add relevant suggestions based on current domain
            if (domain.includes('wikipedia')) {
                suggestions.push(
                    { title: 'Google Search', url: 'https://www.google.com' },
                    { title: 'Scholar', url: 'https://scholar.google.com' }
                );
            } else if (domain.includes('github')) {
                suggestions.push(
                    { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
                    { title: 'Documentation', url: 'https://developer.mozilla.org' }
                );
            }
            
            return suggestions;
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    }
}

// Initialize the background script
new SplitTabManager();
