# 🛡️ Vigil

> A live bridge watchdog with a response-policy simulator.

**Vigil** is an automated incident response and replay engine designed to detect and mitigate cross-chain bridge exploits in real-time. It uses a combination of deterministic rules and statistical anomaly detection (EWMA) to identify unauthorized withdrawals and simulate automated policy responses.

Vigil answers a critical question that operators face: **which defense saves the most money on real incidents, and at what cost to normal users?**

## ✨ Features

- **Real-Time Replay Engine**: Replay real bridge attacks (e.g., Nomad, Ronin) with full speed controls.
- **Explainable Rules Engine**: Precise, deterministic rules catching unauthorized withdrawals, amount, or token mismatches.
- **Statistical Layer (EWMA)**: Catches fast drains and swarms without hand-set thresholds by analyzing cumulative outflows.
- **Response Policy Simulator**: Test defense strategies (Pause, Delayed Pause, Rate Limiting) to see how much illicit flow is stopped vs. legitimate volume delayed.
- **Explainable Alerts**: Responder-facing alerts that pinpoint exactly why an incident was flagged (broken rules, evidence, contributing signals).
- **Comprehensive Scorecard**: Directly compares precision, recall, and false alarms between Rule-based, Statistical, and Hybrid configurations.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Git

### 1. Backend Setup
The backend engine loads the raw dataset, evaluates simulation rules, and streams real-time data over WebSockets.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn[standard] websockets pandas
python server.py
```
*Backend runs on `http://0.0.0.0:8000`.*

### 2. Frontend Setup
The frontend is a React/Vite and Tailwind CSS v4 dashboard.

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

## 🎮 How to Use the Dashboard

1. Navigate to `http://localhost:5173`.
2. Go to the **Replay** tab in the sidebar.
3. Click the **Play** button on the control bar (adjust speed as needed).
4. Watch as historical transactions are streamed, triggering real-time alerts.
5. Use the **Policies** tab to simulate defense mechanisms (e.g., rate limits) against the attack to see funds saved.

## 🏗️ Architecture

- **Data Source**: Parses and normalizes raw Ethereum transactions from bridge exploits.
- **Rule Engine**: Evaluates withdrawals against source-chain deposits for mismatches.
- **Statistical Layer**: EWMA outflow baseline band detects sudden, coordinated swarm drains.
- **Scorer**: Combines rule hits and stat signals into a deterministic 0-100 severity risk score.
- **Policy Simulator**: Replays attack curves under different conditions to generate loss over time and legitimate volume delayed.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Recharts, Lucide React
- **Backend**: Python 3, FastAPI, Uvicorn, Websockets, Pandas

## 📜 License
MIT License
