# Deploying Docker Compose Assistant with Portainer

This guide will walk you through deploying the Docker Compose Assistant (DCA) using a [Portainer](https://www.portainer.io/) Stack. This method is fast, easy, and works by pulling the pre-built public image directly from Docker Hub or GitHub Container Registry.

### Prerequisites

-   A running instance of Portainer connected to a Docker environment.

### Deploying the Stack

1.  **Navigate to Stacks:**
    In the Portainer sidebar, click on **"Stacks"**.

2.  **Add a New Stack:**
    Click the **"Add stack"** button in the top right corner.

3.  **Configure the Stack:**
    *   **Name:** Give your stack a descriptive name, for example, `docker-compose-assistant`.
    *   **Build method:** Choose the **"Web editor"**.

4.  **Paste the Compose Configuration:**
    Copy the following configuration and paste it directly into Portainer's web editor.

        services:
          dca-app:
            # This pulls the public, pre-built image from Docker Hub.
            image: l1apps/docker-compose-assistant:latest
            
            # Alternative: Pull from GitHub Container Registry
            # image: ghcr.io/l1apps/docker-compose-assistant:latest
            
            container_name: docker-compose-assistant
            ports:
              - "8500:80" # You can change the host port (8500) if it's already in use
            restart: unless-stopped

5.  **Deploy the Stack:**
    Scroll to the bottom and click the **"Deploy the stack"** button. Portainer will now pull the public image and start the container.

6.  **Access the Application:**
    Once the deployment is complete, you can access the Docker Compose Assistant in your web browser. Navigate to: `http://<your-server-ip>:8500` (replace `<your-server-ip>` with the IP address of your Docker host).