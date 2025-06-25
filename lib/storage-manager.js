// Storage Manager - Settings and preferences management
class StorageManager {
    constructor() {
        this.defaultSettings = {
            // Split preferences
            defaultSplitCount: 2,
            autoGroupTabs: true,
            tabPosition: 'after', // 'after', 'before', 'end'
            
            // UI preferences
            showNotifications: true,
            animationSpeed: 'normal', // 'slow', 'normal', 'fast'
            theme: 'auto', // 'light', 'dark', 'auto'
            
            // Quick modes
            enableQuickModes: true,
            favoriteUrls: [
                'https://mail.google.com',
                'https://calendar.google.com',
                'https://drive.google.com',
                'https://github.com',
                'https://stackoverflow.com'
            ],
            
            // Keyboard shortcuts
            keyboardShortcutsEnabled: true,
            customShortcuts: {},
            
            // Advanced features
            smartSuggestions: true,
            contextMenuEnabled: true,
            pinImportantTabs: false,
            
            // Privacy
            trackUsage: true,
            shareAnonymousStats: false
        };
    }

    /**
     * Initialize storage with default settings
     */
    async initialize() {
        try {
            const stored = await this.getAll();
            if (!stored.settings) {
                await this.setSettings(this.defaultSettings);
            }
            return true;
        } catch (error) {
            console.error('Error initializing storage:', error);
            return false;
        }
    }

    /**
     * Get all stored data
     */
    async getAll() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(null, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Get user settings with fallback to defaults
     */
    async getSettings() {
        try {
            const result = await new Promise((resolve, reject) => {
                chrome.storage.sync.get(['settings'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            
            // Merge with defaults to ensure all settings exist
            return { ...this.defaultSettings, ...(result.settings || {}) };
        } catch (error) {
            console.error('Error getting settings:', error);
            return this.defaultSettings;
        }
    }

    /**
     * Update user settings
     */
    async setSettings(newSettings) {
        try {
            const currentSettings = await this.getSettings();
            const updatedSettings = { ...currentSettings, ...newSettings };
            
            return new Promise((resolve, reject) => {
                chrome.storage.sync.set({ settings: updatedSettings }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(updatedSettings);
                    }
                });
            });
        } catch (error) {
            console.error('Error setting settings:', error);
            throw error;
        }
    }

    /**
     * Get specific setting value
     */
    async getSetting(key) {
        const settings = await this.getSettings();
        return settings[key];
    }

    /**
     * Set specific setting value
     */
    async setSetting(key, value) {
        const settings = await this.getSettings();
        settings[key] = value;
        return await this.setSettings(settings);
    }

    /**
     * Favorite URLs management
     */
    async getFavoriteUrls() {
        return await this.getSetting('favoriteUrls');
    }

    async addFavoriteUrl(url, title = null) {
        const favorites = await this.getFavoriteUrls();
        const newFavorite = {
            url,
            title: title || this.extractDomainName(url),
            addedAt: Date.now()
        };
        
        // Prevent duplicates
        if (!favorites.some(fav => fav.url === url)) {
            favorites.push(newFavorite);
            await this.setSetting('favoriteUrls', favorites);
        }
        
        return favorites;
    }

    async removeFavoriteUrl(url) {
        const favorites = await this.getFavoriteUrls();
        const updated = favorites.filter(fav => fav.url !== url);
        await this.setSetting('favoriteUrls', updated);
        return updated;
    }

    extractDomainName(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '').split('.')[0];
        } catch {
            return 'Custom Site';
        }
    }

    /**
     * Quick modes management
     */
    async getQuickModes() {
        const stored = await new Promise((resolve) => {
            chrome.storage.sync.get(['quickModes'], (result) => {
                resolve(result.quickModes || this.getDefaultQuickModes());
            });
        });
        return stored;
    }

    getDefaultQuickModes() {
        return {
            research: {
                name: 'Research Mode',
                icon: '🔍',
                urls: [
                    'https://www.google.com/search?q={{title}}',
                    'https://scholar.google.com',
                    'chrome://newtab/'
                ]
            },
            shopping: {
                name: 'Shopping Mode',
                icon: '🛒',
                urls: [
                    'https://www.google.com/search?tbm=shop&q={{title}}',
                    'https://www.amazon.com',
                    'https://www.ebay.com'
                ]
            },
            work: {
                name: 'Work Mode',
                icon: '💼',
                urls: [
                    'https://mail.google.com',
                    'https://calendar.google.com',
                    'https://drive.google.com'
                ]
            },
            social: {
                name: 'Social Mode',
                icon: '📱',
                urls: [
                    'https://twitter.com',
                    'https://www.linkedin.com',
                    'https://www.facebook.com'
                ]
            },
            development: {
                name: 'Development Mode',
                icon: '👨‍💻',
                urls: [
                    'https://github.com',
                    'https://stackoverflow.com',
                    'https://developer.mozilla.org'
                ]
            }
        };
    }

    async setQuickModes(modes) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ quickModes: modes }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(modes);
                }
            });
        });
    }

    /**
     * Usage statistics management
     */
    async getUsageStats() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['usageStats'], (result) => {
                resolve(result.usageStats || {
                    totalSplits: 0,
                    splitsByCount: {},
                    splitsByMode: {},
                    lastUsed: null,
                    streakDays: 0
                });
            });
        });
    }

    async updateUsageStats(splitInfo) {
        const stats = await this.getUsageStats();
        const today = new Date().toDateString();
        
        // Update counters
        stats.totalSplits = (stats.totalSplits || 0) + 1;
        stats.splitsByCount = stats.splitsByCount || {};
        stats.splitsByCount[splitInfo.count] = (stats.splitsByCount[splitInfo.count] || 0) + 1;
        
        if (splitInfo.mode) {
            stats.splitsByMode = stats.splitsByMode || {};
            stats.splitsByMode[splitInfo.mode] = (stats.splitsByMode[splitInfo.mode] || 0) + 1;
        }
        
        // Update streak
        if (stats.lastUsed !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (stats.lastUsed === yesterday.toDateString()) {
                stats.streakDays = (stats.streakDays || 0) + 1;
            } else {
                stats.streakDays = 1;
            }
            stats.lastUsed = today;
        }
        
        return new Promise((resolve) => {
            chrome.storage.local.set({ usageStats: stats }, () => {
                resolve(stats);
            });
        });
    }

    /**
     * Session management
     */
    async saveSplitSession(session) {
        const sessions = await this.getSplitSessions();
        sessions.push({
            ...session,
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        });
        
        // Keep only last 20 sessions
        if (sessions.length > 20) {
            sessions.splice(0, sessions.length - 20);
        }
        
        return new Promise((resolve) => {
            chrome.storage.local.set({ splitSessions: sessions }, () => {
                resolve(sessions);
            });
        });
    }

    async getSplitSessions() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['splitSessions'], (result) => {
                resolve(result.splitSessions || []);
            });
        });
    }

    /**
     * Data export and import
     */
    async exportData() {
        const syncData = await this.getAll();
        const localData = await new Promise((resolve) => {
            chrome.storage.local.get(null, resolve);
        });
        
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            sync: syncData,
            local: localData
        };
    }

    async importData(data) {
        try {
            if (data.sync) {
                await new Promise((resolve, reject) => {
                    chrome.storage.sync.set(data.sync, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                });
            }
            
            if (data.local) {
                await new Promise((resolve, reject) => {
                    chrome.storage.local.set(data.local, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Reset all data
     */
    async resetAllData() {
        try {
            await new Promise((resolve) => {
                chrome.storage.sync.clear(resolve);
            });
            await new Promise((resolve) => {
                chrome.storage.local.clear(resolve);
            });
            await this.initialize();
            return true;
        } catch (error) {
            console.error('Error resetting data:', error);
            return false;
        }
    }

    /**
     * Listen for storage changes
     */
    onSettingsChanged(callback) {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' && changes.settings) {
                callback(changes.settings.newValue, changes.settings.oldValue);
            }
        });
    }

    /**
     * Validate and migrate old data formats
     */
    async migrateData() {
        try {
            const data = await this.getAll();
            let needsMigration = false;
            
            // Check for old format and migrate if necessary
            if (data.splitTabPreferences && !data.settings) {
                // Old format detected, migrate
                const oldPrefs = data.splitTabPreferences;
                const newSettings = {
                    ...this.defaultSettings,
                    defaultSplitCount: oldPrefs.defaultSplit || 2,
                    autoGroupTabs: oldPrefs.autoGroup !== false,
                    favoriteUrls: oldPrefs.favoriteUrls || this.defaultSettings.favoriteUrls
                };
                
                await this.setSettings(newSettings);
                needsMigration = true;
            }
            
            return needsMigration;
        } catch (error) {
            console.error('Error migrating data:', error);
            return false;
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}
