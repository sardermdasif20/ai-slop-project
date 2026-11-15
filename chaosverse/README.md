# CHAOSVERSE — Human × AI Artificial Life Simulation

**A small evolving universe, observed and interpreted by an in-app AI scientist.**

CHAOSVERSE is a Python/Pygame artificial-life sandbox. Creatures move around a world, seek food, consume energy, reproduce, age, and die. The user can change environmental conditions and trigger events. An in-app agent called **ORACLE** observes the simulation, summarizes population trends, flags risks, and suggests experiments.

> **AI transparency:** ChatGPT (OpenAI) assisted with project ideation, architecture, code drafting, debugging guidance, and documentation. The project owner is responsible for reviewing, running, testing, and deciding what is published. ORACLE is a locally implemented rule-based analytical agent; it does not call an external LLM or claim to be sentient.

## Features

- 2D artificial-life simulation with autonomous creatures
- Food spawning, energy consumption, reproduction, aging, and natural death
- Environmental controls: food abundance, mutation pressure, and world temperature
- Events: food boom, drought, and meteor strike
- ORACLE analysis: population status, trend detection, risk assessment, and experiment suggestions
- Live charts for population and food history
- Event log and simulation statistics
- Pause, reset, speed control, and keyboard shortcuts
- No API key required; ORACLE works offline

## Quick start (Windows PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

If PowerShell blocks activation, run the app using:
```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe main.py
```

## Controls

| Control | Action |
|---|---|
| Space | Pause / resume |
| R | Reset the universe |
| 1 | Normal speed |
| 2 | 2× speed |
| 3 | 4× speed |
| F | Food boom |
| D | Drought |
| M | Meteor strike |
| A | Ask ORACLE for a fresh analysis |
| Esc | Quit |

You can also use the buttons and sliders in the right-hand control panel.

## Project structure

```text
chaosverse/
├── main.py
├── requirements.txt
├── README.md
├── AI_DISCLOSURE.md
├── LICENSE
├── .gitignore
├── chaosverse/
│   ├── __init__.py
│   ├── config.py
│   ├── world.py
│   ├── oracle.py
│   └── ui.py
└── tests/
    ├── test_world.py
    └── test_oracle.py
```

## How the simulation works

Each creature has energy, age, speed, and a preferred temperature. Creatures move toward nearby food, spend energy while moving, eat when close enough, and may reproduce when they have sufficient energy. Offspring inherit traits with small random mutations. Environmental conditions affect energy loss and survival.

The simulation is intentionally a simplified educational model, not a scientifically validated ecosystem model.

## ORACLE: the in-app AI scientist

ORACLE uses transparent local heuristics rather than a cloud AI service:
1. It compares recent population counts with earlier counts.
2. It checks food availability and average creature energy.
3. It assigns a qualitative status (stable, stressed, or critical).
4. It explains the signals behind its assessment.
5. It proposes an experiment the user can run.

This makes the application usable offline and keeps its conclusions inspectable. It is an analytical agent, not a trained machine-learning model or a general-purpose LLM.

## Tests

```powershell
python -m pytest
```

## Roadmap

- Save/load simulation snapshots
- More creature species and genetic traits
- Export experiment runs to CSV
- Optional LLM-powered ORACLE with explicit user-configured API credentials
- More advanced evolutionary selection and environmental models

## Credits

- **Project concept and direction:** Project owner
- **AI development collaborator:** ChatGPT (OpenAI), used for ideation, implementation assistance, debugging guidance, and documentation
- **In-app analytical agent:** ORACLE, a locally implemented rule-based agent

See [AI_DISCLOSURE.md](AI_DISCLOSURE.md) for a fuller disclosure.
