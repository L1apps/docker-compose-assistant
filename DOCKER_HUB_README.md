# Docker Compose Assistant (DCA)

**A smart, web-based editor and analyzer for Docker Compose files.**

The Docker Compose Assistant is a privacy-first web application designed to help you write, validate, and fix `docker-compose.yml` files. It runs entirely in your browser (client-side) and connects to AI providers (Google Gemini or Local LLMs) to provide intelligent suggestions, auto-formatting, and explanations.

![Version](https://img.shields.io/badge/version-1.8.0-blue) ![License](https://img.shields.io/badge/license-Apache%202.0-green)

## 🚀 Quick Start

The easiest way to run the assistant is using Docker Compose:

    services:
      dca-app:
        image: l1apps/docker-compose-assistant:latest
        container_name: docker-compose-assistant
        ports:
          - "8500:80" 
        restart: unless-stopped

Or run it directly with the Docker CLI:

    docker run -d -p 8500:80 --name docker-compose-assistant l1apps/docker-compose-assistant:latest

Once running, access the editor at: **http://localhost:8500**

## ✨ Features

*   **🤖 Pluggable AI Providers**:
    *   **Google Gemini**: Use the powerful cloud-based models (requires a free API key).
    *   **Local AI (Ollama/LocalAI)**: Connect to your own local models (Llama 3, Mistral, etc.) for maximum privacy.
*   **🛡️ Privacy First**: Your code is processed client-side. If you use a local model, your data never leaves your network.
*   **⚡ Intelligent Analysis**: Detects syntax errors, deprecated keys, and security issues.
*   **🎨 Smart Formatting**: Auto-format your YAML with standard spacing and view a "Diff" comparison before applying changes.
*   **📝 Syntax Snippets**: Instantly insert common blocks (Services, Networks, Volumes, Deploy limits, etc.) via a dropdown menu.
*   **🔍 Contextual Help**: Highlight any keyword in your file to get an instant explanation and example.
*   **🧭 Structure Navigation**: "Jump to Section" allows you to navigate large files easily.
*   **🌗 Themes**: Includes Light, Dark, and Dracula themes.

## ⚙️ Configuration

### Setting up AI
When you launch the app for the first time, a wizard will guide you. You can also configure settings later via the **Settings (⚙️)** icon.

1.  **Google Gemini**: Requires an API Key from Google AI Studio.
2.  **Local AI**: Point the app to your local API endpoint (e.g., `http://localhost:11434/v1` for Ollama).

## 📦 Image Details

*   **Port**: Exposes port `80` inside the container.
*   **Base Image**: Nginx Alpine (lightweight and fast).
*   **Architecture**: Supports AMD64 and ARM64.

## 🛠 Support

Developed by [Level 1 Apps (L1Apps)](https://l1apps.com).
For support, email: **services@l1apps.com**

## 📄 License

Apache License 2.0
