import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  repoUrl: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, version, repoUrl }) => {
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
          <p>This is a smart, web-based editor and analyzer for Docker Compose files. Get AI-powered auto-correction, formatting, contextual help, and version downgrades, all while keeping your data private.</p>

           <h3>Feedback & Contributions</h3>
          <p>
            This web application is designed to be a helpful tool for the community. If you encounter any bugs, have suggestions for new features, or want to contribute, please open an issue on our GitHub repository.
          </p>
          <p>
            <a href={`${repoUrl}/issues`} target="_blank" rel="noopener noreferrer">Report an Issue or Suggest a Feature</a>
          </p>
          
          <h3>Version History</h3>

           <h4>v1.7.0 (Latest)</h4>
          <ul>
            <li>Added a "Report an Issue" link in the header to allow users to provide feedback via GitHub Issues.</li>
            <li>Improved application robustness by adding a global Error Boundary to catch unexpected errors and prevent crashes.</li>
            <li>Enhanced the visual display for API errors in the feedback panel.</li>
            <li>Updated terminology to "Web Application" for better clarity and professionalism.</li>
          </ul>
          
          <h4>v1.6.0</h4>
          <ul>
            <li>Rebranded application to "Docker Compose Assistant" (DCA).</li>
            <li>Designed a new cursive-style "DCA" logo.</li>
            <li>Updated application name and descriptions across all documentation and UI components.</li>
          </ul>

          <h4>v1.5.0</h4>
          <ul>
            <li>Implemented a full theming system with multiple themes (Light, Dark, Dracula).</li>
            <li>Replaced the theme toggle with a new theme selector dropdown in the header.</li>
            <li>Refactored the entire application's styling to use a scalable CSS variable-based system.</li>
          </ul>

          <h4>v1.4.0</h4>
          <ul>
            <li>Added this "About" panel with version history and attribution.</li>
            <li>Updated footer with new copyright notice.</li>
          </ul>

          <h4>v1.3.0</h4>
          <ul>
            <li>Added a dropdown of recommended models for both Gemini and Local AI providers.</li>
            <li>Added an option to skip the setup wizard and configure the AI provider later.</li>
            <li>Updated README documentation with new features and model recommendations.</li>
          </ul>

          <h4>v1.2.0</h4>
          <ul>
            <li>Introduced the first-time setup wizard for a better onboarding experience.</li>
            <li>Added support for local, OpenAI-compatible AI models (e.g., using Ollama) for enhanced privacy.</li>
            <li>Overhauled settings to be fully managed within the application UI.</li>
            <li>Removed the need to configure API keys in the `docker-compose.yml` file.</li>
          </ul>

          <h4>v1.1.0</h4>
          <ul>
            <li>Initial release with core AI-powered features:</li>
            <ul>
                <li>Analyze & Fix for code correction.</li>
                <li>Contextual Help for selected keywords.</li>
                <li>Version Downgrade for compatibility.</li>
            </ul>
            <li>Basic editor with file load/save functionality.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};