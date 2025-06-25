// Popup functionality for Split Tab extension
class SplitTabPopup {
    constructor() {
        this.currentTab = null;
        this.selectedSplit = null;
        this.init();
    }

    async init() {
        await this.getCurrentTab();
        this.setupEventListeners();
        this.loadUserPreferences();
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
        } catch (error) {
            console.error('Error getting current tab:', error);
        }
    }

    setupEventListeners() {
        // Split option cards
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectSplitOption(e.currentTarget);
            });
        });

        // Quick mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.executeQuickMode(e.currentTarget.dataset.mode);
            });
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancel-split').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('execute-split').addEventListener('click', () => {
            this.executeSplit();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });
    }

    selectSplitOption(card) {
        // Remove previous selection
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        
        // Select current card
        card.classList.add('selected');
        this.selectedSplit = parseInt(card.dataset.split);
        
        // Show configuration modal
        setTimeout(() => {
            this.showConfigModal();
        }, 300);
    }

    showConfigModal() {
        const modal = document.getElementById('config-modal');
        const tabConfigs = document.getElementById('tab-configs');
        
        // Clear previous configs
        tabConfigs.innerHTML = '';
        
        // Create configuration for each new tab
        for (let i = 1; i < this.selectedSplit; i++) {
            const config = this.createTabConfig(i);
            tabConfigs.appendChild(config);
        }
        
        modal.classList.remove('hidden');
    }

    createTabConfig(tabNumber) {
        const div = document.createElement('div');
        div.className = 'tab-config';
        div.innerHTML = `
            <h4>Tab ${tabNumber + 1} Content</h4>
            <select data-tab="${tabNumber}">
                <option value="blank">Blank Tab</option>
                <option value="search">Google Search</option>
                <option value="gmail">Gmail</option>
                <option value="calendar">Google Calendar</option>
                <option value="drive">Google Drive</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="stackoverflow">Stack Overflow</option>
                <option value="custom">Custom URL</option>
            </select>
            <input type="url" placeholder="Enter custom URL..." style="display: none;" data-custom="${tabNumber}">
        `;
        
        // Handle custom URL input
        const select = div.querySelector('select');
        const customInput = div.querySelector('input');
        
        select.addEventListener('change', () => {
            if (select.value === 'custom') {
                customInput.style.display = 'block';
                customInput.focus();
            } else {
                customInput.style.display = 'none';
            }
        });
        
        return div;
    }

    hideModal() {
        document.getElementById('config-modal').classList.add('hidden');
        // Reset selection
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        this.selectedSplit = null;
    }

    async executeSplit() {
        if (!this.selectedSplit || !this.currentTab) return;
        
        const tabConfigs = document.querySelectorAll('.tab-config');
        const newTabs = [];
        
        for (let config of tabConfigs) {
            const select = config.querySelector('select');
            const customInput = config.querySelector('input');
            const url = this.getUrlForOption(select.value, customInput.value);
            if (url) {
                newTabs.push(url);
            }
        }
        
        try {
            // Send message to background script to handle tab creation
            await chrome.runtime.sendMessage({
                action: 'splitTabs',
                currentTabId: this.currentTab.id,
                newTabUrls: newTabs,
                splitCount: this.selectedSplit
            });
            
            // Close popup
            window.close();
        } catch (error) {
            console.error('Error executing split:', error);
        }
    }

    getUrlForOption(option, customUrl = '') {
        const urls = {
            blank: 'chrome://newtab/',
            search: 'https://www.google.com/search?q=' + encodeURIComponent(this.currentTab.title),
            gmail: 'https://mail.google.com',
            calendar: 'https://calendar.google.com',
            drive: 'https://drive.google.com',
            youtube: 'https://www.youtube.com',
            twitter: 'https://twitter.com',
            linkedin: 'https://www.linkedin.com',
            github: 'https://github.com',
            stackoverflow: 'https://stackoverflow.com',
            custom: customUrl
        };
        
        return urls[option] || 'chrome://newtab/';
    }

    async executeQuickMode(mode) {
        if (!this.currentTab) return;
        
        const quickModes = {
            research: [
                'https://www.google.com/search?q=' + encodeURIComponent(this.currentTab.title),
                'https://scholar.google.com',
                'chrome://newtab/'
            ],
            shopping: [
                'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(this.currentTab.title),
                'https://www.amazon.com',
                'https://www.ebay.com'
            ],
            work: [
                'https://mail.google.com',
                'https://calendar.google.com',
                'https://drive.google.com'
            ],
            social: [
                'https://twitter.com',
                'https://www.linkedin.com',
                'https://www.facebook.com'
            ]
        };
        
        const urls = quickModes[mode] || [];
        
        try {
            await chrome.runtime.sendMessage({
                action: 'splitTabs',
                currentTabId: this.currentTab.id,
                newTabUrls: urls,
                splitCount: urls.length + 1,
                mode: mode
            });
            
            window.close();
        } catch (error) {
            console.error('Error executing quick mode:', error);
        }
    }

    async loadUserPreferences() {
        try {
            const result = await chrome.storage.sync.get(['splitTabPreferences']);
            if (result.splitTabPreferences) {
                // Apply user preferences
                console.log('Loaded user preferences:', result.splitTabPreferences);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    openSettings() {
        // For now, just show an alert. In the future, this could open a settings page
        alert('Settings panel coming soon! You can customize default split configurations, favorite sites, and keyboard shortcuts.');
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SplitTabPopup();
});
