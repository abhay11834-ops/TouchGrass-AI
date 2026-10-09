# 🌿 TouchGrass AI — Find Your Outside

### Less scrolling. More living.

**TouchGrass AI** is an AI-powered outdoor adventure companion that transforms your mood, available time, and interests into personalized real-world nature missions. Instead of encouraging endless screen time, it uses open-weight AI to help people discover nature, explore their surroundings, and build healthier outdoor habits.

Built with **HTML, CSS, JavaScript, and Ollama**, TouchGrass AI brings locally running AI into a beautiful, responsive web experience.

> Your next adventure doesn't have to be far away. Sometimes, it's just outside your door.

---

## ✨ Overview

In a world where people spend hours looking at screens, TouchGrass AI encourages a different kind of interaction with technology.

Tell the app how you're feeling, how much time you have, and what kind of activity interests you. A locally running AI model then creates an outdoor mission tailored to your preferences.

Your mission might involve discovering different leaf shapes, taking a mindful walk, observing your surroundings, finding interesting natural textures, or completing a short outdoor photography challenge.

The objective is simple: **use AI to make the digital experience shorter and the real-world experience better.**

## 🎯 The Problem

Modern digital experiences are designed to keep users engaged with their screens. While technology can be useful, excessive screen time can make it harder to disconnect, explore nearby environments, or find inspiration for simple outdoor activities.

People may want to spend more time outside but struggle with questions such as:

* What can I do outdoors with only 10 or 20 minutes?
* How can I make an ordinary walk more interesting?
* What if I want to relax rather than exercise?
* How can I discover something new without expensive equipment or travel?

## 💡 The Solution

TouchGrass AI makes outdoor exploration accessible through personalized, AI-generated missions.

Instead of scrolling through endless recommendations, users choose a few preferences, receive a practical mission, and leave the screen behind.

The experience is designed around three principles:

* **Personalized:** Missions adapt to mood, available time, and activity preferences.
* **Privacy-conscious:** The AI can run locally on the user's computer rather than relying on a paid cloud AI API.
* **Action-oriented:** The goal is to complete activities in the real world, not maximize time spent in the application.

---

## 🚀 Features

### 🤖 1. Open-Weight AI Mission Generator

TouchGrass AI connects to a locally running Qwen2.5 3B model through Ollama.

Users can choose their mood, time availability, preferred activity, and an optional description of their outdoor setting.

The model generates a structured mission containing:

* A personalized mission title
* A short description
* Actionable steps
* A recommended duration
* A practical safety tip

The application requests structured JSON output so the generated mission can be rendered as an interactive checklist.

### 🌱 2. Mood-Based Personalization

Choose a mood that matches how you feel:

* 🔎 **Curious:** Explore and discover interesting details.
* 🌿 **Need Calm:** Try gentle, mindful outdoor activities.
* ⚡ **Energetic:** Find active challenges suitable for your surroundings.
* ☁️ **Bored:** Turn an ordinary outdoor space into a mini adventure.

The AI uses these preferences to tailor its suggestions.

### ⏱️ 3. Flexible Mission Durations

Choose how much time you have available:

* 10 minutes
* 20 minutes
* 30 minutes
* 60 minutes

The model is instructed to keep the proposed activity within the selected duration.

### 🍃 4. Multiple Outdoor Activities

The current interface supports activity categories such as:

* Nature discovery
* Walking and exploring
* Mindfulness and relaxation
* Outdoor photography
* Bird watching
* Gardening
* Light exercise

These activities can be completed in appropriate outdoor spaces without requiring expensive equipment.

### ✅ 5. Interactive Mission Checklist

Every generated mission includes tasks that users can mark as complete.

Checklist progress is saved with the current mission in browser storage, allowing users to return to their activity without losing their selections.

### ⏳ 6. Built-In Countdown Timer

A mission-specific countdown timer helps users allocate time to their outdoor activity.

The timer supports starting, pausing, resuming, and resetting.

It is designed to help users focus on the activity rather than repeatedly checking their phones.

### ❤️ 7. Save Adventures for Later

Save interesting missions and revisit them later.

Saved adventures are stored in the browser, so users can maintain a personal collection without creating an account.

### 📊 8. Outdoor Progress Dashboard

The dashboard tracks:

* Total recorded outdoor minutes
* Completed missions
* Consecutive days with recorded activity

Progress is stored locally in the browser.

These figures depend on user-confirmed completion; the application does not independently verify that someone has actually gone outdoors.

### 🎨 9. Premium Responsive Interface

The interface features:

* A dark, forest-inspired visual theme
* Nature photography and atmospheric backgrounds
* Lime-green accent colors
* Animated interface elements
* Interactive cards and controls
* Responsive layouts for desktop and mobile
* Reduced-motion support for users who prefer less animation

### 🔒 10. Local AI and Privacy-Conscious Design

The project uses a locally running model rather than a proprietary cloud AI API for mission generation.

This can reduce exposure of personal preferences to third-party AI providers and avoid per-request cloud inference fees.

Local inference does not automatically make the entire application offline or guarantee complete privacy. Browser requests, external images, fonts, and hosting can still involve network activity.

---

## 🛠️ Technology Stack

| Technology            | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| HTML5                 | Semantic page structure and content                     |
| CSS3                  | Responsive layout, animations, and visual styling       |
| Vanilla JavaScript    | Application logic, events, timers, and state management |
| Ollama                | Local model runtime and inference API                   |
| Qwen2.5 3B            | Open-weight language model for generating missions      |
| Browser Local Storage | Persisting saved missions and progress                  |
| Google Fonts          | Typography                                              |
| Unsplash              | Remote nature photography                               |

### Why Vanilla JavaScript?

This project deliberately uses plain HTML, CSS, and JavaScript instead of requiring a large frontend framework.

This makes the code easier to inspect, understand, customize, and extend, especially for developers learning how AI-powered web applications work.

### Why Ollama?

Ollama provides a straightforward way to run supported language models locally and access them through an HTTP API.

This allows the application to request AI-generated content without sending mission-generation requests to a paid hosted AI provider.

### Why Qwen2.5 3B?

Qwen2.5 3B is a relatively compact language model that can be a practical starting point for local experimentation.

Actual speed and quality depend on the computer's hardware, available memory, quantization, and selected model build. Check the specific model's license and terms before redistributing it or using it commercially.

---

## 🧠 How It Works

The application follows a straightforward workflow:

1. The user opens TouchGrass AI in a web browser.
2. The interface checks whether the local Ollama API is reachable and the configured model is available.
3. The user chooses a mood, duration, activity, and optional setting.
4. JavaScript constructs a prompt containing these preferences and the mission-generation instructions.
5. The browser sends the request to Ollama's local chat API.
6. Qwen generates a structured mission.
7. JavaScript parses and validates the model's JSON response.
8. The mission is displayed with an interactive checklist and countdown timer.
9. The user can save the mission, complete it, and record progress.
10. Application state is persisted in browser local storage.

### Architecture

```text
┌───────────────────────────────────────┐
│          TouchGrass AI UI             │
│           HTML + CSS                  │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│          Vanilla JavaScript           │
│                                       │
│  Preferences · Prompt · Validation    │
│  Checklist · Timer · Progress         │
└─────────────┬───────────────┬─────────┘
              │               │
              ▼               ▼
┌────────────────────┐  ┌─────────────────┐
│  Ollama Local API  │  │ Browser Storage │
│                    │  │                 │
│  Qwen2.5 3B Model  │  │ Missions/Stats  │
│                    │  │ Local Progress  │
└────────────────────┘  └─────────────────┘
```

---

## 📋 Prerequisites

Before running the application, make sure you have:

* A computer capable of running your selected local AI model.
* [Ollama](https://ollama.com/download) installed.
* [Visual Studio Code](https://code.visualstudio.com/) or another code editor.
* A modern web browser.
* A local development server, such as the Live Server extension for VS Code.
* An internet connection for initial model downloads and remote fonts and images.

The current implementation uses Qwen2.5 3B, but the model can be changed in the JavaScript configuration if you update the model name and verify compatibility.

---

## ⚙️ Installation and Setup

### Step 1: Clone the repository

Replace `YOUR_USERNAME` with your GitHub username after publishing the repository.

```bash
git clone https://github.com/YOUR_USERNAME/touchgrass-ai.git
cd touchgrass-ai
```

Alternatively, download the repository as a ZIP file and extract it.

### Step 2: Install Ollama

Download and install Ollama from:

https://ollama.com/download

Follow the installation instructions for your operating system.

### Step 3: Download the AI model

Open your terminal and run:

```bash
ollama pull qwen2.5:3b
```

This downloads the model to your computer. The download size depends on the published model variant and its quantization.

### Step 4: Verify the model

Run:

```bash
ollama run qwen2.5:3b
```

You can enter a simple test prompt to verify that the model responds.

Exit the interactive session when finished. Keep the Ollama service running while using the application.

### Step 5: Open the project

Open the project folder in Visual Studio Code.

Your files should look like this:

```text
touchgrass-ai/
├── index.html
├── style.css
├── script.js
└── README.md
```

### Step 6: Start a local web server

If you use the VS Code Live Server extension:

1. Open `index.html`.
2. Right-click inside the editor.
3. Select **Open with Live Server**.
4. Open the displayed local website address.

Do not rely on opening the HTML file directly with a `file://` URL, as browser security restrictions may interfere with API requests.

### Step 7: Configure Ollama access

The frontend calls the local Ollama API at:

```text
http://127.0.0.1:11434
```

If the browser blocks requests due to cross-origin restrictions, configure Ollama's `OLLAMA_ORIGINS` environment variable to allow the exact origin used by your local development server.

For example, if Live Server uses port `5500`:

```text
http://127.0.0.1:5500,http://localhost:5500
```

Restart Ollama after updating the environment variable.

Only allow trusted local origins. Do not expose the local inference API to the public internet.

### Step 8: Generate your first mission

Open the website, choose your preferences, and click **Generate my mission**.

If Ollama is available and the model is installed, the app will request a real mission from Qwen2.5 3B.

---

## 🔐 Open Innovation: Why It Matters

TouchGrass AI was designed around the idea that AI should help people participate more fully in the physical world rather than keep them glued to a screen.

Using an open-weight model makes several things possible.

### Local inference

The language model runs on the user's computer rather than requiring a hosted AI API for every mission.

Once the model and application assets have been downloaded, the core AI interaction can potentially operate without internet access, provided the local service and browser are configured correctly.

### Greater control

Developers can inspect the application's prompt, change mission-generation rules, experiment with compatible models, and adapt the behavior to different activities.

### Reduced dependency on paid APIs

Local inference can eliminate per-request charges from a hosted AI service. Hardware, electricity, storage, and model setup still have costs.

### Privacy-conscious processing

The app can process mission preferences locally instead of sending them to an external AI provider.

The current frontend also uses remote fonts and photography, so it is not entirely network-independent. A fully local deployment would need local copies of those assets and appropriate offline support.

### Experimentation and accessibility

Open-weight models lower the barrier to experimenting with AI-powered applications, subject to the model's license and hardware requirements.

The goal is to make useful AI experiences more adaptable, transparent, and accessible.

---

## 🌍 Built for the "Touch Grass" Challenge

The challenge asks developers to use open-source AI or open-weight models to encourage people to spend time outside.

TouchGrass AI approaches that challenge by using AI as a starting point for real-world experiences.

Instead of using AI to generate endless digital content, it generates a small, practical outdoor activity that the user can complete away from the screen.

The application encourages users to:

* Explore their surroundings.
* Notice details in the natural world.
* Try short outdoor activities.
* Spend time away from digital distractions.
* Reflect on completed adventures.

The interface is a tool for getting started, not the main attraction.

---

## ⚠️ Current Limitations

TouchGrass AI is an evolving project. The current version focuses on local AI mission generation and personal progress tracking.

Known limitations include:

* **Local setup required:** Ollama must be installed and running for AI mission generation.
* **Hardware dependency:** Inference speed depends on the user's computer.
* **Network-dependent assets:** Remote fonts and photography need internet access.
* **Browser-based persistence:** Local Storage is tied to the browser and device, and can be cleared.
* **Self-reported progress:** Mission completion and outdoor time are not independently verified.
* **No location intelligence yet:** The optional setting is used as prompt context; the app does not validate locations or discover real nearby trails.
* **No actual offline PWA yet:** The current version does not include a service worker or a complete offline-installable application.
* **No dedicated vision model yet:** Nature photo identification and bird-call recognition are planned features, not implemented capabilities.

AI-generated activities can be inaccurate or unsuitable for particular environments. Users should exercise judgment, follow local rules, and prioritize personal safety.

---

## 🗺️ Roadmap

Planned improvements include:

* [ ] **Offline-first PWA:** Cache the application shell and assets for use without a network connection.
* [ ] **Nature photo identification:** Add a compatible open-weight vision model to suggest possible plant, leaf, flower, or other natural-object identities.
* [ ] **Bird-call identification:** Explore an appropriate open model for audio-based bird recognition.
* [ ] **Local exploration:** Integrate a mapping service or offline map data to help users discover suitable public outdoor spaces.
* [ ] **Weather-aware activities:** Adapt suggested activities to weather and environmental conditions using a reliable data source.
* [ ] **Nature journal:** Let users record observations and reflections from their adventures.
* [ ] **Achievement system:** Add badges, milestones, and more meaningful outdoor goals.
* [ ] **Accessibility improvements:** Expand keyboard navigation, screen-reader support, and accessible mission formats.
* [ ] **Model selection:** Let users configure different compatible local models.
* [ ] **Progress export:** Allow users to export their mission history and personal records.
* [ ] **Improved testing:** Add automated tests for mission validation, persistence, and application behavior.

These are planned enhancements and are not part of the current implementation.

---

## 🤝 Contributing

Contributions, ideas, bug reports, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Test the app locally with the configured Ollama model.
5. Commit your changes with a clear message.
6. Open a pull request describing your contribution.

Example:

```bash
git checkout -b feature/offline-mode
git add .
git commit -m "Add offline mission support"
git push origin feature/offline-mode
```

Please keep contributions aligned with the project's purpose: helping people spend less time on screens and more time exploring the world.

## 🔒 Privacy and Safety

TouchGrass AI is designed to minimize unnecessary data sharing.

* No account is required by the current implementation.
* Mission preferences and saved records are stored in browser Local Storage.
* AI requests are sent to the configured local Ollama service.
* Remote assets may generate network requests.
* Users should avoid entering sensitive personal information into mission preferences.
* Outdoor activities should be adapted to local conditions, physical abilities, and safety requirements.

The project does not provide professional medical, environmental, or navigation advice.

## 📄 License

No repository license has been selected yet.

Before publishing, choose a license for your own project and add a `LICENSE` file. For example, the MIT License is a common choice for permissively licensed open-source software.

The project's license does not override the separate license and usage terms of Qwen or any other model, library, font, or image asset.

## 🙌 Acknowledgements

* [Ollama](https://ollama.com/) — local model runtime.
* [Qwen](https://github.com/QwenLM/Qwen2.5) — open-weight language model family.
* [Hugging Face](https://huggingface.co/) — model discovery and documentation.
* [Unsplash](https://unsplash.com/) — nature photography used in the interface.
* The open-source community — for building tools that make experimentation possible.

---

## 🌿 Final Thought

Technology is most useful when it helps us do something meaningful.

TouchGrass AI uses open-weight AI to turn a few seconds of interaction into an opportunity to explore, observe, and reconnect with the world beyond the screen.

**Generate a mission. Put your phone away. Go touch grass.**

---

*Built with HTML, CSS, JavaScript, and open-weight AI.*
