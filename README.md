# Docker Compose Assistant (DCA)

Welcome to the Docker Compose Assistant! DCA is a smart, web-based editor designed to help you write, validate, and improve your `docker-compose.yml` files. Powered by pluggable AI providers like Google Gemini or your own local models, it provides intelligent suggestions, auto-corrections, and formatting.

![Version](https://img.shields.io/badge/version-1.10.7-blue)

![Docker Compose Assistant Screenshot](https://l1apps.com/docker-compose-assistant/dca/)

## Features

- **Pluggable AI Providers**: Configure the editor to use your preferred AI service, with support for Google Gemini and any OpenAI-compatible API (e.g., Ollama for local models).
- **Privacy-First Local AI**: Run analysis using your own local models, ensuring your code never leaves your machine.
- **AI-Powered Analysis**: Get instant feedback on your Docker Compose files, including corrections for syntax, indentation, and deprecated keys.
- **Smart Formatting**: Auto-format your code with proper YAML spacing and structure, viewing a precise diff before applying changes.
- **Syntax Snippets**: Quickly insert common Docker Compose blocks (Services, Networks, Volumes, etc.) directly from a dropdown menu.
- **Structure Navigation**: Automatically detects your services, volumes, and networks for quick navigation within large files.
- **Contextual Help**: Select any keyword in your file to get a clear explanation and code example directly in the side panel.
- **Version Aware**: Detects or allows manual selection of Docker Compose versions (e.g., 3.8, 2.4) to ensure compliant syntax.
- **File Management**: Easily load your existing `docker-compose.yml` files and save your corrected code.
- **Multiple Themes**: Choose from light, dark, and dracula themes to suit your preference.

## Deployment

You can pull the pre-built image from **Docker Hub** or **GitHub Container Registry (GHCR)**.

### Prerequisites

-   Docker and Docker Compose installed on your machine.
-   An API Key for a cloud AI provider (like Google Gemini) OR a running local AI server (like [Ollama](https://ollama.com/)).

### Option 1: Using Docker Compose

1.  **Create `docker-compose.yml`:**
    Create a file named `docker-compose.yml` and paste the content below.

        services:
          dca-app:
            # Pull from Docker Hub
            image: l1apps/docker-compose-assistant:latest
            
            # OR Pull from GitHub Container Registry
            # image: ghcr.io/l1apps/docker-compose-assistant:latest
            
            container_name: docker-compose-assistant
            ports:
              - "8500:80" # Change the host port (8500) if needed
            restart: unless-stopped

2.  **Run the Container:**
    In the same directory, run:

        docker-compose up -d

### Option 2: Using Docker CLI

You can also run the container directly with a single command.

**Using Docker Hub:**

    docker run -d -p 8500:80 --name docker-compose-assistant l1apps/docker-compose-assistant:latest

**Using GitHub Container Registry:**

    docker run -d -p 8500:80 --name docker-compose-assistant ghcr.io/l1apps/docker-compose-assistant:latest

### Option 3: Deploying with Portainer

This guide will walk you through deploying the Docker Compose Assistant using a [Portainer](https://www.portainer.io/) Stack.

1.  **Navigate to Stacks:** In the Portainer sidebar, click on **"Stacks"**.
2.  **Add a New Stack:** Click the **"Add stack"** button in the top right corner.
3.  **Configure the Stack:**
    *   **Name:** Give your stack a descriptive name, e.g., `docker-compose-assistant`.
    *   **Build method:** Choose the **"Web editor"**.
4.  **Paste the Configuration:** Copy the following configuration into the web editor:

        services:
          dca-app:
            image: l1apps/docker-compose-assistant:latest
            container_name: docker-compose-assistant
            ports:
              - "8500:80"
            restart: unless-stopped

5.  **Deploy:** Scroll down and click **"Deploy the stack"**.
6.  **Access:** Once deployed, navigate to `http://<your-server-ip>:8500`.

---

## Configuring the AI Provider

You can configure your AI provider in two ways:

#### 1. First-Time Setup Wizard (Recommended)
- On your first visit, a setup wizard will appear.
- Follow the on-screen instructions to select and configure your AI provider.
- **Want to start editing right away?** You can choose to "Skip and configure later" to go directly to the editor. You can then set up the AI provider at any time from the Settings menu.

#### 2. Manual Configuration
- If you skip the wizard, or if you want to change your settings, click the **Settings icon** (⚙️) in the top-right corner of the application header.
- This will open a modal where you can select your provider, enter API keys, and set model details.
- Your settings are saved securely in your browser's local storage for future sessions.

## Recommended AI Models

While you can use any compatible model, here are some recommendations that are known to work well with this tool's prompts:

-   **Google Gemini (Cloud)**:
    -   `gemini-2.5-pro`: (Default) A powerful, well-rounded model for high-quality analysis.
    -   `gemini-2.5-flash`: A faster, more cost-effective model that still provides excellent results.

-   **Local Models (OpenAI-Compatible API)**:
    -   `llama3`: A state-of-the-art model from Meta, great for general-purpose coding tasks.
    -   `codellama`: A specialized model for code generation and analysis.
    -   `mistral`: A high-performance model known for its speed and efficiency.
    -   `phi3`: A powerful small language model from Microsoft.

## Support & Credits

Developed by [Level 1 Apps](https://l1apps.com).
For support or inquiries, please visit our website.
For more details about the application logic and limitations, see [about.md](./about.md).
