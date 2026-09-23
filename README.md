# ⚽ eFootball Mobile Knockout Tournament Management App

A full-stack tournament management web application specifically tailored for **eFootball Mobile Dream Team Knockout Cups** (up to 32 players).

Built with **Node.js + TypeScript (Express)** + **SQLite** on the backend and **React + Vite** with an authentic eFootball stadium and Messi/Ronaldo esports aesthetic on the frontend.

---

## 🚀 Quick Start (Run Locally)

### 1. One-Click Launch (Windows)
Double-click `start.bat` in this folder, or run:
```bash
cd backend
npm run dev
```

Then open your browser at:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 🔑 Organizer / Admin Controls
- **Default Admin PIN**: `1234`
- Click **"Admin Login"** in the top-right navbar to access:
  - **Shuffle & Generate Bracket**: Randomizes seeds and generates the single-elimination tournament tree.
  - **Add Demo Players**: Instantly populates 16 demo players for testing before your real tournament.
  - **Record / Edit Match Scores**: Enter match scores, check Extra Time (AET), or enter Penalty Shootout (PK) deciders. Winners advance automatically to the next round!
  - **Player Management**: Remove spammers or disqualified players.
  - **Reset Tournament**: Reset matches back to registration phase or wipe data.

---

## 🏆 Key Features

| Tab | Feature Description |
| :--- | :--- |
| **Register** | Mobile-first registration form with live slot counter (`X / 32`), duplicate eFootball ID prevention, and live list of registered contenders. |
| **Knockout Bracket** | Visual interactive tournament tree dynamically supporting 8, 16, 24, or 32 players with automatic BYE advancement. Highlights winners and shows regular, extra time, and penalty scores. |
| **Fixtures & Results** | Filterable match schedule with 1-click **"Copy eFootball ID"** button so players can easily paste their opponent's ID directly into eFootball Mobile. |
| **7-Min Match Rules** | Pre-configured official rules: 7-minute match time, Dream Team mode, Extra Time & Penalties enabled, room creation instructions, and disconnection policy. |

---

## 🌐 100% Free Hosting (Share with Friends on Mobile)

To share the tournament link in your WhatsApp group so anyone can register from their phone for **$0**:

1. **Option A: Deploy to [Render.com](https://render.com) (Recommended, 100% Free)**:
   - Push this repo to GitHub.
   - On Render, create a new **Web Service**.
   - Build Command: `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Render gives you a free live URL (e.g. `https://my-efootball-cup.onrender.com`) that works on any smartphone browser.

2. **Option B: Local Wi-Fi / Hotspot**:
   - If everyone is connected to the same Wi-Fi, open your computer's local IP address (e.g., `http://192.168.1.X:8000`) on any connected phone!
