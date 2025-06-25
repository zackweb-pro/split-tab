// Content script for Split Tab extension
class SplitTabContentScript {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.injectSplitIndicator();
    }

    setupEventListeners() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true;
        });

        // Listen for keyboard shortcuts that might be handled in content
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Observe page changes for single-page applications
        this.observePageChanges();
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'getPageInfo':
                sendResponse(this.getPageInfo());
                break;
            
            case 'highlightSplitElements':
                this.highlightSplitElements();
                sendResponse({ success: true });
                break;
            
            case 'extractPageContent':
                const content = this.extractPageContent();
                sendResponse({ content });
                break;
            
            default:
                sendResponse({ error: 'Unknown action' });
        }
    }

    getPageInfo() {
        return {
            title: document.title,
            url: window.location.href,
            domain: window.location.hostname,
            description: this.getPageDescription(),
            keywords: this.getPageKeywords(),
            mainContent: this.getMainContentSelector(),
            hasSearch: this.hasSearchFunctionality(),
            isArticle: this.isArticlePage(),
            socialLinks: this.getSocialLinks()
        };
    }

    getPageDescription() {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) return metaDesc.content;
        
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) return ogDesc.content;
        
        // Fallback: first paragraph text
        const firstP = document.querySelector('p');
        return firstP ? firstP.textContent.slice(0, 160) : '';
    }

    getPageKeywords() {
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) return metaKeywords.content.split(',').map(k => k.trim());
        
        // Extract from title and headings
        const keywords = [];
        const title = document.title.toLowerCase();
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
            .map(h => h.textContent.toLowerCase());
        
        // Simple keyword extraction (could be enhanced)
        const text = [title, ...headings].join(' ');
        const words = text.match(/\b\w{4,}\b/g) || [];
        return [...new Set(words)].slice(0, 10);
    }

    getMainContentSelector() {
        // Try to identify main content area
        const selectors = [
            'main',
            '[role="main"]',
            '.main-content',
            '#main-content',
            '.content',
            '#content',
            'article',
            '.article'
        ];
        
        for (const selector of selectors) {
            if (document.querySelector(selector)) {
                return selector;
            }
        }
        
        return 'body';
    }

    hasSearchFunctionality() {
        return !!(
            document.querySelector('input[type="search"]') ||
            document.querySelector('input[name*="search"]') ||
            document.querySelector('input[placeholder*="search"]') ||
            document.querySelector('.search-box') ||
            document.querySelector('#search')
        );
    }

    isArticlePage() {
        return !!(
            document.querySelector('article') ||
            document.querySelector('[role="article"]') ||
            document.querySelector('meta[property="og:type"][content="article"]') ||
            document.querySelector('.article') ||
            document.querySelector('.post')
        );
    }

    getSocialLinks() {
        const socialLinks = [];
        const socialSelectors = [
            'a[href*="twitter.com"]',
            'a[href*="facebook.com"]',
            'a[href*="linkedin.com"]',
            'a[href*="instagram.com"]',
            'a[href*="youtube.com"]',
            'a[href*="github.com"]'
        ];
        
        socialSelectors.forEach(selector => {
            const links = document.querySelectorAll(selector);
            links.forEach(link => {
                socialLinks.push({
                    platform: this.getSocialPlatform(link.href),
                    url: link.href
                });
            });
        });
        
        return socialLinks;
    }

    getSocialPlatform(url) {
        if (url.includes('twitter.com')) return 'Twitter';
        if (url.includes('facebook.com')) return 'Facebook';
        if (url.includes('linkedin.com')) return 'LinkedIn';
        if (url.includes('instagram.com')) return 'Instagram';
        if (url.includes('youtube.com')) return 'YouTube';
        if (url.includes('github.com')) return 'GitHub';
        return 'Unknown';
    }

    handleKeydown(e) {
        // Handle any content-specific keyboard shortcuts
        if (e.ctrlKey && e.shiftKey) {
            switch (e.key) {
                case '2':
                case '3':
                case '4':
                    // These are handled by background script, but we could add visual feedback
                    this.showSplitAnimation(e.key);
                    break;
            }
        }
    }

    showSplitAnimation(splitCount) {
        // Add a subtle visual indication that split is happening
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(102, 126, 234, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transform: translateY(-10px);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        indicator.textContent = `Splitting into ${splitCount} tabs...`;
        
        document.body.appendChild(indicator);
        
        // Animate in
        requestAnimationFrame(() => {
            indicator.style.transform = 'translateY(0)';
            indicator.style.opacity = '1';
        });
        
        // Remove after animation
        setTimeout(() => {
            indicator.style.transform = 'translateY(-10px)';
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }, 2000);
    }

    injectSplitIndicator() {
        // Add a subtle indicator that Split Tab is active on this page
        if (document.querySelector('#split-tab-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'split-tab-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: rgba(102, 126, 234, 0.1);
            border: 2px solid rgba(102, 126, 234, 0.3);
            border-radius: 50%;
            z-index: 9999;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: all 0.3s ease;
            opacity: 0;
            transform: scale(0.8);
        `;
        indicator.innerHTML = '⚡';
        indicator.title = 'Click to split this tab';
        
        // Show indicator on hover over the page
        let showTimeout;
        document.addEventListener('mousemove', () => {
            clearTimeout(showTimeout);
            indicator.style.opacity = '1';
            indicator.style.transform = 'scale(1)';
            
            showTimeout = setTimeout(() => {
                indicator.style.opacity = '0';
                indicator.style.transform = 'scale(0.8)';
            }, 3000);
        });
        
        // Handle click
        indicator.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openPopup' });
        });
        
        document.body.appendChild(indicator);
    }

    highlightSplitElements() {
        // Highlight elements that could be useful for splitting
        const elements = document.querySelectorAll('a[href], button, input[type="search"]');
        
        elements.forEach(el => {
            if (this.isExternalLink(el) || this.isSearchInput(el)) {
                el.style.outline = '2px solid rgba(102, 126, 234, 0.5)';
                el.style.outlineOffset = '2px';
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    el.style.outline = '';
                    el.style.outlineOffset = '';
                }, 3000);
            }
        });
    }

    isExternalLink(element) {
        if (element.tagName !== 'A') return false;
        const href = element.href;
        return href && !href.startsWith(window.location.origin) && !href.startsWith('#');
    }

    isSearchInput(element) {
        return element.type === 'search' || 
               element.name?.includes('search') || 
               element.placeholder?.toLowerCase().includes('search');
    }

    extractPageContent() {
        // Extract relevant content for smart splitting suggestions
        const content = {
            title: document.title,
            headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim()),
            links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
                text: a.textContent.trim(),
                href: a.href
            })).filter(link => link.text && this.isExternalLink({ href: link.href, tagName: 'A' })),
            images: Array.from(document.querySelectorAll('img[src]')).map(img => ({
                alt: img.alt,
                src: img.src
            })).slice(0, 5), // Limit to first 5 images
            mainText: this.getMainText()
        };
        
        return content;
    }

    getMainText() {
        const mainContent = document.querySelector(this.getMainContentSelector());
        if (!mainContent) return '';
        
        // Extract text while avoiding navigation, ads, etc.
        const textElements = mainContent.querySelectorAll('p, li, blockquote');
        const texts = Array.from(textElements).map(el => el.textContent.trim()).filter(text => text.length > 20);
        
        return texts.slice(0, 3).join(' ').slice(0, 500); // First 3 paragraphs, max 500 chars
    }

    observePageChanges() {
        // For single-page applications, observe URL changes
        let currentUrl = window.location.href;
        
        const observer = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                // Notify background script of URL change
                chrome.runtime.sendMessage({
                    action: 'urlChanged',
                    newUrl: currentUrl,
                    pageInfo: this.getPageInfo()
                });
            }
        });
        
        observer.observe(document, { subtree: true, childList: true });
    }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SplitTabContentScript();
    });
} else {
    new SplitTabContentScript();
}
