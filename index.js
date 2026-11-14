const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;
const EDGEIQ_API_KEY = process.env.EDGEIQ_API_KEY || '';

async function runScan(url) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ url });
    const req = https.request({
      hostname: 'edgeiqlabs.com', path: '/api/v1/repo-scan', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${EDGEIQ_API_KEY}`, 'Content-Length': data.length }
    }, (res) => {
      let body = ''; res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

function buildAdaptiveCard(result, scanUrl) {
  const grade = result.grade || 'N/A';
  const score = result.score || 0;
  const findings = (result.findings || []).slice(0, 5);
  const items = findings.map(f => ({
    type: 'ColumnSet', columns: [
      { type: 'Column', width: 'auto', items: [{ type: 'TextBlock', text: (f.severity||f.level||'info').toUpperCase(), weight: 'Bolder', color: (f.severity||'').toLowerCase()==='high'?'Attention':'Default' }] },
      { type: 'Column', width: 'stretch', items: [{ type: 'TextBlock', text: f.description||f.message||f.name||'Unknown', wrap: true }] }
    ]
  }));
  return {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard', version: '1.4',
        body: [
          { type: 'TextBlock', text: `EdgeIQ Security Scan: Grade ${grade} (${score}/100)`, size: 'Large', weight: 'Bolder' },
          { type: 'TextBlock', text: `Repository: ${scanUrl}`, spacing: 'None', isSubtle: true },
          { type: 'TextBlock', text: 'Findings:', weight: 'Bolder', spacing: 'Medium' },
          ...items,
          { type: 'ActionSet', actions: [
            { type: 'Action.OpenUrl', title: 'View Full Report', url: `https://edgeiqlabs.com/free-repo-scanner/?url=${encodeURIComponent(scanUrl)}` },
            { type: 'Action.OpenUrl', title: 'Get API Key', url: 'https://edgeiqlabs.com/developers/' }
          ]}
        ]
      }
    }]
  };
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') { res.writeHead(200); res.end('ok'); return; }
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
  let body = ''; req.on('data', c => body += c);
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body);
      const text = payload.text || '';
      const match = text.match(/https?:\/\/[^\s]+/);
      if (!match) { res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({type:'message',text:'Usage: @EdgeIQ Scanner https://github.com/org/repo'})); return; }
      const scanUrl = match[0];
      const result = await runScan(scanUrl);
      const card = buildAdaptiveCard(result, scanUrl);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(card));
    } catch(e) {
      res.writeHead(500,{'Content-Type':'application/json'});
      res.end(JSON.stringify({type:'message',text:'Scan failed. Please try again.'}));
    }
  });
});
server.listen(PORT, () => console.log(`EdgeIQ Teams connector listening on :${PORT}`));
module.exports = { runScan, buildAdaptiveCard };
