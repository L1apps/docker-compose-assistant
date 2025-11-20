# Docker Compose Assistant (DCA)

Welcome to the Docker Compose Assistant! DCA is a smart, web-based editor designed to help you write, validate, and improve your `docker-compose.yml` files. Powered by pluggable AI providers like Google Gemini or your own local models, it provides intelligent suggestions, auto-corrections, and formatting.

## Features

- **Pluggable AI Providers**: Configure the editor to use your preferred AI service, with support for Google Gemini and any OpenAI-compatible API (e.g., Ollama for local models).
- **Privacy-First Local AI**: Run analysis using your own local models, ensuring your code never leaves your machine.
- **AI-Powered Analysis**: Get instant feedback on your Docker Compose files, including corrections for syntax, indentation, and deprecated keys.
- **Smart Formatting**: Auto-format your code with proper YAML spacing and structure, viewing a precise diff before applying changes.
- **Syntax Snippets**: Quickly insert common Docker Compose blocks (Services, Networks, Volumes, etc.) directly from a dropdown menu.
- **Structure Navigation**: Automatically detects your services, volumes, and networks for quick navigation within large files.
- **Contextual Help**: Select any keyword in your file to get a clear explanation and code example.
- **File Management**: Easily load your existing `docker-compose.yml` files and save your corrected code.
- **Multiple Themes**: Choose from light, dark, and dracula themes to suit your preference.

## Deployment

The recommended method is to use the pre-built image from Docker Hub via Docker Compose or the Docker CLI.

### Prerequisites

-   Docker and Docker Compose installed on your machine.
-   An API Key for a cloud AI provider (like Google Gemini) OR a running local AI server (like [Ollama](https://ollama.com/)).

### Option 1: Using Docker Compose

1.  **Create `docker-compose.yml`:**
    Create a file named `docker-compose.yml` and paste the content below.

        :
          dca-app:
            image: l1apps/docker-compose-assistant:latest
            container_name: docker-compose-assistant
            ports:
              - "8500:80" # Change the host port (8500) if needed
            restart: unless-stopped

2.  **Run the Container:**
    In the same directory, run:

        docker-compose up -d

### Option 2: Using Docker CLI

You can also run the container directly with a single command:

    docker run -d -p 8500:80 --name docker-compose-assistant l1apps/docker-compose-assistant:latest

### Option 3: Deploying with Portainer

For users who manage their Docker environment with Portainer, we provide a dedicated guide.

-   **[View the Portainer Deployment Guide](./PORTAINER_DEPLOYMENT.md)**

### Access the Web Application

Once the container is running, open your web browser and navigate to:
**[http://localhost:8500](http://localhost:8500)** (or the IP of your server if running remotely).

---

## Support & Credits

Developed by [Level 1 Apps (L1Apps)](https://l1apps.com).

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

You can select these from the dropdown in the settings or type in any other custom model name you have available on your local server.
