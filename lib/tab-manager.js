// Tab Manager - Core tab splitting logic
class TabManager {
    constructor() {
        this.activeSessions = new Map();
    }

    /**
     * Create multiple tabs based on configuration
     */
    async createTabs(config) {
        const { sourceTab, targetUrls, windowId, position = 'after', grouping = true } = config;
        const createdTabs = [];

        try {
            for (let i = 0; i < targetUrls.length; i++) {
                const tabConfig = {
                    url: targetUrls[i],
                    windowId: windowId || sourceTab.windowId,
                    active: i === 0, // Make first new tab active
                };

                // Calculate position
                if (position === 'after') {
                    tabConfig.index = sourceTab.index + i + 1;
                } else if (position === 'before') {
                    tabConfig.index = sourceTab.index + i;
                } else if (position === 'end') {
                    // Let Chrome place it at the end
                }

                const newTab = await chrome.tabs.create(tabConfig);
                createdTabs.push(newTab);
            }

            // Group tabs if requested
            if (grouping && chrome.tabs.group) {
                const allTabIds = [sourceTab.id, ...createdTabs.map(tab => tab.id)];
                const groupId = await chrome.tabs.group({ tabIds: allTabIds });
                return { createdTabs, groupId };
            }

            return { createdTabs, groupId: null };

        } catch (error) {
            console.error('Error creating tabs:', error);
            throw new Error(`Failed to create tabs: ${error.message}`);
        }
    }

    /**
     * Smart tab organization based on content type
     */
    async organizeTabs(tabs, organizationType = 'auto') {
        try {
            switch (organizationType) {
                case 'auto':
                    return await this.autoOrganize(tabs);
                case 'domain':
                    return await this.organizeByDomain(tabs);
                case 'type':
                    return await this.organizeByType(tabs);
                default:
                    return tabs;
            }
        } catch (error) {
            console.error('Error organizing tabs:', error);
            return tabs;
        }
    }

    async autoOrganize(tabs) {
        // Auto-organize based on tab content and relationships
        const organized = {
            primary: null,
            reference: [],
            tools: [],
            social: []
        };

        for (const tab of tabs) {
            const category = await this.categorizeTab(tab);
            if (!organized.primary && category === 'primary') {
                organized.primary = tab;
            } else {
                organized[category].push(tab);
            }
        }

        return organized;
    }

    async categorizeTab(tab) {
        const url = new URL(tab.url);
        const domain = url.hostname.toLowerCase();

        // Tool sites
        if (domain.includes('gmail.com') || domain.includes('calendar.google.com') || 
            domain.includes('drive.google.com') || domain.includes('slack.com')) {
            return 'tools';
        }

        // Social sites
        if (domain.includes('twitter.com') || domain.includes('facebook.com') || 
            domain.includes('linkedin.com') || domain.includes('instagram.com')) {
            return 'social';
        }

        // Search engines and references
        if (domain.includes('google.com') || domain.includes('bing.com') || 
            domain.includes('wikipedia.org') || domain.includes('stackoverflow.com')) {
            return 'reference';
        }

        return 'primary';
    }

    /**
     * Create tab groups with smart naming and coloring
     */
    async createSmartGroup(tabs, context = {}) {
        if (!chrome.tabs.group) return null;

        try {
            const tabIds = tabs.map(tab => tab.id);
            const groupId = await chrome.tabs.group({ tabIds });

            const groupConfig = this.generateGroupConfig(tabs, context);
            await chrome.tabGroups.update(groupId, groupConfig);

            return groupId;
        } catch (error) {
            console.error('Error creating smart group:', error);
            return null;
        }
    }

    generateGroupConfig(tabs, context) {
        const { mode, sourceUrl, timestamp } = context;
        
        // Predefined configurations
        const configs = {
            research: { 
                title: '🔍 Research', 
                color: 'blue' 
            },
            shopping: { 
                title: '🛒 Shopping', 
                color: 'green' 
            },
            work: { 
                title: '💼 Work', 
                color: 'orange' 
            },
            social: { 
                title: '📱 Social', 
                color: 'pink' 
            },
            development: { 
                title: '👨‍💻 Dev', 
                color: 'purple' 
            }
        };

        if (configs[mode]) {
            return configs[mode];
        }

        // Auto-generate based on tabs
        const domains = tabs.map(tab => {
            try {
                return new URL(tab.url).hostname.split('.').slice(-2, -1)[0];
            } catch {
                return 'tab';
            }
        });

        const uniqueDomains = [...new Set(domains)];
        const title = uniqueDomains.length === 1 ? 
            `⚡ ${uniqueDomains[0]}` : 
            `⚡ Split (${tabs.length})`;

        return {
            title: title.slice(0, 16), // Chrome has a title length limit
            color: this.getColorForDomains(uniqueDomains)
        };
    }

    getColorForDomains(domains) {
        const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
        const hash = domains.join('').split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * Split session management
     */
    createSession(sourceTab, createdTabs, config) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session = {
            id: sessionId,
            sourceTab: sourceTab,
            createdTabs: createdTabs,
            config: config,
            createdAt: new Date(),
            status: 'active'
        };

        this.activeSessions.set(sessionId, session);
        return session;
    }

    getSession(sessionId) {
        return this.activeSessions.get(sessionId);
    }

    async closeSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return false;

        try {
            // Close all tabs in the session
            const tabIds = session.createdTabs.map(tab => tab.id);
            await chrome.tabs.remove(tabIds);
            
            // Remove from active sessions
            this.activeSessions.delete(sessionId);
            return true;
        } catch (error) {
            console.error('Error closing session:', error);
            return false;
        }
    }

    /**
     * Smart URL suggestions based on current context
     */
    async generateSmartSuggestions(sourceTab, splitCount) {
        const suggestions = [];
        const url = new URL(sourceTab.url);
        const domain = url.hostname.toLowerCase();

        // Context-aware suggestions
        if (domain.includes('github.com')) {
            suggestions.push(
                'https://stackoverflow.com',
                'https://developer.mozilla.org',
                'chrome://newtab/'
            );
        } else if (domain.includes('stackoverflow.com')) {
            suggestions.push(
                'https://github.com',
                'https://developer.mozilla.org',
                'chrome://newtab/'
            );
        } else if (domain.includes('amazon.com') || domain.includes('shopping')) {
            suggestions.push(
                'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(sourceTab.title),
                'https://www.ebay.com',
                'chrome://newtab/'
            );
        } else if (domain.includes('wikipedia.org')) {
            suggestions.push(
                'https://www.google.com/search?q=' + encodeURIComponent(sourceTab.title),
                'https://scholar.google.com',
                'chrome://newtab/'
            );
        } else {
            // Default suggestions
            suggestions.push(
                'https://www.google.com/search?q=' + encodeURIComponent(sourceTab.title),
                'chrome://newtab/',
                'chrome://newtab/'
            );
        }

        // Trim to requested count
        return suggestions.slice(0, splitCount - 1);
    }

    /**
     * Analytics and usage tracking
     */
    trackSplitUsage(splitConfig) {
        const usage = {
            timestamp: Date.now(),
            splitCount: splitConfig.splitCount,
            mode: splitConfig.mode,
            sourceUrl: splitConfig.sourceUrl,
            targetUrls: splitConfig.targetUrls
        };

        // Store in local storage for analytics
        chrome.storage.local.get(['splitUsage'], (result) => {
            const usageHistory = result.splitUsage || [];
            usageHistory.push(usage);
            
            // Keep only last 100 entries
            if (usageHistory.length > 100) {
                usageHistory.shift();
            }
            
            chrome.storage.local.set({ splitUsage: usageHistory });
        });
    }

    /**
     * Get usage statistics
     */
    async getUsageStats() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['splitUsage'], (result) => {
                const usage = result.splitUsage || [];
                const stats = {
                    totalSplits: usage.length,
                    averageSplitCount: usage.reduce((sum, u) => sum + (u.splitCount || 2), 0) / usage.length || 0,
                    mostUsedMode: this.getMostFrequent(usage.map(u => u.mode)),
                    recentActivity: usage.slice(-10)
                };
                resolve(stats);
            });
        });
    }

    getMostFrequent(arr) {
        const frequency = {};
        let maxCount = 0;
        let mostFrequent = null;

        arr.forEach(item => {
            if (item) {
                frequency[item] = (frequency[item] || 0) + 1;
                if (frequency[item] > maxCount) {
                    maxCount = frequency[item];
                    mostFrequent = item;
                }
            }
        });

        return mostFrequent;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabManager;
} else if (typeof window !== 'undefined') {
    window.TabManager = TabManager;
}
