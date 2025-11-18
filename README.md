# Docker Compose Assistant (DCA)

Welcome to the Docker Compose Assistant! DCA is a smart, web-based editor designed to help you write, validate, and improve your `docker-compose.yml` files. Powered by pluggable AI providers like Google Gemini or your own local models, it provides intelligent suggestions, auto-corrections, contextual help, and version compatibility downgrades.

## Features

- **Pluggable AI Providers**: Configure the editor to use your preferred AI service, with support for Google Gemini and any OpenAI-compatible API (e.g., Ollama for local models).
- **Privacy-First Local AI**: Run analysis using your own local models, ensuring your code never leaves your machine.
- **AI-Powered Analysis**: Get instant feedback on your Docker Compose files, including corrections for syntax, indentation, and deprecated keys.
- **Best Practice Suggestions**: Receive helpful hints on security, performance, and maintainability.
- **Contextual Help**: Select any keyword in your file to get a clear explanation and code example.
- **Version Downgrade**: Automatically rewrite your compose file to be compatible with older versions of Docker Compose.
- **File Management**: Easily load your existing `docker-compose.yml` files and save your corrected code.
- **Multiple Themes**: Choose from light, dark, and dracula themes to suit your preference.

## Deployment

You can run DCA as a standalone container. Below are the recommended methods for deployment.

### Prerequisites

-   Docker and Docker Compose installed on your machine.
-   An API Key for a cloud AI provider (like Google Gemini) OR a running local AI server (like [Ollama](https://ollama.com/)).

### Method 1: Running with Docker Compose (Recommended)

This method uses a pre-built, optimized image from a public container registry. It's the simplest way to get started.

1.  **Create `docker-compose.yml`:**
    Create a file named `docker-compose.yml` and paste the following content into it. Make sure to uncomment the `image` line and comment out the `build` line.
    ```yaml
    version: '3.8'

    services:
      dca-app:
        # To build from source, comment the line below
        image: ghcr.io/google/aistudio-docker-compose-assistant:latest
        # To use a pre-built image, comment the line below
        # build: .
        container_name: docker-compose-assistant
        ports:
          - "8500:80" # You can change the host port (8500) if it's already in use
        restart: unless-stopped
    ```

2.  **Run the Container:**
    Open your terminal in the same directory as your `docker-compose.yml` file and run:
    ```bash
    docker-compose up -d
    ```

### Method 2: Building from Source with Docker Compose

This method builds the Docker image from the source code in this repository. Use this if you want to make custom modifications.

1.  **Clone the Repository:**
    ```bash
    # Replace the URL with your repository's URL
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Run the Container:**
    The `docker-compose.yml` file is already configured to build from source. Simply run:
    ```bash
    docker-compose up -d --build
    ```
    *Note: The default port `8500` is used. To change it, edit the `ports` section in `docker-compose.yml`.*

### Deploying with Portainer

For users who manage their Docker environment with Portainer, we provide a dedicated guide for easy deployment.

-   **[View the Portainer Deployment Guide](./PORTAINER_DEPLOYMENT.md)**

### Access the Web Application

Once the container is running, open your web browser and navigate to:
**[http://localhost:8500](http://localhost:8500)** (or the IP of your server if running remotely).

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

You can select these from the dropdown in the settings or type in any other custom model name you have available on your local server.

## Feedback & Contributions

Encounter a bug, have a suggestion, or want to contribute? We'd love to hear from you! The best way to get in touch is by opening an issue on our GitHub repository.

-   **[Open an Issue](https://github.com/your-username/your-repo-name/issues)** <!-- TODO: Replace with your repo URL -->

This helps us track all feedback in one place and ensures a transparent development process.