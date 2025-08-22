document.addEventListener('DOMContentLoaded', function() {
  // Get all the elements
  const autoEnableToggle = document.getElementById('autoEnable');
  const showNotificationsToggle = document.getElementById('showNotifications');
  const strictModeToggle = document.getElementById('strictMode');
  const defaultDurationInput = document.getElementById('defaultDuration');
  const newWebsiteInput = document.getElementById('newWebsite');
  const addWebsiteBtn = document.getElementById('addWebsiteBtn');
  const websiteList = document.getElementById('websiteList');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const resetBtn = document.getElementById('resetBtn');
  const resetStatsBtn = document.getElementById('resetStatsBtn');
  const enableScheduleToggle = document.getElementById('enableSchedule');
  const scheduleGrid = document.getElementById('scheduleGrid');

  // Load settings
  loadSettings();
  loadWebsites();
  loadStats();
  createScheduleGrid();

  // Event listeners
  autoEnableToggle.addEventListener('change', saveSettings);
  showNotificationsToggle.addEventListener('change', saveSettings);
  strictModeToggle.addEventListener('change', saveSettings);
  defaultDurationInput.addEventListener('change', saveSettings);
  enableScheduleToggle.addEventListener('change', saveSettings);

  addWebsiteBtn.addEventListener('click', addWebsite);
  newWebsiteInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addWebsite();
  });

  exportBtn.addEventListener('click', exportSettings);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', importSettings);
  resetBtn.addEventListener('click', resetToDefaults);
  resetStatsBtn.addEventListener('click', resetStats);

  function loadSettings() {
    chrome.storage.sync.get([
      'autoEnable',
      'showNotifications', 
      'strictMode',
      'defaultDuration',
      'enableSchedule',
      'focusSchedule'
    ], function(result) {
      autoEnableToggle.checked = result.autoEnable || false;
      showNotificationsToggle.checked = result.showNotifications !== false;
      strictModeToggle.checked = result.strictMode || false;
      defaultDurationInput.value = result.defaultDuration || 25;
      enableScheduleToggle.checked = result.enableSchedule || false;
      
      if (result.focusSchedule) {
        populateSchedule(result.focusSchedule);
      }
    });
  }

  function saveSettings() {
    const settings = {
      autoEnable: autoEnableToggle.checked,
      showNotifications: showNotificationsToggle.checked,
      strictMode: strictModeToggle.checked,
      defaultDuration: parseInt(defaultDurationInput.value),
      enableSchedule: enableScheduleToggle.checked
    };

    chrome.storage.sync.set(settings);
    
    // Save schedule if enabled
    if (enableScheduleToggle.checked) {
      saveSchedule();
    }
  }

  function loadWebsites() {
    chrome.storage.sync.get(['blockedWebsites'], function(result) {
      const websites = result.blockedWebsites || [];
      displayWebsites(websites);
    });
  }

  function displayWebsites(websites) {
    websiteList.innerHTML = '';
    
    if (websites.length === 0) {
      websiteList.innerHTML = '<div style="text-align: center; opacity: 0.5;">No blocked websites</div>';
      return;
    }

    websites.forEach(website => {
      const item = document.createElement('div');
      item.className = 'website-item';
      item.innerHTML = `
        <span>${website}</span>
        <button class="remove-btn" data-website="${website}">Remove</button>
      `;
      websiteList.appendChild(item);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        removeWebsite(this.dataset.website);
      });
    });
  }

  function addWebsite() {
    const website = newWebsiteInput.value.trim();
    if (!website) return;

    const cleanWebsite = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    chrome.storage.sync.get(['blockedWebsites'], function(result) {
      const websites = result.blockedWebsites || [];
      
      if (!websites.includes(cleanWebsite)) {
        websites.push(cleanWebsite);
        chrome.storage.sync.set({ blockedWebsites: websites });
        displayWebsites(websites);
        
        // Update background script
        chrome.runtime.sendMessage({
          action: 'updateBlockedSites',
          websites: websites
        });
      }
    });

    newWebsiteInput.value = '';
  }

  function removeWebsite(website) {
    chrome.storage.sync.get(['blockedWebsites'], function(result) {
      const websites = result.blockedWebsites || [];
      const updatedWebsites = websites.filter(site => site !== website);
      
      chrome.storage.sync.set({ blockedWebsites: updatedWebsites });
      displayWebsites(updatedWebsites);
      
      // Update background script
      chrome.runtime.sendMessage({
        action: 'updateBlockedSites',
        websites: updatedWebsites
      });
    });
  }

  function loadStats() {
    chrome.storage.sync.get(['focusStats'], function(result) {
      const stats = result.focusStats || {};
      
      document.getElementById('totalBlocked').textContent = stats.blockedCount || 0;
      document.getElementById('totalFocusTime').textContent = stats.focusTime || 0;
      document.getElementById('currentStreak').textContent = stats.streak || 0;
      document.getElementById('longestStreak').textContent = stats.longestStreak || 0;
    });
  }

  function resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      chrome.storage.sync.set({ focusStats: {} });
      loadStats();
    }
  }

  function createScheduleGrid() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    scheduleGrid.innerHTML = '';

    days.forEach(day => {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day-schedule';
      dayDiv.innerHTML = `
        <div class="day-name">${day}</div>
        <input type="time" class="time-input" data-day="${day}" data-type="start" value="09:00">
        <input type="time" class="time-input" data-day="${day}" data-type="end" value="17:00">
        <label style="font-size: 12px; margin-top: 5px; display: block;">
          <input type="checkbox" data-day="${day}" data-type="enabled" checked> Enabled
        </label>
      `;
      scheduleGrid.appendChild(dayDiv);
    });

    // Add event listeners for schedule changes
    scheduleGrid.addEventListener('change', saveSchedule);
  }

  function populateSchedule(schedule) {
    Object.keys(schedule).forEach(day => {
      const daySchedule = schedule[day];
      const startInput = document.querySelector(`[data-day="${day}"][data-type="start"]`);
      const endInput = document.querySelector(`[data-day="${day}"][data-type="end"]`);
      const enabledInput = document.querySelector(`[data-day="${day}"][data-type="enabled"]`);

      if (startInput) startInput.value = daySchedule.start || '09:00';
      if (endInput) endInput.value = daySchedule.end || '17:00';
      if (enabledInput) enabledInput.checked = daySchedule.enabled !== false;
    });
  }

  function saveSchedule() {
    const schedule = {};
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    days.forEach(day => {
      const startInput = document.querySelector(`[data-day="${day}"][data-type="start"]`);
      const endInput = document.querySelector(`[data-day="${day}"][data-type="end"]`);
      const enabledInput = document.querySelector(`[data-day="${day}"][data-type="enabled"]`);

      schedule[day] = {
        start: startInput.value,
        end: endInput.value,
        enabled: enabledInput.checked
      };
    });

    chrome.storage.sync.set({ focusSchedule: schedule });
  }

  function exportSettings() {
    chrome.storage.sync.get(null, function(data) {
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focus-mode-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function importSettings() {
    const file = importFile.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        
        if (confirm('This will replace all current settings. Are you sure?')) {
          chrome.storage.sync.set(data, function() {
            loadSettings();
            loadWebsites();
            loadStats();
            alert('Settings imported successfully!');
          });
        }
      } catch (error) {
        alert('Error importing settings: Invalid file format');
      }
    };
    reader.readAsText(file);
  }

  function resetToDefaults() {
    if (confirm('This will reset all settings to defaults. Are you sure?')) {
      const defaultSettings = {
        focusMode: false,
        autoEnable: false,
        showNotifications: true,
        strictMode: false,
        defaultDuration: 25,
        enableSchedule: false,
        blockedWebsites: [
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
        ]
      };

      chrome.storage.sync.set(defaultSettings, function() {
        loadSettings();
        loadWebsites();
        alert('Settings reset to defaults!');
      });
    }
  }
});
