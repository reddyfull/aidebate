# 🏛️ AI Council Debate System - Full Setup Guide

## Overview

This system provides a ChatGPT-like interface for your AI Debate workflow with:
- **Left Sidebar**: Chat history (saved conversations)
- **Center**: Chat interface with AI responses
- **Right Panel**: Activity log & AI model sources

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Worker                        │
│                  (aikalichat.srinitadipatri.org)            │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      n8n Webhooks                           │
│  POST /ai-debate-chat      - Send message & save to DB      │
│  GET  /ai-debate-conversations - List conversations         │
│  GET  /ai-debate-conversation/:id - Get conversation        │
│  DELETE /ai-debate-conversation/:id - Delete conversation   │
└─────────────────────────────┬───────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Neon DB    │    │   Debate     │    │  OpenRouter  │
│ (ai-debate-  │    │  Workflow    │    │   5 Models   │
│    chat)     │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Setup Steps

### Step 1: Database (Already Done ✅)

Your Neon database `ai-debate-chat` has these tables:
- `conversations` - Chat sessions
- `messages` - Individual messages
- `sources` - AI model contributions
- `activity_log` - Process timeline

### Step 2: Import n8n Workflows

#### 2a. Import Chat API Workflow
1. Go to n8n → Import Workflow
2. Paste the contents of `n8n-chat-api.json`
3. **Update Postgres credentials** in ALL database nodes:
   - Click each Postgres node
   - Select your `ai-debate-chat` credential
4. Save and **Activate** the workflow

#### 2b. Import Conversation API Workflow
1. Go to n8n → Import Workflow
2. Paste the contents of `n8n-conversation-api.json`
3. **Update Postgres credentials** in ALL database nodes
4. Save and **Activate** the workflow

### Step 3: Deploy Cloudflare Worker

```bash
cd aikalichat-main

# Install wrangler if not already
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy
```

### Step 4: Test the System

1. Visit your Cloudflare URL (e.g., `https://aikalichat.srinitadipatri.org`)
2. Type a topic and click Send
3. Watch the Activity panel on the right
4. Your conversation will appear in the left sidebar

---

## API Endpoints

### POST /webhook/ai-debate-chat
Send a message to the debate system.

**Request:**
```json
{
  "message": "Create a business plan for an AI startup",
  "sessionId": "optional-session-id",
  "conversationId": "optional-uuid-for-existing-conversation"
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "session_id": "session_xxx",
  "title": "Create a business plan...",
  "output": "🏛️ **AI Council Debate Complete!**\n\n📊 **Stats:** 85% consensus...",
  "sources": [
    {
      "model": "GPT-4o",
      "icon": "🧠",
      "role": "Primary Analyst",
      "contribution": "Generated initial proposal..."
    },
    ...
  ],
  "activity": [
    {
      "type": "thinking",
      "content": "Analyzing request...",
      "duration_ms": 2000
    },
    ...
  ],
  "stats": {
    "consensus": 85,
    "rounds": 2,
    "decisions": 3
  }
}
```

### GET /webhook/ai-debate-conversations
List all saved conversations.

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "session_id": "session_xxx",
      "title": "AI Governance Framework",
      "created_at": "2025-01-02T12:00:00Z",
      "updated_at": "2025-01-02T12:05:00Z",
      "consensus_score": 88,
      "status": "active"
    }
  ]
}
```

### GET /webhook/ai-debate-conversation/:id
Get a specific conversation with all messages.

**Response:**
```json
{
  "id": "uuid",
  "session_id": "session_xxx",
  "title": "AI Governance Framework",
  "messages": [
    { "role": "user", "content": "Create a governance framework..." },
    { "role": "assistant", "content": "🏛️ **AI Council Debate Complete!**..." }
  ],
  "sources": [...],
  "consensus_score": 88
}
```

### DELETE /webhook/ai-debate-conversation/:id
Delete a conversation and all its messages.

---

## Troubleshooting

### "No conversations yet" in sidebar
- Check that `n8n-conversation-api.json` workflow is active
- Verify Postgres credentials are correct
- Test the endpoint: `curl https://reddyfull.app.n8n.cloud/webhook/ai-debate-conversations`

### Chat returns error
- Check that `n8n-chat-api.json` workflow is active
- Verify the debate workflow is running
- Check n8n execution logs for errors

### Sources not showing in right panel
- The sources are generated from the 5 AI models
- They appear after a successful debate response
- Check that `sources` array is in the API response

---

## Files Included

| File | Description |
|------|-------------|
| `worker.js` | Cloudflare Worker with full ChatGPT-like UI |
| `src/index.js` | Same as worker.js (for compatibility) |
| `wrangler.toml` | Cloudflare deployment config |
| `n8n-chat-api.json` | Main chat endpoint workflow |
| `n8n-conversation-api.json` | Conversation CRUD API workflow |
| `SETUP_GUIDE.md` | This file |

---

## Next Steps

1. **Custom branding**: Edit the CSS in worker.js
2. **Add authentication**: Protect with Cloudflare Access
3. **Enhanced sources**: Modify debate workflow to return actual model outputs
4. **Real-time streaming**: Implement Server-Sent Events for live updates
