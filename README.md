# 🎯 Focus Mode - Website Blocker Chrome Extension

A powerful Chrome extension designed to help you stay focused by blocking distracting websites and social media platforms during work sessions.

## Features

### 🚫 Website Blocking
- **Smart Blocking**: Blocks access to distracting websites when focus mode is enabled
- **Default Block List**: Pre-configured with popular social media and entertainment sites
- **Custom Sites**: Easily add or remove websites from your blocked list
- **Beautiful Block Page**: Shows motivational content instead of blocked sites

### ⏰ Focus Timer
- **Pomodoro Timer**: Built-in 25-minute focus timer (customizable)
- **Session Management**: Start, pause, and reset focus sessions
- **Notifications**: Get notified when focus sessions complete

### 📊 Statistics & Tracking
- **Daily Stats**: Track blocked sites and focus minutes
- **Streak Counter**: Monitor your consistency with daily streaks
- **Progress Visualization**: See your productivity improvements over time

### ⚙️ Advanced Settings
- **Scheduled Focus**: Automatically enable focus mode during work hours
- **Strict Mode**: Prevent disabling focus mode during active sessions
- **Export/Import**: Backup and restore your settings
- **Customizable Duration**: Set your preferred focus session length

### 🎨 Beautiful UI
- **Modern Design**: Gradient backgrounds and smooth animations
- **Responsive Layout**: Works perfectly on all screen sizes
- **Intuitive Controls**: Easy-to-use toggles and buttons

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download the Extension**
   - Download all files from this repository
   - Keep all files in the same folder

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" in the top right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

5. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Focus Mode - Website Blocker"
   - Click the pin icon to keep it visible


### Basic Usage

1. **Enable Focus Mode**
   - Click the extension icon in your toolbar
   - Toggle "Focus Mode" to ON
   - The extension badge will show "ON" when active

2. **Start a Focus Session**
   - Click "Start" on the focus timer
   - Work for the set duration (default: 25 minutes)
   - Get notified when the session completes

3. **Manage Blocked Sites**
   - Add websites by typing them in the input field
   - Remove sites by clicking the "Remove" button
   - Sites are automatically cleaned (removes www, https, etc.)

### Advanced Features

1. **Access Settings**
   - Click "Advanced Settings" in the popup
   - Or right-click the extension icon → Options

2. **Schedule Focus Sessions**
   - Enable "Scheduled Focus" in settings
   - Set work hours for each day of the week
   - Focus mode will automatically activate during these times

3. **Export Your Settings**
   - Go to Options → Export Settings
   - Save your configuration as a JSON file
   - Import on other devices or after reinstalling

## Default Blocked Sites

The extension comes pre-configured with these commonly distracting websites:

- **Social Media**: Facebook, Twitter, Instagram, TikTok, LinkedIn, Snapchat, Pinterest, Tumblr
- **Entertainment**: YouTube, Netflix, Hulu, Disney+, Twitch
- **Shopping**: Amazon, eBay
- **News**: CNN, BBC, BuzzFeed
- **Other**: Reddit, Hacker News

## Customization

### Adding Custom Sites
1. Open the extension popup
2. Type the website domain (e.g., `example.com`)
3. Click "Add" or press Enter
4. The site will be immediately blocked when focus mode is active

### Removing Sites
1. Find the site in your blocked list
2. Click the "Remove" button next to it
3. The site will no longer be blocked

### Changing Timer Duration
1. Go to Options → General Settings
2. Change "Default Focus Duration"
3. Set your preferred time (1-120 minutes)

## Troubleshooting

### Extension Not Working
- Make sure focus mode is enabled (toggle should be ON)
- Check that the website is in your blocked list
- Refresh the page you're trying to block
- Restart Chrome if issues persist

### Sites Still Loading
- Some sites may load briefly before being blocked
- This is normal behavior - the block page will replace the content
- For instant blocking, the extension uses Chrome's declarativeNetRequest API

### Timer Not Working
- Make sure notifications are enabled in Chrome
- Check Chrome's notification permissions for the extension
- The timer continues running even if you close the popup

## Privacy & Permissions

This extension requires these permissions:
- **Storage**: Save your settings and statistics
- **ActiveTab**: Check current website against blocked list
- **DeclarativeNetRequest**: Block websites efficiently
- **Host Permissions**: Access all websites to implement blocking

**Privacy Note**: All data is stored locally on your device. No information is sent to external servers.

**Stay focused and productive! 🎯**
