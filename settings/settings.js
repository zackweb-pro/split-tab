// Settings page functionality
class SettingsManager {
    constructor() {
        this.storageManager = new StorageManager();
        this.currentSettings = {};
        this.init();
    }

    async init() {
        await this.storageManager.initialize();
        await this.loadSettings();
        this.setupEventListeners();
        this.loadFavorites();
        this.loadStatistics();
    }

    async loadSettings() {
        try {
            this.currentSettings = await this.storageManager.getSettings();
            this.populateForm();
        } catch (error) {
            console.error('Error loading settings:', error);
            Utils.ui.showNotification('Error loading settings', 'error');
        }
    }

    populateForm() {
        // Basic settings
        document.getElementById('defaultSplitCount').value = this.currentSettings.defaultSplitCount || 2;
        document.getElementById('autoGroupTabs').checked = this.currentSettings.autoGroupTabs !== false;
        document.getElementById('tabPosition').value = this.currentSettings.tabPosition || 'after';
        document.getElementById('pinImportantTabs').checked = this.currentSettings.pinImportantTabs || false;
        
        // Quick modes
        document.getElementById('enableQuickModes').checked = this.currentSettings.enableQuickModes !== false;
        
        // Advanced settings
        document.getElementById('smartSuggestions').checked = this.currentSettings.smartSuggestions !== false;
        document.getElementById('contextMenuEnabled').checked = this.currentSettings.contextMenuEnabled !== false;
        document.getElementById('showNotifications').checked = this.currentSettings.showNotifications !== false;
        document.getElementById('trackUsage').checked = this.currentSettings.trackUsage !== false;
        
        // Update quick modes visibility
        this.toggleQuickModesConfig();
    }

    setupEventListeners() {
        // Save settings
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Reset to defaults
        document.getElementById('resetDefaults').addEventListener('click', () => {
            this.resetToDefaults();
        });
        
        // Quick modes toggle
        document.getElementById('enableQuickModes').addEventListener('change', () => {
            this.toggleQuickModesConfig();
        });
        
        // Favorites management
        document.getElementById('addFavorite').addEventListener('click', () => {
            this.addFavorite();
        });
        
        // Data management
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
        
        document.getElementById('resetData').addEventListener('click', () => {
            this.resetAllData();
        });
        
        // Auto-save on form changes
        this.setupAutoSave();
    }

    setupAutoSave() {
        const formElements = document.querySelectorAll('input, select');
        formElements.forEach(element => {
            element.addEventListener('change', Utils.performance.debounce(() => {
                this.saveSettings(false); // Save without notification
            }, 1000));
        });
    }

    toggleQuickModesConfig() {
        const enabled = document.getElementById('enableQuickModes').checked;
        const config = document.getElementById('quickModesConfig');
        config.style.display = enabled ? 'block' : 'none';
    }

    async saveSettings(showNotification = true) {
        try {
            const settings = this.collectFormData();
            await this.storageManager.setSettings(settings);
            this.currentSettings = settings;
            
            if (showNotification) {
                Utils.ui.showNotification('Settings saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            Utils.ui.showNotification('Error saving settings', 'error');
        }
    }

    collectFormData() {
        return {
            // Basic settings
            defaultSplitCount: parseInt(document.getElementById('defaultSplitCount').value),
            autoGroupTabs: document.getElementById('autoGroupTabs').checked,
            tabPosition: document.getElementById('tabPosition').value,
            pinImportantTabs: document.getElementById('pinImportantTabs').checked,
            
            // Quick modes
            enableQuickModes: document.getElementById('enableQuickModes').checked,
            
            // Advanced settings
            smartSuggestions: document.getElementById('smartSuggestions').checked,
            contextMenuEnabled: document.getElementById('contextMenuEnabled').checked,
            showNotifications: document.getElementById('showNotifications').checked,
            trackUsage: document.getElementById('trackUsage').checked,
            
            // Keep existing settings that aren't in the form
            ...this.currentSettings,
            
            // Update timestamp
            lastModified: Date.now()
        };
    }

    async resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            try {
                await this.storageManager.setSettings(this.storageManager.defaultSettings);
                await this.loadSettings();
                Utils.ui.showNotification('Settings reset to defaults', 'success');
            } catch (error) {
                console.error('Error resetting settings:', error);
                Utils.ui.showNotification('Error resetting settings', 'error');
            }
        }
    }

    async loadFavorites() {
        try {
            const favorites = await this.storageManager.getFavoriteUrls();
            this.renderFavorites(favorites);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    renderFavorites(favorites) {
        const container = document.getElementById('favoritesList');
        container.innerHTML = '';
        
        if (!favorites || favorites.length === 0) {
            container.innerHTML = '<p style="color: #718096; font-style: italic;">No favorite URLs added yet.</p>';
            return;
        }
        
        favorites.forEach(favorite => {
            const item = Utils.ui.createElement('div', { className: 'favorite-item' }, [
                Utils.ui.createElement('div', { className: 'favorite-info' }, [
                    Utils.ui.createElement('div', { className: 'favorite-title' }, [favorite.title || 'Unnamed']),
                    Utils.ui.createElement('div', { className: 'favorite-url' }, [favorite.url])
                ]),
                Utils.ui.createElement('button', {
                    className: 'remove-favorite',
                    onclick: () => this.removeFavorite(favorite.url)
                }, ['Remove'])
            ]);
            
            container.appendChild(item);
        });
    }

    async addFavorite() {
        const urlInput = document.getElementById('newFavoriteUrl');
        const titleInput = document.getElementById('newFavoriteTitle');
        
        const url = urlInput.value.trim();
        const title = titleInput.value.trim();
        
        if (!url) {
            Utils.ui.showNotification('Please enter a URL', 'warning');
            return;
        }
        
        if (!Utils.url.isValid(url)) {
            Utils.ui.showNotification('Please enter a valid URL', 'warning');
            return;
        }
        
        try {
            await this.storageManager.addFavoriteUrl(url, title);
            await this.loadFavorites();
            
            // Clear inputs
            urlInput.value = '';
            titleInput.value = '';
            
            Utils.ui.showNotification('Favorite added successfully!', 'success');
        } catch (error) {
            console.error('Error adding favorite:', error);
            Utils.ui.showNotification('Error adding favorite', 'error');
        }
    }

    async removeFavorite(url) {
        try {
            await this.storageManager.removeFavoriteUrl(url);
            await this.loadFavorites();
            Utils.ui.showNotification('Favorite removed', 'success');
        } catch (error) {
            console.error('Error removing favorite:', error);
            Utils.ui.showNotification('Error removing favorite', 'error');
        }
    }

    async loadStatistics() {
        try {
            const stats = await this.storageManager.getUsageStats();
            this.renderStatistics(stats);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    renderStatistics(stats) {
        document.getElementById('totalSplits').textContent = stats.totalSplits || 0;
        
        const splitCounts = Object.values(stats.splitsByCount || {});
        const avgSplit = splitCounts.length > 0 ? 
            (splitCounts.reduce((sum, count) => sum + count, 0) / splitCounts.length).toFixed(1) : 
            '0';
        document.getElementById('averageSplit').textContent = avgSplit;
        
        document.getElementById('streakDays').textContent = stats.streakDays || 0;
    }

    async exportData() {
        try {
            const data = await this.storageManager.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `split-tab-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            Utils.ui.showNotification('Settings exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            Utils.ui.showNotification('Error exporting settings', 'error');
        }
    }

    async importData(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (confirm('Are you sure you want to import these settings? This will overwrite your current settings.')) {
                const success = await this.storageManager.importData(data);
                if (success) {
                    await this.loadSettings();
                    await this.loadFavorites();
                    await this.loadStatistics();
                    Utils.ui.showNotification('Settings imported successfully!', 'success');
                } else {
                    Utils.ui.showNotification('Error importing settings', 'error');
                }
            }
        } catch (error) {
            console.error('Error importing data:', error);
            Utils.ui.showNotification('Invalid settings file', 'error');
        }
    }

    async resetAllData() {
        if (confirm('Are you sure you want to reset ALL data? This will delete all settings, favorites, and statistics. This cannot be undone!')) {
            if (confirm('This action is permanent and cannot be undone. Are you absolutely sure?')) {
                try {
                    await this.storageManager.resetAllData();
                    await this.loadSettings();
                    await this.loadFavorites();
                    await this.loadStatistics();
                    Utils.ui.showNotification('All data has been reset', 'success');
                } catch (error) {
                    console.error('Error resetting data:', error);
                    Utils.ui.showNotification('Error resetting data', 'error');
                }
            }
        }
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
