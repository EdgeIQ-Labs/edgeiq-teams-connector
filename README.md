# EdgeIQ Microsoft Teams Connector

Security scanning inside Microsoft Teams. Mention the bot with a repo URL, get an Adaptive Card back with grade badge and findings.

## Setup

### 1. Deploy the Webhook Server

```bash
export EDGEIQ_API_KEY="eiq_live_..."
node index.js
```

Expose via HTTPS (ngrok, Cloudflare Tunnel, or your hosting).

### 2. Create Teams App

1. Open [Teams Developer Portal](https://dev.teams.microsoft.com/) → Apps → Create
2. Name it "EdgeIQ Security Scanner"
3. Go to **Bot** → Add bot → set messaging endpoint to `https://your-server.com/`
4. Under **Scopes**, enable Personal, Team, Group Chat
5. Go to **App features** → Bot → ensure it can receive messages
6. **Publish** → install to your org or sideload for testing

### 3. Use It

In any Teams channel or DM:
```
@EdgeIQ Scanner https://github.com/myorg/myrepo
```

The bot responds with a rich Adaptive Card showing the security grade, individual findings with severity badges, and action buttons linking to the full report and API key signup.

## Adaptive Card Preview

The card includes:
- Large header with grade + score
- Repository URL subtitle
- Findings table with severity colors (High=red, Medium=yellow, Low=default)
- Action buttons: "View Full Report" + "Get API Key"

## Pricing

Free tier (10 req/min) for light usage. Pro ($19/mo) for enterprise teams.

- [Get API Key](https://edgeiqlabs.com/developers/)

Built by [EdgeIQ Labs](https://edgeiqlabs.com)
