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

    **Important:** Before deploying, you must build and push the Docker image to a container registry (like GitHub Container Registry or Docker Hub). Refer to the main [README.md](./README.md) for instructions on building and pushing the image.

    Once your image is published, copy the following configuration and paste it into Portainer's web editor. **Remember to replace `tjfx101/docker-compose-assistant`** with the path to your own published image if it differs.

    ```yaml
    version: '3.8'

    services:
      dca-app:
        # Replace the URL below with your own published image URL
        image: ghcr.io/tjfx101/docker-compose-assistant:latest
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
