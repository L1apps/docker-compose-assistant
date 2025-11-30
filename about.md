# About Docker Compose Assistant

## Description
Docker Compose Assistant is a client-side web application designed to simplify the process of writing, editing, and debugging `docker-compose.yml` files. It leverages Large Language Models (LLMs)—either locally hosted or via Cloud APIs—to understand Docker Compose syntax, schema versions, and best practices.

The application acts as a bridge between your code editor and an AI expert, allowing you to get instant feedback, formatting corrections, and explanations without leaving your workflow.

## User Guide

### 1. Getting Started
*   **Initial Setup:** When you first load the app, a wizard will guide you to select an AI provider (Google Gemini or a Local OpenAI-compatible model).
*   **Settings:** You can change your AI provider, model, or API keys at any time by clicking the **Settings (⚙️)** icon in the header.

### 2. The Editor Interface
The main interface consists of two panels:
*   **Editor Panel (Left):** This is where you write or paste your YAML code. It supports syntax highlighting and line numbering.
*   **AI Feedback Panel (Right):** This displays suggestions, corrected code diffs, explanations, and contextual help.

### 3. Core Features

#### Analyze & Fix
Clicking the **"Analyze & Fix"** button sends your code to the configured AI.
*   **Suggestions:** The AI will list specific improvements, error fixes, or security recommendations.
*   **Corrections:** If errors are found, the AI generates a corrected version of your file. You can view a "Diff" to see exactly what changed before clicking **"Apply Changes"**.

#### Format Code
Use the **"Format to Ver"** dropdown to select a specific Docker Compose version (e.g., 3.8, 2.4). The app will automatically reformat your YAML to match that version's schema and indentation rules.

#### Contextual Help
Highlight any keyword in your editor (e.g., `healthcheck`, `volumes`) and click the **"Select & Explain"** button (square with arrow icon). The AI will provide a definition and a usage example in the side panel.

#### Explain File
Click the **"Explain"** button (document with question mark) to get a high-level summary of what your entire Docker Compose file is doing.

#### Snippets
Use the **"Insert Snippet"** dropdown to quickly add common boilerplate code for services, networks, volumes, and more.

## Limitations

### 1. AI Hallucinations
Like all LLM-based tools, the Docker Compose Assistant can occasionally generate incorrect or "hallucinated" information.
*   **Always Review Code:** Never blindly apply changes. Review the diff and the suggestions to ensure they make sense for your specific infrastructure.
*   **Version Specifics:** While the app tries to enforce version schemas, the AI might sometimes suggest a feature from v3.8 when you are using v2.4.

### 2. Client-Side State
*   **Local Storage:** Your settings (API keys, selected model, theme) are stored in your browser's Local Storage. Clearing your browser cache will reset the application.
*   **No Cloud Sync:** There is no account system. Your files and settings do not sync across devices.

### 3. Network Requirements
*   **Cloud AI:** If using Google Gemini, you must have an active internet connection.
*   **Local AI:** If using a local model (like Ollama), the browser must be able to reach your local API endpoint (usually `http://localhost:11434`). If you are running the app in a container and Ollama on the host, you may need to handle CORS and networking configurations carefully.

### 4. File Size
*   **Context Windows:** Extremely large `docker-compose.yml` files might exceed the context window of the selected AI model, leading to truncated responses or errors.
