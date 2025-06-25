// Utility functions for Split Tab extension
const Utils = {
    /**
     * URL and domain utilities
     */
    url: {
        isValid(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },

        extractDomain(url) {
            try {
                return new URL(url).hostname.toLowerCase();
            } catch {
                return '';
            }
        },

        extractRootDomain(url) {
            try {
                const domain = new URL(url).hostname.toLowerCase();
                const parts = domain.split('.');
                if (parts.length >= 2) {
                    return parts.slice(-2).join('.');
                }
                return domain;
            } catch {
                return '';
            }
        },

        isExternal(url, currentOrigin) {
            try {
                const urlObj = new URL(url);
                return urlObj.origin !== currentOrigin;
            } catch {
                return false;
            }
        },

        addProtocol(url) {
            if (!url) return '';
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            return `https://${url}`;
        },

        buildSearchUrl(query, engine = 'google') {
            const encodedQuery = encodeURIComponent(query);
            const engines = {
                google: `https://www.google.com/search?q=${encodedQuery}`,
                bing: `https://www.bing.com/search?q=${encodedQuery}`,
                duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`,
                yahoo: `https://search.yahoo.com/search?p=${encodedQuery}`
            };
            return engines[engine] || engines.google;
        }
    },

    /**
     * String manipulation utilities
     */
    string: {
        truncate(str, length, suffix = '...') {
            if (!str || str.length <= length) return str;
            return str.slice(0, length - suffix.length) + suffix;
        },

        capitalize(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        kebabCase(str) {
            return str
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .replace(/[\s_]+/g, '-')
                .toLowerCase();
        },

        camelCase(str) {
            return str
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                    return index === 0 ? word.toLowerCase() : word.toUpperCase();
                })
                .replace(/\s+/g, '');
        },

        extractKeywords(text, maxKeywords = 10) {
            if (!text) return [];
            
            const words = text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 3)
                .filter(word => !this.isStopWord(word));
            
            const frequency = {};
            words.forEach(word => {
                frequency[word] = (frequency[word] || 0) + 1;
            });
            
            return Object.entries(frequency)
                .sort(([,a], [,b]) => b - a)
                .slice(0, maxKeywords)
                .map(([word]) => word);
        },

        isStopWord(word) {
            const stopWords = [
                'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
                'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
                'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
                'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
                'one', 'all', 'would', 'there', 'their'
            ];
            return stopWords.includes(word.toLowerCase());
        }
    },

    /**
     * Array utilities
     */
    array: {
        unique(arr) {
            return [...new Set(arr)];
        },

        shuffle(arr) {
            const shuffled = [...arr];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        chunk(arr, size) {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        },

        groupBy(arr, keyFn) {
            return arr.reduce((groups, item) => {
                const key = keyFn(item);
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(item);
                return groups;
            }, {});
        }
    },

    /**
     * Time and date utilities
     */
    time: {
        formatRelative(timestamp) {
            const now = Date.now();
            const diff = now - timestamp;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
            if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            return 'Just now';
        },

        formatDuration(ms) {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            if (hours > 0) {
                return `${hours}h ${minutes % 60}m`;
            }
            if (minutes > 0) {
                return `${minutes}m ${seconds % 60}s`;
            }
            return `${seconds}s`;
        },

        isToday(timestamp) {
            const today = new Date();
            const date = new Date(timestamp);
            return date.toDateString() === today.toDateString();
        },

        getTimeOfDay() {
            const hour = new Date().getHours();
            if (hour < 12) return 'morning';
            if (hour < 17) return 'afternoon';
            if (hour < 21) return 'evening';
            return 'night';
        }
    },

    /**
     * Browser and tab utilities
     */
    browser: {
        async getCurrentTab() {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                return tab;
            } catch (error) {
                console.error('Error getting current tab:', error);
                return null;
            }
        },

        async getAllTabs() {
            try {
                return await chrome.tabs.query({});
            } catch (error) {
                console.error('Error getting all tabs:', error);
                return [];
            }
        },

        async getTabsByDomain(domain) {
            try {
                const tabs = await chrome.tabs.query({});
                return tabs.filter(tab => {
                    try {
                        return new URL(tab.url).hostname.includes(domain);
                    } catch {
                        return false;
                    }
                });
            } catch (error) {
                console.error('Error getting tabs by domain:', error);
                return [];
            }
        },

        isSpecialUrl(url) {
            return url.startsWith('chrome://') || 
                   url.startsWith('chrome-extension://') ||
                   url.startsWith('moz-extension://') ||
                   url.startsWith('about:');
        },

        getTabIcon(tab) {
            if (tab.favIconUrl && tab.favIconUrl !== '') {
                return tab.favIconUrl;
            }
            
            // Fallback to generic icon based on URL
            try {
                const domain = new URL(tab.url).hostname;
                return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
            } catch {
                return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23ddd"/></svg>';
            }
        }
    },

    /**
     * UI utilities
     */
    ui: {
        createElement(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'innerHTML') {
                    element.innerHTML = value;
                } else if (key.startsWith('data-')) {
                    element.setAttribute(key, value);
                } else {
                    element[key] = value;
                }
            });
            
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
            
            return element;
        },

        addStyles(css) {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
            return style;
        },

        animate(element, keyframes, options = {}) {
            return element.animate(keyframes, {
                duration: 300,
                easing: 'ease-out',
                fill: 'forwards',
                ...options
            });
        },

        showNotification(message, type = 'info', duration = 3000) {
            // Create notification element
            const notification = this.createElement('div', {
                className: `split-tab-notification split-tab-notification--${type}`,
                innerHTML: message
            });

            // Add styles if not already added
            if (!document.querySelector('#split-tab-notification-styles')) {
                this.addStyles(`
                    .split-tab-notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #333;
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        z-index: 10000;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        transform: translateX(100%);
                        transition: transform 0.3s ease;
                    }
                    .split-tab-notification--success { background: #10b981; }
                    .split-tab-notification--error { background: #ef4444; }
                    .split-tab-notification--warning { background: #f59e0b; }
                    .split-tab-notification.show { transform: translateX(0); }
                `).id = 'split-tab-notification-styles';
            }

            document.body.appendChild(notification);

            // Show notification
            requestAnimationFrame(() => {
                notification.classList.add('show');
            });

            // Remove after duration
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);

            return notification;
        }
    },

    /**
     * Local storage utilities
     */
    storage: {
        get(key, defaultValue = null) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch {
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch {
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch {
                return false;
            }
        }
    },

    /**
     * Debugging utilities
     */
    debug: {
        log(message, data = null) {
            if (chrome.runtime && chrome.runtime.getManifest) {
                const manifest = chrome.runtime.getManifest();
                if (manifest.version_name && manifest.version_name.includes('dev')) {
                    console.log(`[Split Tab] ${message}`, data);
                }
            }
        },

        error(message, error = null) {
            console.error(`[Split Tab] ${message}`, error);
        },

        time(label) {
            console.time(`[Split Tab] ${label}`);
        },

        timeEnd(label) {
            console.timeEnd(`[Split Tab] ${label}`);
        },

        table(data) {
            console.table(data);
        }
    },

    /**
     * Performance utilities
     */
    performance: {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let lastFunc;
            let lastRan;
            return function(...args) {
                if (!lastRan) {
                    func(...args);
                    lastRan = Date.now();
                } else {
                    clearTimeout(lastFunc);
                    lastFunc = setTimeout(() => {
                        if ((Date.now() - lastRan) >= limit) {
                            func(...args);
                            lastRan = Date.now();
                        }
                    }, limit - (Date.now() - lastRan));
                }
            };
        },

        memoize(func) {
            const cache = new Map();
            return function(...args) {
                const key = JSON.stringify(args);
                if (cache.has(key)) {
                    return cache.get(key);
                }
                const result = func.apply(this, args);
                cache.set(key, result);
                return result;
            };
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
