// This file provides type definitions for custom properties on the global window object.
// This allows TypeScript to understand and compile code that uses these properties without errors.

interface AIStudio {
  /**
   * Checks if the user has selected a Gemini API key in the AI Studio environment.
   * @returns {Promise<boolean>} A promise that resolves to true if a key is selected, false otherwise.
   */
  hasSelectedApiKey(): Promise<boolean>;

  /**
   * Opens the AI Studio dialog for the user to select a Gemini API key.
   * @returns {Promise<void>} A promise that resolves when the dialog is closed.
   */
  openSelectKey(): Promise<void>;
}

interface Window {
  // The 'aistudio' object is injected by the hosting environment to manage API keys.
  aistudio?: AIStudio;
}
