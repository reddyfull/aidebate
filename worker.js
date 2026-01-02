export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    // Serve the main app
    return new Response(getHTML(), {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  },
};

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏛️ AI Council Debate System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --bg-primary: #0f0f0f;
      --bg-secondary: #1a1a1a;
      --bg-tertiary: #262626;
      --bg-hover: #2f2f2f;
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --text-muted: #666666;
      --border-color: #333333;
      --accent-purple: #8b5cf6;
      --accent-blue: #3b82f6;
      --accent-green: #10b981;
      --accent-pink: #ec4899;
      --sidebar-width: 280px;
      --activity-width: 320px;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      height: 100vh;
      overflow: hidden;
    }
    
    /* ===== LAYOUT ===== */
    .app-container {
      display: flex;
      height: 100vh;
    }
    
    /* ===== LEFT SIDEBAR - Chat History ===== */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    
    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .new-chat-btn {
      width: 100%;
      padding: 12px 16px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    
    .new-chat-btn:hover {
      background: var(--bg-hover);
    }
    
    .chat-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    
    .chat-list-header {
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .chat-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 2px;
      transition: background 0.2s;
    }
    
    .chat-item:hover {
      background: var(--bg-tertiary);
    }
    
    .chat-item.active {
      background: var(--bg-tertiary);
    }
    
    .chat-item-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }
    
    .chat-item-meta {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .chat-item-delete {
      opacity: 0;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      margin-left: auto;
    }
    
    .chat-item:hover .chat-item-delete {
      opacity: 1;
    }
    
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border-color);
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
    }
    
    /* ===== MAIN CHAT AREA ===== */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    
    .chat-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .chat-title {
      font-size: 16px;
      font-weight: 600;
    }
    
    .model-badges {
      display: flex;
      gap: 8px;
    }
    
    .model-badge {
      padding: 4px 10px;
      background: var(--bg-tertiary);
      border-radius: 12px;
      font-size: 12px;
    }
    
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    
    .welcome-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 40px;
    }
    
    .welcome-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }
    
    .welcome-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .welcome-subtitle {
      font-size: 16px;
      color: var(--text-secondary);
      max-width: 500px;
      line-height: 1.6;
    }
    
    .message {
      margin-bottom: 24px;
      max-width: 800px;
    }
    
    .message-user {
      display: flex;
      justify-content: flex-end;
    }
    
    .message-user .message-content {
      background: var(--accent-purple);
      border-radius: 18px 18px 4px 18px;
      padding: 12px 18px;
      max-width: 70%;
    }
    
    .message-assistant {
      display: flex;
      gap: 12px;
    }
    
    .message-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    
    .message-assistant .message-content {
      flex: 1;
      background: var(--bg-secondary);
      border-radius: 4px 18px 18px 18px;
      padding: 16px 20px;
      line-height: 1.7;
    }
    
    .message-content h1, .message-content h2, .message-content h3 {
      margin: 16px 0 8px 0;
    }
    
    .message-content h1 { font-size: 20px; }
    .message-content h2 { font-size: 18px; }
    .message-content h3 { font-size: 16px; }
    
    .message-content p { margin-bottom: 12px; }
    
    .message-content ul, .message-content ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    .message-content li { margin-bottom: 6px; }
    
    .message-content code {
      background: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', monospace;
      font-size: 13px;
    }
    
    .message-content pre {
      background: var(--bg-tertiary);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
    }
    
    .message-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }
    
    .message-content th, .message-content td {
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      text-align: left;
    }
    
    .message-content th { background: var(--bg-tertiary); }
    
    .message-stats {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .stat-value {
      font-weight: 600;
      color: var(--accent-green);
    }
    
    /* Input Area */
    .input-container {
      padding: 16px 24px 24px;
      border-top: 1px solid var(--border-color);
    }
    
    .input-wrapper {
      display: flex;
      gap: 12px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .message-input {
      flex: 1;
      padding: 14px 18px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      color: var(--text-primary);
      font-size: 15px;
      font-family: inherit;
      resize: none;
      min-height: 52px;
      max-height: 200px;
    }
    
    .message-input:focus {
      outline: none;
      border-color: var(--accent-purple);
    }
    
    .message-input::placeholder { color: var(--text-muted); }
    
    .send-btn {
      padding: 14px 24px;
      background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s;
    }
    
    .send-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    /* ===== RIGHT PANEL - Activity/Sources ===== */
    .activity-panel {
      width: var(--activity-width);
      background: var(--bg-secondary);
      border-left: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 0.3s;
    }
    
    .activity-panel.collapsed {
      width: 0;
      overflow: hidden;
    }
    
    .activity-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .activity-title {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .activity-toggle {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      font-size: 16px;
    }
    
    .activity-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    
    .activity-section { margin-bottom: 24px; }
    
    .activity-section-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    .activity-item {
      background: var(--bg-tertiary);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
    }
    
    .activity-item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    
    .activity-icon { font-size: 16px; }
    .activity-label { font-size: 13px; font-weight: 500; }
    .activity-time { font-size: 11px; color: var(--text-muted); margin-left: auto; }
    
    .activity-description {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    .source-item {
      background: var(--bg-tertiary);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      border-left: 3px solid var(--accent-purple);
    }
    
    .source-model {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .source-model-icon { font-size: 18px; }
    .source-model-name { font-size: 13px; font-weight: 600; }
    .source-model-role { font-size: 11px; color: var(--text-muted); margin-left: auto; }
    
    .source-contribution {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    /* Loading States */
    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: 12px;
      margin-bottom: 16px;
    }
    
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-top-color: var(--accent-purple);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .loading-text { font-size: 14px; color: var(--text-secondary); }
    
    .thinking-dots { display: flex; gap: 4px; }
    
    .thinking-dots span {
      width: 6px;
      height: 6px;
      background: var(--accent-purple);
      border-radius: 50%;
      animation: bounce 1.4s ease-in-out infinite;
    }
    
    .thinking-dots span:nth-child(1) { animation-delay: 0s; }
    .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
    
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
    }
    
    .empty-state-icon { font-size: 48px; margin-bottom: 16px; }
    
    /* Responsive */
    @media (max-width: 1200px) {
      .activity-panel { display: none; }
    }
    
    @media (max-width: 768px) {
      .sidebar { display: none; }
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Left Sidebar - Chat History -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <button class="new-chat-btn" onclick="startNewChat()">
          <span>✨</span> New Debate
        </button>
      </div>
      
      <div class="chat-list">
        <div class="chat-list-header">Recent Debates</div>
        <div id="chatList">
          <div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <p>No conversations yet</p>
          </div>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <p>🏛️ AI Council Debate System</p>
        <p style="margin-top: 4px;">5 AI Models Collaborating</p>
      </div>
    </aside>
    
    <!-- Main Chat Area -->
    <main class="main-content">
      <header class="chat-header">
        <h1 class="chat-title" id="chatTitle">New Debate</h1>
        <div class="model-badges">
          <span class="model-badge">🧠 GPT-4o</span>
          <span class="model-badge">🔍 Gemini</span>
          <span class="model-badge">😈 Grok</span>
          <span class="model-badge">🔬 DeepSeek</span>
          <span class="model-badge">🎨 Llama</span>
        </div>
      </header>
      
      <div class="messages-container" id="messagesContainer">
        <div class="welcome-screen" id="welcomeScreen">
          <div class="welcome-icon">🏛️</div>
          <h2 class="welcome-title">AI Council Debate System</h2>
          <p class="welcome-subtitle">
            Submit any topic and watch 5 frontier AI models engage in structured academic debate. 
            They'll analyze, challenge, and synthesize perspectives to deliver high-consensus recommendations.
          </p>
        </div>
      </div>
      
      <div class="input-container">
        <div class="input-wrapper">
          <textarea 
            class="message-input" 
            id="messageInput" 
            placeholder="Enter a topic for the AI Council to debate..."
            rows="1"
            onkeydown="handleKeyDown(event)"
          ></textarea>
          <button class="send-btn" id="sendBtn" onclick="sendMessage()">Send</button>
        </div>
      </div>
    </main>
    
    <!-- Right Panel - Activity/Sources -->
    <aside class="activity-panel" id="activityPanel">
      <div class="activity-header">
        <span class="activity-title"><span>📊</span> Activity</span>
        <button class="activity-toggle" onclick="toggleActivity()">✕</button>
      </div>
      
      <div class="activity-content" id="activityContent">
        <div class="empty-state">
          <div class="empty-state-icon">⏳</div>
          <p>Activity will appear here during debates</p>
        </div>
      </div>
    </aside>
  </div>

  <script>
    // ===== STATE =====
    let currentSessionId = null;
    let currentConversationId = null;
    let conversations = [];
    let isLoading = false;
    
    const N8N_BASE = 'https://reddyfull.app.n8n.cloud/webhook';
    
    // ===== INITIALIZATION =====
    document.addEventListener('DOMContentLoaded', () => {
      loadConversations();
      autoResizeTextarea();
    });
    
    // ===== CHAT FUNCTIONS =====
    function startNewChat() {
      currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      currentConversationId = null;
      
      document.getElementById('messagesContainer').innerHTML = 
        '<div class="welcome-screen" id="welcomeScreen">' +
        '<div class="welcome-icon">🏛️</div>' +
        '<h2 class="welcome-title">AI Council Debate System</h2>' +
        '<p class="welcome-subtitle">Submit any topic and watch 5 frontier AI models engage in structured academic debate.</p>' +
        '</div>';
      
      document.getElementById('chatTitle').textContent = 'New Debate';
      clearActivity();
      document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    }
    
    async function sendMessage() {
      const input = document.getElementById('messageInput');
      const message = input.value.trim();
      
      if (!message || isLoading) return;
      
      isLoading = true;
      document.getElementById('sendBtn').disabled = true;
      
      // Hide welcome screen
      const welcomeScreen = document.getElementById('welcomeScreen');
      if (welcomeScreen) welcomeScreen.remove();
      
      // Add user message
      addMessage('user', message);
      input.value = '';
      autoResizeTextarea();
      
      // Show loading with activity
      showLoading();
      
      // Generate session ID if needed
      if (!currentSessionId) {
        currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
      
      try {
        // Call n8n debate API
        const response = await fetch(N8N_BASE + '/ai-debate-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            sessionId: currentSessionId,
            conversationId: currentConversationId
          })
        });
        
        const data = await response.json();
        
        hideLoading();
        
        // Add assistant message
        addMessage('assistant', data.output || data.response || 'No response received', data);
        
        // Update activity panel with sources
        if (data.sources || data.activity) {
          updateActivity(data);
        }
        
        // Update conversation ID and title
        if (data.conversation_id) {
          currentConversationId = data.conversation_id;
        }
        
        if (data.title) {
          document.getElementById('chatTitle').textContent = data.title;
        }
        
        // Refresh conversation list
        loadConversations();
        
      } catch (error) {
        console.error('Error:', error);
        hideLoading();
        addMessage('assistant', '❌ Error communicating with AI Council. Please try again.');
      }
      
      isLoading = false;
      document.getElementById('sendBtn').disabled = false;
    }
    
    function addMessage(role, content, data = {}) {
      const container = document.getElementById('messagesContainer');
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message message-' + role;
      
      if (role === 'user') {
        messageDiv.innerHTML = '<div class="message-content">' + escapeHtml(content) + '</div>';
      } else {
        // Parse stats from content if available
        const stats = data.stats || parseStatsFromContent(content);
        const statsHtml = stats ? 
          '<div class="message-stats">' +
          '<span class="stat-item">📊 Consensus: <span class="stat-value">' + (stats.consensus || 0) + '%</span></span>' +
          '<span class="stat-item">🔄 Rounds: <span class="stat-value">' + (stats.rounds || 0) + '</span></span>' +
          '<span class="stat-item">✅ Decisions: <span class="stat-value">' + (stats.decisions || 0) + '</span></span>' +
          '</div>' : '';
        
        messageDiv.innerHTML = 
          '<div class="message-avatar">🏛️</div>' +
          '<div class="message-content">' + formatMarkdown(content) + statsHtml + '</div>';
      }
      
      container.appendChild(messageDiv);
      container.scrollTop = container.scrollHeight;
    }
    
    // ===== LOADING STATES =====
    function showLoading() {
      const container = document.getElementById('messagesContainer');
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'loadingIndicator';
      loadingDiv.className = 'loading-indicator';
      loadingDiv.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">AI Council is debating...</div>';
      container.appendChild(loadingDiv);
      container.scrollTop = container.scrollHeight;
      updateActivityLoading();
    }
    
    function hideLoading() {
      const loading = document.getElementById('loadingIndicator');
      if (loading) loading.remove();
    }
    
    // ===== ACTIVITY PANEL =====
    function updateActivityLoading() {
      const content = document.getElementById('activityContent');
      content.innerHTML = 
        '<div class="activity-section">' +
        '<div class="activity-section-title">Current Activity</div>' +
        '<div class="activity-item"><div class="activity-item-header"><span class="activity-icon">🤔</span><span class="activity-label">Thinking</span><span class="activity-time">Just now</span></div><div class="activity-description">Analyzing your request and preparing the debate...</div></div>' +
        '<div class="activity-item"><div class="activity-item-header"><span class="activity-icon">📝</span><span class="activity-label">Proposal</span><div class="thinking-dots"><span></span><span></span><span></span></div></div><div class="activity-description">Generating initial proposal with GPT-4o...</div></div>' +
        '<div class="activity-item"><div class="activity-item-header"><span class="activity-icon">🗣️</span><span class="activity-label">Debate</span><div class="thinking-dots"><span></span><span></span><span></span></div></div><div class="activity-description">5 AI models analyzing and debating...</div></div>' +
        '</div>';
    }
    
    function updateActivity(data) {
      const content = document.getElementById('activityContent');
      let html = '';
      
      // Activity section
      if (data.activity && data.activity.length > 0) {
        html += '<div class="activity-section"><div class="activity-section-title">Process Timeline</div>';
        data.activity.forEach(function(item) {
          const icon = getActivityIcon(item.type);
          const time = item.duration_ms ? (item.duration_ms / 1000).toFixed(1) + 's' : '';
          html += '<div class="activity-item"><div class="activity-item-header"><span class="activity-icon">' + icon + '</span><span class="activity-label">' + item.type + '</span><span class="activity-time">' + time + '</span></div><div class="activity-description">' + (item.content || '') + '</div></div>';
        });
        html += '</div>';
      }
      
      // Sources section
      if (data.sources && data.sources.length > 0) {
        html += '<div class="activity-section"><div class="activity-section-title">AI Model Contributions</div>';
        data.sources.forEach(function(source) {
          html += '<div class="source-item"><div class="source-model"><span class="source-model-icon">' + (source.icon || '🤖') + '</span><span class="source-model-name">' + (source.model || source.model_name || 'AI Model') + '</span><span class="source-model-role">' + (source.role || source.model_role || '') + '</span></div><div class="source-contribution">' + (source.contribution || '') + '</div></div>';
        });
        html += '</div>';
      }
      
      // Stats section
      if (data.stats) {
        html += '<div class="activity-section"><div class="activity-section-title">Debate Statistics</div>';
        html += '<div class="activity-item"><div class="activity-item-header"><span class="activity-icon">📊</span><span class="activity-label">Final Consensus</span><span class="activity-time">' + (data.stats.consensus || 0) + '%</span></div><div class="activity-description">' + (data.stats.rounds || 0) + ' debate rounds, ' + (data.stats.decisions || 0) + ' decisions made</div></div>';
        html += '</div>';
      }
      
      if (!html) {
        html = '<div class="empty-state"><div class="empty-state-icon">✅</div><p>Debate completed</p></div>';
      }
      
      content.innerHTML = html;
    }
    
    function clearActivity() {
      document.getElementById('activityContent').innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><p>Activity will appear here during debates</p></div>';
    }
    
    function getActivityIcon(type) {
      const icons = { 'thinking': '🤔', 'proposal': '📝', 'debate': '🗣️', 'consensus': '🤝', 'synthesis': '📄', 'decision': '✅', 'error': '❌' };
      return icons[type] || '📌';
    }
    
    function toggleActivity() {
      document.getElementById('activityPanel').classList.toggle('collapsed');
    }
    
    // ===== CONVERSATION LIST =====
    async function loadConversations() {
      try {
        const response = await fetch(N8N_BASE + '/ai-debate-conversations');
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();
        conversations = data.conversations || data || [];
        renderConversationList();
      } catch (error) {
        console.log('Conversations not available yet');
      }
    }
    
    function renderConversationList() {
      const container = document.getElementById('chatList');
      
      if (!conversations || conversations.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💬</div><p>No conversations yet</p></div>';
        return;
      }
      
      container.innerHTML = conversations.map(function(conv) {
        return '<div class="chat-item ' + (conv.id === currentConversationId ? 'active' : '') + '" onclick="loadConversation(\\'' + conv.id + '\\')">' +
          '<div class="chat-item-title">' + escapeHtml(conv.title || 'Untitled Debate') + '</div>' +
          '<div class="chat-item-meta">' +
          '<span>📊 ' + (conv.consensus_score || 0) + '%</span>' +
          '<span>' + formatDate(conv.updated_at) + '</span>' +
          '<button class="chat-item-delete" onclick="event.stopPropagation(); deleteConversation(\\'' + conv.id + '\\')">🗑️</button>' +
          '</div></div>';
      }).join('');
    }
    
    async function loadConversation(conversationId) {
      try {
        const response = await fetch(N8N_BASE + '/ai-debate-conversation/' + conversationId);
        const data = await response.json();
        
        currentConversationId = conversationId;
        currentSessionId = data.session_id;
        
        document.getElementById('chatTitle').textContent = data.title || 'Debate';
        
        // Clear and render messages
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach(function(msg) {
            addMessage(msg.role, msg.content, msg);
          });
        }
        
        // Update active state
        document.querySelectorAll('.chat-item').forEach(function(item) { item.classList.remove('active'); });
        
        // Update activity panel with latest sources
        if (data.sources) {
          updateActivity({ sources: data.sources, stats: { consensus: data.consensus_score } });
        }
        
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    }
    
    async function deleteConversation(conversationId) {
      if (!confirm('Delete this conversation?')) return;
      
      try {
        await fetch(N8N_BASE + '/ai-debate-conversation/' + conversationId, { method: 'DELETE' });
        if (currentConversationId === conversationId) startNewChat();
        loadConversations();
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
    
    // ===== UTILITIES =====
    function handleKeyDown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }
    
    function autoResizeTextarea() {
      const textarea = document.getElementById('messageInput');
      textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
      });
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function formatMarkdown(text) {
      return text
        .replace(/\\*\\*\\*(.*?)\\*\\*\\*/g, '<strong><em>$1</em></strong>')
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\\n\\n/g, '</p><p>')
        .replace(/\\n/g, '<br>');
    }
    
    function parseStatsFromContent(content) {
      const match = content.match(/📊.*?(\\d+)%.*?consensus.*?(\\d+).*?round.*?(\\d+).*?decision/i);
      if (match) return { consensus: match[1], rounds: match[2], decisions: match[3] };
      return null;
    }
    
    function formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
      if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
      return date.toLocaleDateString();
    }
  </script>
</body>
</html>`;
}
