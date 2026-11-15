# SIGNAL ZERO — SOC Operations

A browser-based cybersecurity incident-response training game. You play a SOC analyst investigating a fictional compromised cloud identity.

## Play
Open `index.html` in a modern browser. No build step, installation, server, or dependencies are required.

## Gameplay
Complete the incident response playbook:
1. Investigate authentication evidence.
2. Identify the compromised identity using the simulated threat-intelligence feed.
3. Contain the suspicious session.
4. Recover the account with a credential reset and stronger MFA.

Use the investigation toolkit to inspect authentication logs, endpoint telemetry, network flow and threat intelligence. Actions affect your response score, threat level and network health. The event stream records your investigation.

## Features
- Detailed SOC dashboard with incident severity, network health, score and response timer
- Defensive investigation tools and simulated security telemetry
- Four-stage incident response playbook
- Interactive network map and analyst scratchpad
- Filterable event stream (all, alerts, actions)
- Scoring, action-order penalties, escalation and end-of-incident report
- Responsive desktop/mobile layout
- Fictional data and defensive-only actions; no real systems are contacted

## GitHub Pages
1. Create a repository and upload `index.html`, `game.js`, and `README.md` to the root.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Open the published Pages URL.

## License
MIT. Original code and interface.
