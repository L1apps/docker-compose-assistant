# Deploying Docker Compose Assistant with Portainer

This guide will walk you through deploying the Docker Compose Assistant (DCA) using [Portainer](https://www.portainer.io/), a popular container management UI. Using Portainer Stacks makes it incredibly easy to manage the application's lifecycle.

### Prerequisites

-   A running instance of Portainer connected to a Docker environment.

### Deployment Steps

1.  **Navigate to Stacks:**
    In the Portainer sidebar, click on **"Stacks"**.

2.  **Add a New Stack:**
    Click the **"Add stack"** button in the top right corner.

3.  **Configure the Stack:**

    *   **Name:** Give your stack a descriptive name, for example, `docker-compose-assistant`.
    *   **Build method:** Choose the **"Web editor"**.

4.  **Paste the Compose Configuration:**

    Copy the following content and paste it into Portainer's web editor. This configuration pulls a ready-to-use image from a public registry, which is the fastest and simplest way to deploy the application.

    ```yaml
    version: '3.8'

    services:
      dca-app:
        # Use the pre-built image from a container registry
        image: ghcr.io/google/aistudio-docker-compose-assistant:latest
        container_name: docker-compose-assistant
        ports:
          - "8500:80" # You can change the host port (8500) if it's already in use
        restart: unless-stopped
    ```

5.  **Deploy the Stack:**

    Scroll to the bottom and click the **"Deploy the stack"** button. Portainer will now pull the image and start the container.

6.  **Access the Application:**

    Once the deployment is complete and the container is running, you can access the Docker Compose Assistant in your web browser.

    Navigate to: `http://<your-server-ip>:8500` (replace `<your-server-ip>` with the IP address of your Docker host, and use the host port you defined in the stack).

That's it! You have now successfully deployed the Docker Compose Assistant using Portainer.