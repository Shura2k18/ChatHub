# 💬 ChatHub

> ⚠️ **Project Status: In Active Development** 🚧  
> Core real-time messaging functionality is operational, with additional features, polish, and optimization currently in progress.

ChatHub is a modern, real-time web chat application built using React, Redux, Express, Socket.IO, and MongoDB. It provides instant messaging capabilities with a dynamic UI powered by Framer Motion.

---

## 🚀 Tech Stack

### Frontend
* **Framework / Library:** React
* **State Management:** Redux
* **Real-Time Client:** Socket.io-client
* **Animations:** Framer Motion

### Backend
* **Runtime / Framework:** Node.js, Express.js
* **Real-Time Engine:** Socket.IO
* **Database:** MongoDB
* **DevOps & Infrastructure:** Docker, Cloudflare Tunnels (`cloudflared`)

---

## ✨ Features & Capabilities

* ⚡ **Real-Time Communication:** Instant bi-directional messaging powered by WebSockets (Socket.IO).
* 🔄 **State Management:** Centralized client state via Redux for smooth chat transitions and status updates.
* 🎨 **Modern UI & Animations:** Fluid UI component animations powered by Framer Motion.
* 🐳 **Dockerized Environment:** Isolated database and backend container setup for consistent development.
* 🌐 **Tunneling Support:** Integrated Cloudflare Tunnels for testing and local network exposure.

---

## 🛠️ Project Structure

```text
ChatHub/
├── client/          # React frontend application
├── server/          # Express.js & Socket.IO backend application
├── docker-compose.dev.yml
└── package.json
```

---

## 🚦 Getting Started

### Prerequisites

Make sure you have the following installed on your system:
* Node.js (v18+ recommended)
* npm
* Docker & Docker Compose

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ChatHub.git
   cd ChatHub
   ```

2. **Install dependencies:**
   * Root dependencies:
     ```bash
     npm install
     ```
   * Frontend dependencies:
     ```bash
     cd client && npm install && cd ..
     ```

### Running in Development Mode

Run both the server (Docker environment) and the frontend client concurrently:

```bash
npm run dev
```

Or run services individually:

* **Backend / Server (Docker):**
  ```bash
  npm run server:dev
  ```
* **Frontend Client:**
  ```bash
  npm run client:dev
  ```

---

## 🔧 Scripts Overview

* `npm run dev` - Launches backend Docker containers and starts the React development server concurrently.
* `npm run server:dev` - Starts the backend environment using Docker Compose.
* `npm run client:dev` - Navigates to `client/` and starts the React frontend.
* `npm run server:net` - Exposes the local server (port 5000) via Cloudflare Tunnel.
* `npm run client:net` - Exposes the local client (port 3000) via Cloudflare Tunnel.

---

## 📝 Roadmap & Upcoming Features

- [ ] User authentication & authorization (JWT)
- [ ] Direct messaging & group chat channels
- [ ] Message history & pagination from MongoDB
- [ ] Media file sharing & image uploads
- [ ] User online/offline status indicators
