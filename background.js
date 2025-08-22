chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  chrome.storage.sync.get(['focusMode', 'blockedWebsites'], (result) => {
    if (result.focusMode === undefined) {
      chrome.storage.sync.set({ focusMode: false });
    }
    if (!result.blockedWebsites) {
      const defaultSites = [
        'facebook.com',
        'twitter.com',
        'instagram.com',
        'tiktok.com',
        'youtube.com',
        'reddit.com',
        'linkedin.com',
        'snapchat.com',
        'pinterest.com',
        'tumblr.com',
        'twitch.tv',
        'netflix.com',
        'hulu.com',
        'disneyplus.com'
      ];
      chrome.storage.sync.set({ blockedWebsites: defaultSites });
      updateBlockingRules(defaultSites);
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleFocus') {
    handleFocusToggle(request.enabled);
  } else if (request.action === 'updateBlockedSites') {
    updateBlockingRules(request.websites);
  }
});

// Handle focus mode toggle
function handleFocusToggle(enabled) {
  chrome.storage.sync.set({ focusMode: enabled });
  
  if (enabled) {
    // Get blocked websites and update rules
    chrome.storage.sync.get(['blockedWebsites'], (result) => {
      const websites = result.blockedWebsites || [];
      updateBlockingRules(websites);
    });
    
    // Update extension icon
    chrome.action.setIcon({
      path: {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
        "64": "icons/icon64.png",
        "128": "icons/icon128.png"
      }
    });
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  } else {
    clearBlockingRules();
    chrome.action.setBadgeText({ text: "" });
  }
}

// Update declarative net request rules
function updateBlockingRules(websites) {
  chrome.storage.sync.get(['focusMode'], (result) => {
    if (!result.focusMode) return;
    
    // Clear existing rules first
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const ruleIdsToRemove = existingRules.map(rule => rule.id);
      
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove,
        addRules: createBlockingRules(websites)
      });
    });
  });
}

function clearBlockingRules() {
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const ruleIdsToRemove = existingRules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove
    });
  });
}

function createBlockingRules(websites) {
  const rules = [];
  
  websites.forEach((website, index) => {
    // Block main domain
    rules.push({
      id: index * 2 + 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*://*.${website}/*`,
        resourceTypes: ["main_frame"]
      }
    });
    
    // Block www subdomain
    rules.push({
      id: index * 2 + 2,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*://www.${website}/*`,
        resourceTypes: ["main_frame"]
      }
    });
  });
  
  return rules;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.sync.get(['focusMode', 'blockedWebsites'], (result) => {
      if (result.focusMode && result.blockedWebsites) {
        const currentDomain = extractDomain(tab.url);
        const isBlocked = result.blockedWebsites.some(site => 
          currentDomain.includes(site) || currentDomain.includes(`www.${site}`)
        );
        
        if (isBlocked) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }).catch(err => console.log('Script injection failed:', err));
        }
      }
    });
  }
});

function extractDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch (e) {
    return '';
  }
}

chrome.runtime.onStartup.addListener(() => {
  chrome.notifications.getPermissionLevel((level) => {
    if (level !== 'granted') {
      chrome.notifications.requestPermission();
    }
  });
});

chrome.contextMenus.create({
  id: "addToBlocked",
  title: "Block this website",
  contexts: ["page"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToBlocked") {
    const domain = extractDomain(tab.url);
    if (domain) {
      chrome.storage.sync.get(['blockedWebsites'], (result) => {
        const blockedWebsites = result.blockedWebsites || [];
        const cleanDomain = domain.replace(/^www\./, '');
        
        if (!blockedWebsites.includes(cleanDomain)) {
          blockedWebsites.push(cleanDomain);
          chrome.storage.sync.set({ blockedWebsites: blockedWebsites });
          updateBlockingRules(blockedWebsites);
          
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon64.png',
            title: 'Website Blocked',
            message: `${cleanDomain} has been added to your blocked sites list.`
          });
        }
      });
    }
  }
});
