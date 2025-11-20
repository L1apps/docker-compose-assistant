import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  dockerHubUrl: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, version, dockerHubUrl }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-background-offset border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            About Docker Compose Assistant
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Close about modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto text-foreground-muted prose prose-sm dark:prose-invert max-w-none">
          <p className="lead text-foreground">Version {version}</p>
          <p>This is a smart, web-based editor and analyzer for Docker Compose files. Get AI-powered auto-correction, formatting, and contextual help, all while keeping your data private.</p>

           <p>Developed by <a href="https://l1apps.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Level 1 Apps (L1Apps)</a>.</p>
           <p>For support, email us at <a href="mailto:services@l1apps.com" className="text-accent hover:underline">services@l1apps.com</a>.</p>

           <h3>Project Link</h3>
           <p>
            You can find the official container image for this web application on Docker Hub.
          </p>
          <ul className="list-disc pl-5 space-y-1">
              <li><a href={dockerHubUrl} target="_blank" rel="noopener noreferrer">View Image on Docker Hub</a></li>
          </ul>
          
          <h3>Version History</h3>

          <h4>v1.8.0 (Latest)</h4>
          <ul>
            <li><strong>Enhanced Formatting:</strong> Formatting now shows a Diff View (Before vs. After) so you can review changes before applying them.</li>
            <li><strong>UI Cleanup:</strong> Replaced bulky buttons with a streamlined icon toolbar.</li>
            <li><strong>Better Navigation:</strong> Added a "Jump to Section" feature to quickly scroll to services, networks, or volumes.</li>
            <li><strong>Deprecated Feature Removal:</strong> Removed the Docker Compose Version Downgrade feature as it is no longer relevant for modern Docker environments.</li>
          </ul>

           <h4>v1.7.0</h4>
          <ul>
            <li>Improved application robustness by adding a global Error Boundary to catch unexpected errors and prevent crashes.</li>
            <li>Enhanced the visual display for API errors in the feedback panel.</li>
          </ul>
          
          <h4>v1.6.0</h4>
          <ul>
            <li>Rebranded application to "Docker Compose Assistant" (DCA).</li>
            <li>Designed a new cursive-style "DCA" logo.</li>
          </ul>

          <h4>v1.5.0</h4>
          <ul>
            <li>Implemented a full theming system with multiple themes (Light, Dark, Dracula).</li>
          </ul>

          <h4>v1.2.0</h4>
          <ul>
            <li>Added support for local, OpenAI-compatible AI models (e.g., using Ollama).</li>
            <li>Introduced the first-time setup wizard.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
