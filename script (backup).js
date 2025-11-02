let arduinoIP = document.getElementById('device-ip').value;
let connected = false;

// Connect button
document.getElementById('connect-btn').addEventListener('click', () => {
  arduinoIP = `http://${document.getElementById('device-ip').value}`;
  testConnection();
});

async function testConnection() {
  log("Attempting connection...");
  try {
    const res = await fetch(`${arduinoIP}/status`);
    if (res.ok) {
      setStatus(true);
      log("Connected to Arduino at " + arduinoIP);
      updateSensors();
    } else {
      throw new Error("No response");
    }
  } catch {
    setStatus(false);
    log("Connection failed. Check IP or WiFi setup.");
  }
}

function setStatus(isConnected) {
  const statusEl = document.getElementById("connection-status");
  connected = isConnected;
  if (isConnected) {
    statusEl.textContent = "🟢 Connected";
  } else {
    statusEl.textContent = "🔴 Disconnected";
  }
}

async function sendCommand(direction) {
  if (!connected) {
    log("⚠️ Not connected. Please connect first.");
    return;
  }

  const speed = document.getElementById('speed-slider').value;
  log(`Command: ${direction} (${speed}%)`);

  try {
    const res = await fetch(`${arduinoIP}/move?dir=${direction}&speed=${speed}`);
    const data = await res.json();
    document.getElementById('mode').innerText = data.status || "Manual";
  } catch (error) {
    log("❌ Failed to send command: " + error);
  }
}

async function updateSensors() {
  if (!connected) return;
  try {
    const res = await fetch(`${arduinoIP}/sensors`);
    const data = await res.json();

    document.getElementById('distance').innerText = data.distance || '--';
    document.getElementById('battery').innerText = data.battery || '--';
  } catch {
    log("⚠️ Failed to fetch sensor data");
  }

  setTimeout(updateSensors, 3000); // update every 3s
}

function updateSpeedLabel(value) {
  document.getElementById('speed-value').innerText = `${value}%`;
}

function log(message) {
  const logContainer = document.getElementById('log-container');
  const time = new Date().toLocaleTimeString();
  logContainer.innerHTML += `[${time}] ${message}<br>`;
  logContainer.scrollTop = logContainer.scrollHeight;
}
