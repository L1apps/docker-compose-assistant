import React from 'react';
import { SquareInfoIcon } from './icons';

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
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <SquareInfoIcon className="w-6 h-6" />
            About Docker Compose Assistant
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Close about modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto text-foreground-muted prose prose-sm dark:prose-invert max-w-none">
          <p className="lead text-foreground">Version {version}</p>
          <p>This is a smart, web-based editor and analyzer for Docker Compose files. Get AI-powered auto-correction, formatting, and contextual help, all while keeping your data private.</p>

           <p>Developed by <a href="https://l1apps.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Level 1 Apps</a>.</p>
           <p>For support, email us at <a href="mailto:services@l1apps.com" className="text-accent hover:underline">services@l1apps.com</a>.</p>

           <h3>Project Links</h3>
           <p>
            You can find the official container image for this web application on Docker Hub and GitHub Container Registry.
          </p>
          <ul className="list-disc pl-5 space-y-1">
              <li><a href={dockerHubUrl} target="_blank" rel="noopener noreferrer">View Image on Docker Hub</a></li>
              <li><a href="https://github.com/L1apps/docker-compose-assistant" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">View Source on GitHub</a></li>
              <li>
                <code className="text-xs bg-background p-1 rounded">ghcr.io/l1apps/docker-compose-assistant:latest</code>
              </li>
          </ul>
          
          <h3>Version History</h3>

          <h4>v1.10.7 (Latest)</h4>
          <ul>
             <li><strong>Documentation:</strong> Added application screenshot to README.</li>
             <li><strong>Maintenance:</strong> Cleaned up deprecated configuration files.</li>
          </ul>

          <h4>v1.10.6</h4>
          <ul>
             <li><strong>Maintenance:</strong> Codebase cleanup and optimization.</li>
             <li><strong>Refactor:</strong> Removed unused components and services.</li>
             <li><strong>Standards:</strong> Enforced file naming conventions.</li>
          </ul>

          <h4>v1.10.5</h4>
          <ul>
             <li><strong>Standards:</strong> Added <code>DEV_STANDARDS.md</code>.</li>
             <li><strong>Architecture:</strong> Implemented central versioning.</li>
             <li><strong>DevOps:</strong> Added <code>HEALTHCHECK</code>.</li>
          </ul>
          
          <h4>v1.10.4</h4>
          <ul>
             <li><strong>Documentation:</strong> Consolidated all documentation into README.md.</li>
             <li><strong>Documentation:</strong> Added new <code>about.md</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};