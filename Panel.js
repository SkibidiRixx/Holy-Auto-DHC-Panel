const http = require('http');
const url = require('url');
const { parse } = require('querystring');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let dynamicWebhookURL = null; // Webhook URL stored in memory
let logsEnabled = false; // Logs toggle state

// Function to send a message to Discord webhook
async function sendDiscordWebhookMessage(message) {
  if (!logsEnabled || !dynamicWebhookURL) {
    console.log('Logs are disabled or webhook URL is not set.');
    return;
  }

  try {
    await axios.post(dynamicWebhookURL, { content: message });
    console.log('Message sent successfully to webhook.');
  } catch (error) {
    console.error('Error sending message to webhook:', error.response?.data || error.message);
  }
}

// Function to handle API requests
function handleAPIRequest(req, res, body) {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST' && parsedUrl.pathname === '/setConfig') {
    const { webhookURL, enableLogs } = JSON.parse(body);

    if (enableLogs && (!webhookURL || !webhookURL.startsWith('https://discord.com/api/webhooks/'))) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid Webhook URL' }));
      return;
    }

    dynamicWebhookURL = webhookURL || null;
    logsEnabled = enableLogs || false;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Configuration updated successfully.' }));
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/farmAlts') {
    sendDiscordWebhookMessage('STARTED FARMING.')
      .then(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Successfully Started Farming on the Alts.' }));
      })
      .catch(() => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Failed to process request.' }));
      });
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/dropAlts') {
    sendDiscordWebhookMessage('STARTED DROPPING.')
      .then(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Successfully Started Dropping on the Alts.' }));
      })
      .catch(() => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Failed to process request.' }));
      });
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/autoProof') {
    sendDiscordWebhookMessage('AUTO PROOFING ENABLED.')
      .then(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Successfully Enabled Auto Proof.' }));
      })
      .catch(() => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Failed to process request.' }));
      });
    return;
  }

  // Default 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not Found' }));
}

// Function to serve the panel (index.html)
function servePanel(req, res) {
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading panel.');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
}

// Create the server
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    servePanel(req, res); // Serve the HTML panel
  } else if (req.method === 'POST') {
    // Collect POST data
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      handleAPIRequest(req, res, body); // Handle API requests
    });
  } else {
    // Default 404 response for other methods
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
