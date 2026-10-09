# Vigil 🛡️

Vigil is an automated incident response and replay engine designed to detect and mitigate cross-chain bridge exploits in real-time. It uses a combination of deterministic rules and statistical anomaly detection (EWMA) to identify unauthorized withdrawals and simulate automated policy responses.

This repository contains:
1. **Frontend**: A React/Vite/Tailwind v4 dashboard for real-time monitoring and replay simulation.
2. **Backend**: A Python/FastAPI WebSocket engine that processes raw transaction data and streams events/alerts to the frontend.

---

## 🚀 Quick Start Guide

Follow these instructions to set up and run Vigil on your local machine.

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/brbaswadeep/Vigil.git
cd Vigil
```

### 2. Set Up the Python Backend
The backend engine loads the raw dataset, processes the simulation rules, and streams data over WebSockets.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install the required dependencies
pip install fastapi uvicorn[standard] websockets pandas

# Start the WebSocket server
python server.py
```
*The backend should now be running on `http://0.0.0.0:8000`.*

### 3. Set Up the React Frontend
Open a **new terminal window/tab**, ensure you are in the root `Vigil` directory, and start the frontend.

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend should now be running on `http://localhost:5173`.*

---

## 🎮 How to Use the App

1. Open your browser and navigate to `http://localhost:5173`.
2. Click on the **Replay** tab in the sidebar.
3. Make sure both the backend and frontend are running. 
4. Click the **Play** button on the control bar.
5. Watch as the real historical transactions from the Nomad Bridge hack are streamed into the UI, triggering real-time alerts and rule evaluations!

---

## 🏗️ Architecture

- **Data Source**: Analyzes raw Ethereum `tx_receipts` from the 2022 Nomad Bridge Exploit.
- **Rule Engine**: Deterministically matches source-chain deposits to destination-chain withdrawals.
- **Statistical Layer**: Utilizes an Exponentially Weighted Moving Average (EWMA) to detect sudden outflow swarms.
- **Scorer**: Combines rule hits and stat signals into a 0-100 severity score.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS v4, Recharts, Lucide React
- **Backend**: Python 3, FastAPI, Uvicorn, Websockets, Pandas
