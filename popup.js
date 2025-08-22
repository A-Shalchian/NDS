document.addEventListener('DOMContentLoaded', function() {
  const focusToggle = document.getElementById('focusToggle');
  const statusText = document.getElementById('statusText');
  const websiteInput = document.getElementById('websiteInput');
  const addWebsiteBtn = document.getElementById('addWebsite');
  const blockedList = document.getElementById('blockedList');
  const timerDisplay = document.getElementById('timerDisplay');
  const startTimerBtn = document.getElementById('startTimer');
  const pauseTimerBtn = document.getElementById('pauseTimer');
  const resetTimerBtn = document.getElementById('resetTimer');
  const optionsLink = document.getElementById('optionsLink');

  let timerInterval;
  let timeRemaining = 25 * 60; // 25 minutes in seconds
  let isTimerRunning = false;

  // Load saved state
  loadState();

  // Focus toggle event
  focusToggle.addEventListener('change', function() {
    const isEnabled = focusToggle.checked;
    chrome.storage.sync.set({ focusMode: isEnabled });
    updateStatus(isEnabled);
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'toggleFocus',
      enabled: isEnabled
    });
  });

  // Add website event
  addWebsiteBtn.addEventListener('click', addWebsite);
  websiteInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addWebsite();
    }
  });

  // Timer events
  startTimerBtn.addEventListener('click', startTimer);
  pauseTimerBtn.addEventListener('click', pauseTimer);
  resetTimerBtn.addEventListener('click', resetTimer);

  // Options link
  optionsLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  function loadState() {
    chrome.storage.sync.get(['focusMode', 'blockedWebsites', 'timerState'], function(result) {
      // Load focus mode state
      const isEnabled = result.focusMode || false;
      focusToggle.checked = isEnabled;
      updateStatus(isEnabled);

      // Load blocked websites
      const blockedWebsites = result.blockedWebsites || getDefaultBlockedSites();
      displayBlockedWebsites(blockedWebsites);

      // Load timer state
      const timerState = result.timerState || {};
      if (timerState.timeRemaining) {
        timeRemaining = timerState.timeRemaining;
      }
      if (timerState.isRunning) {
        isTimerRunning = true;
        startTimerInterval();
      }
      updateTimerDisplay();
    });
  }

  function updateStatus(isEnabled) {
    statusText.textContent = isEnabled ? 'Active' : 'Disabled';
    statusText.style.color = isEnabled ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)';
  }

  function addWebsite() {
    const website = websiteInput.value.trim();
    if (!website) return;

    // Clean up the website URL
    const cleanWebsite = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    chrome.storage.sync.get(['blockedWebsites'], function(result) {
      const blockedWebsites = result.blockedWebsites || [];
      
      if (!blockedWebsites.includes(cleanWebsite)) {
        blockedWebsites.push(cleanWebsite);
        chrome.storage.sync.set({ blockedWebsites: blockedWebsites });
        displayBlockedWebsites(blockedWebsites);
        
        // Update blocking rules
        chrome.runtime.sendMessage({
          action: 'updateBlockedSites',
          websites: blockedWebsites
        });
      }
    });

    websiteInput.value = '';
  }

  function removeWebsite(website) {
    chrome.storage.sync.get(['blockedWebsites'], function(result) {
      const blockedWebsites = result.blockedWebsites || [];
      const updatedWebsites = blockedWebsites.filter(site => site !== website);
      
      chrome.storage.sync.set({ blockedWebsites: updatedWebsites });
      displayBlockedWebsites(updatedWebsites);
      
      // Update blocking rules
      chrome.runtime.sendMessage({
        action: 'updateBlockedSites',
        websites: updatedWebsites
      });
    });
  }

  function displayBlockedWebsites(websites) {
    blockedList.innerHTML = '';
    
    if (websites.length === 0) {
      blockedList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); font-size: 12px;">No blocked sites</div>';
      return;
    }

    websites.forEach(website => {
      const item = document.createElement('div');
      item.className = 'blocked-item';
      item.innerHTML = `
        <span>${website}</span>
        <button class="remove-btn" data-website="${website}">Remove</button>
      `;
      blockedList.appendChild(item);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        removeWebsite(this.dataset.website);
      });
    });
  }

  function getDefaultBlockedSites() {
    return [
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
      'disneyplus.com',
      'amazon.com',
      'ebay.com',
      'news.ycombinator.com',
      'buzzfeed.com',
      'cnn.com',
      'bbc.com'
    ];
  }

  // Timer functions
  function startTimer() {
    if (!isTimerRunning) {
      isTimerRunning = true;
      startTimerInterval();
      saveTimerState();
    }
  }

  function pauseTimer() {
    if (isTimerRunning) {
      isTimerRunning = false;
      clearInterval(timerInterval);
      saveTimerState();
    }
  }

  function resetTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timeRemaining = 25 * 60;
    updateTimerDisplay();
    saveTimerState();
  }

  function startTimerInterval() {
    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();
      saveTimerState();

      if (timeRemaining <= 0) {
        // Timer finished
        isTimerRunning = false;
        clearInterval(timerInterval);
        timeRemaining = 25 * 60;
        updateTimerDisplay();
        saveTimerState();
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Focus Session Complete!',
          message: 'Great job! Take a short break before your next focus session.'
        });
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function saveTimerState() {
    chrome.storage.sync.set({
      timerState: {
        timeRemaining: timeRemaining,
        isRunning: isTimerRunning
      }
    });
  }
});
