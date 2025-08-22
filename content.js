(function() {
  chrome.storage.sync.get(['focusMode', 'blockedWebsites'], (result) => {
    if (!result.focusMode || !result.blockedWebsites) return;
    
    const currentDomain = window.location.hostname.toLowerCase().replace(/^www\./, '');
    const isBlocked = result.blockedWebsites.some(site => 
      currentDomain === site || currentDomain.endsWith('.' + site)
    );
    
    if (isBlocked) {
      showBlockPage();
    }
  });

  function showBlockPage() {
    document.documentElement.innerHTML = '';
    
    const blockPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Focus Mode - Site Blocked</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          
          .block-container {
            max-width: 600px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          
          .block-icon {
            font-size: 80px;
            margin-bottom: 20px;
            opacity: 0.8;
          }
          
          .block-title {
            font-size: 36px;
            font-weight: 300;
            margin-bottom: 15px;
          }
          
          .block-subtitle {
            font-size: 18px;
            margin-bottom: 30px;
            opacity: 0.8;
          }
          
          .blocked-site {
            font-size: 24px;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.2);
            padding: 15px 25px;
            border-radius: 10px;
            margin: 20px 0;
            word-break: break-all;
          }
          
          .motivational-text {
            font-size: 16px;
            margin: 25px 0;
            line-height: 1.6;
            opacity: 0.9;
          }
          
          .action-buttons {
            margin-top: 30px;
          }
          
          .btn {
            display: inline-block;
            padding: 12px 25px;
            margin: 0 10px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
            cursor: pointer;
            font-size: 14px;
          }
          
          .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
          }
          
          .btn-primary {
            background: #4CAF50;
            border-color: #4CAF50;
          }
          
          .btn-primary:hover {
            background: #45a049;
            border-color: #45a049;
          }
          
          .stats {
            margin-top: 30px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
          }
          
          .stats-title {
            font-size: 16px;
            margin-bottom: 15px;
            opacity: 0.8;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
          }
          
          .stat-item {
            text-align: center;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
          }
          
          .stat-label {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 5px;
          }
          
          .alternatives {
            margin-top: 25px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          
          .alternatives-title {
            font-size: 16px;
            margin-bottom: 15px;
          }
          
          .alternatives-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
          }
          
          .alternative-item {
            padding: 8px 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .alternative-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .block-container {
            animation: fadeIn 0.6s ease-out;
          }
          
          @media (max-width: 768px) {
            .block-container {
              margin: 20px;
              padding: 30px 20px;
            }
            
            .block-title {
              font-size: 28px;
            }
            
            .blocked-site {
              font-size: 18px;
              padding: 12px 20px;
            }
            
            .btn {
              display: block;
              margin: 10px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="block-container">
          <div class="block-icon">🎯</div>
          <h1 class="block-title">Stay Focused!</h1>
          <p class="block-subtitle">This website is blocked during your focus session</p>
          
          <div class="blocked-site" id="blockedSite">${window.location.hostname}</div>
          
          <div class="motivational-text">
            <p>Great job staying on track! Every moment of focus brings you closer to your goals. 
            Use this time to work on something meaningful instead.</p>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="goToProductiveSite()">Go to Productive Site</button>
            <button class="btn" onclick="openFocusTimer()">Start Focus Timer</button>
            <button class="btn" onclick="history.back()">Go Back</button>
          </div>
          
          <div class="stats">
            <div class="stats-title">Today's Focus Stats</div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number" id="blockedCount">0</div>
                <div class="stat-label">Sites Blocked</div>
              </div>
              <div class="stat-item">
                <div class="stat-number" id="focusTime">0</div>
                <div class="stat-label">Focus Minutes</div>
              </div>
              <div class="stat-item">
                <div class="stat-number" id="streak">0</div>
                <div class="stat-label">Day Streak</div>
              </div>
            </div>
          </div>
          
          <div class="alternatives">
            <div class="alternatives-title">Try these productive alternatives:</div>
            <div class="alternatives-list">
              <div class="alternative-item" onclick="window.location.href='https://todoist.com'">📝 Todoist</div>
              <div class="alternative-item" onclick="window.location.href='https://notion.so'">📚 Notion</div>
              <div class="alternative-item" onclick="window.location.href='https://github.com'">💻 GitHub</div>
              <div class="alternative-item" onclick="window.location.href='https://stackoverflow.com'">🔧 Stack Overflow</div>
              <div class="alternative-item" onclick="window.location.href='https://coursera.org'">🎓 Coursera</div>
              <div class="alternative-item" onclick="window.location.href='https://medium.com'">📖 Medium</div>
            </div>
          </div>
        </div>
        
        <script>
          // Load and display stats
          chrome.storage.sync.get(['focusStats'], (result) => {
            const stats = result.focusStats || { blockedCount: 0, focusTime: 0, streak: 0 };
            document.getElementById('blockedCount').textContent = stats.blockedCount || 0;
            document.getElementById('focusTime').textContent = stats.focusTime || 0;
            document.getElementById('streak').textContent = stats.streak || 0;
          });
          
          // Update blocked count
          chrome.storage.sync.get(['focusStats'], (result) => {
            const stats = result.focusStats || {};
            stats.blockedCount = (stats.blockedCount || 0) + 1;
            chrome.storage.sync.set({ focusStats: stats });
          });
          
          function goToProductiveSite() {
            const productiveSites = [
              'https://todoist.com',
              'https://notion.so',
              'https://github.com',
              'https://stackoverflow.com',
              'https://coursera.org'
            ];
            const randomSite = productiveSites[Math.floor(Math.random() * productiveSites.length)];
            window.location.href = randomSite;
          }
          
          function openFocusTimer() {
            // This would ideally open the extension popup, but we'll redirect to a focus app
            window.location.href = 'https://pomofocus.io';
          }
          
          // Add some interactive elements
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              history.back();
            }
          });
          
          // Add motivational quotes rotation
          const quotes = [
            "The successful warrior is the average person with laser-like focus. - Bruce Lee",
            "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus. - Alexander Graham Bell",
            "Focus is a matter of deciding what things you're not going to do. - John Carmack",
            "The art of being wise is knowing what to overlook. - William James",
            "It is during our darkest moments that we must focus to see the light. - Aristotle"
          ];
          
          setInterval(() => {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            document.querySelector('.motivational-text p').textContent = randomQuote;
          }, 10000);
        </script>
      </body>
      </html>
    `;
    
    document.open();
    document.write(blockPage);
    document.close();
  }
})();
