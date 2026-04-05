# ChatBox
ChatBox using web socket 
# 💬 Ephemeral Chat

> *Talk freely. Leave nothing behind.*

A real-time chat application built with Node.js and WebSockets. No database, no accounts, no message history — everything vanishes when you leave.

---

## ✨ Features

- 🔴 **Live real-time messaging** powered by Socket.IO
- 🏠 **Multiple rooms** — create any room instantly by just typing a name
- 👥 **Live member list** — see who's online in real time
- ⌨️ **Typing indicators** — know when someone is writing
- 🗑️ **No database** — messages exist only in memory
- 🕵️ **No accounts** — completely anonymous, just pick a name and go
- 📱 **Responsive** — works on mobile and desktop
- 💀 **Ephemeral** — all messages disappear when the last person leaves

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web Server | Express |
| WebSockets | Socket.IO |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Storage | In-memory only (no database) |

---

## 📁 Project Structure

```
ephemeral-chat/
├── server.js                   # Main entry point
├── package.json                # Dependencies
├── backend/
│   ├── config/
│   │   └── constants.js        # Global settings
│   ├── store/
│   │   └── memoryStore.js      # In-memory data store
│   └── sockets/
│       └── chatHandlers.js     # WebSocket event handlers
└── frontend/
    ├── index.html              # UI layout
    ├── css/
    │   └── style.css           # Styling
    └── js/
        ├── app.js              # DOM interactions
        ├── state.js            # Client-side state
        └── socketClient.js     # WebSocket client
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) installed on your machine

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ephemeral-chat.git
cd ephemeral-chat
```

**2. Install dependencies**
```bash
npm install
```

**3. Start the server**
```bash
node server.js
```

**4. Open your browser**
```
http://localhost:3000
```

---

## 🧪 Testing Locally

To test real-time chat on your own machine:

1. Open `http://localhost:3000` in one browser tab
2. Open `http://localhost:3000` in a second tab
3. Use different names in each tab but the same room
4. Start chatting between the two tabs!

---

## 🌐 Testing on Same WiFi Network

To use the chat with someone on the same WiFi:

1. Find your IP address:
```bash
ipconfig
```
2. Look for **IPv4 Address** (e.g. `192.168.1.5`)
3. Share this URL with others on the same network:
```
http://192.168.1.5:3000
```

---

## ⚠️ Limitations

- Messages are **not persisted** — a server restart wipes everything
- **No encryption** — do not share sensitive information
- **No authentication** — anyone can use any username
- Only works across different devices if deployed online or on the same WiFi

---

## 🔒 Privacy

Ephemeral Chat offers **casual privacy**:

| Feature | Status |
|---|---|
| No message database | ✅ |
| Anonymous usernames | ✅ |
| No login required | ✅ |
| End-to-end encryption | ❌ |
| Hidden IP address | ❌ |

> For serious privacy needs, use [Signal](https://signal.org).

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| express | ^4.18.2 | HTTP server |
| socket.io | ^4.7.2 | WebSocket communication |

---

## 🛠️ Future Improvements

- [ ] Add end-to-end encryption
- [ ] Private rooms with passwords
- [ ] User authentication
- [ ] File/image sharing
- [ ] Deploy to cloud (Railway / Render)

---

## 📄 License

MIT — free to use, modify and distribute.

---

<p align="center">Built with Node.js & Socket.IO &nbsp;•&nbsp; No data stored, ever.</p>
