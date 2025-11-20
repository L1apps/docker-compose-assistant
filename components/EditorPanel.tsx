import React, { useRef, useState, useEffect } from 'react';
import { UploadIcon, SaveIcon, SparklesIcon, TextSearchIcon, BookOpenIcon, FormatIcon, ChevronDownIcon, TrashIcon, CodeIcon } from './icons';

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  onAnalyze: () => void;
  onFileLoad: () => void;
  onFileSave: () => void;
  onClear: () => void;
  onGetHelp: (keyword: string) => void;
  isLoading: boolean;
  onExplain: () => void;
  isExplaining: boolean;
  onFormatCode: () => void;
  isFormatting: boolean;
  isAIConfigured: boolean;
}

const SNIPPETS = {
  "Top Level": [
    { label: "Services Block", code: "services:\n" },
    { label: "Networks Block", code: "networks:\n  app_network:\n    driver: bridge\n" },
    { label: "Volumes Block", code: "volumes:\n  db_data:\n    driver: local\n" },
    { label: "Secrets Block", code: "secrets:\n  db_password:\n    file: db_password.txt\n" },
  ],
  "Service Definitions": [
    { label: "Basic Service", code: "  app:\n    image: nginx:latest\n    ports:\n      - \"80:80\"\n" },
    { label: "Database Service (Postgres)", code: "  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: example\n    volumes:\n      - db_data:/var/lib/postgresql/data\n" },
    { label: "Redis Service", code: "  redis:\n    image: redis:alpine\n    ports:\n      - \"6379:6379\"\n" },
    { label: "Node.js App (Dev)", code: "  api:\n    build: .\n    command: npm run dev\n    ports:\n      - \"3000:3000\"\n    volumes:\n      - .:/app\n      - /app/node_modules\n" },
  ],
  "Service Properties": [
    { label: "Ports", code: "    ports:\n      - \"8080:80\"\n" },
    { label: "Volumes (Bind Mount)", code: "    volumes:\n      - ./data:/data\n" },
    { label: "Volumes (Named)", code: "    volumes:\n      - db_data:/var/lib/mysql\n" },
    { label: "Environment (List)", code: "    environment:\n      - NODE_ENV=production\n      - DB_HOST=db\n" },
    { label: "Environment (Map)", code: "    environment:\n      NODE_ENV: production\n      DB_HOST: db\n" },
    { label: "Env File", code: "    env_file:\n      - .env\n" },
    { label: "Depends On", code: "    depends_on:\n      - db\n      - redis\n" },
    { label: "Restart Policy", code: "    restart: unless-stopped\n" },
    { label: "Command", code: "    command: bundle exec rails s -p 3000 -b '0.0.0.0'\n" },
    { label: "Network Mode (Host)", code: "    network_mode: host\n" },
  ],
  "Health & Logging": [
    { label: "Healthcheck", code: "    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost\"]\n      interval: 30s\n      timeout: 10s\n      retries: 3\n      start_period: 10s\n" },
    { label: "Logging (JSON)", code: "    logging:\n      driver: \"json-file\"\n      options:\n        max-size: \"10m\"\n        max-file: \"3\"\n" },
  ],
  "Deploy & Resources": [
    { label: "Deploy (Replicas)", code: "    deploy:\n      replicas: 2\n      update_config:\n        parallelism: 1\n        delay: 10s\n" },
    { label: "Resource Limits", code: "    deploy:\n      resources:\n        limits:\n          cpus: '0.50'\n          memory: 512M\n        reservations:\n          cpus: '0.25'\n          memory: 128M\n" },
  ]
};

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  code, setCode, onAnalyze, onFileLoad, onFileSave, onClear, onGetHelp, isLoading, 
  onExplain, isExplaining, onFormatCode, isFormatting,
  isAIConfigured
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const snippetDropdownRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<Array<{ id: string, line: number, label: string }>>([]);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);

  // Click outside handler for snippets dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (snippetDropdownRef.current && !snippetDropdownRef.current.contains(event.target as Node)) {
        setIsSnippetsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simple regex to find top-level keys for navigation
  useEffect(() => {
    const lines = code.split('\n');
    const foundSections: Array<{ id: string, line: number, label: string }> = [];
    
    lines.forEach((line, index) => {
      // Matches top level keys like "services:", "networks:", "volumes:" at start of line
      const match = line.match(/^([a-z_]+):/);
      if (match) {
        foundSections.push({
          id: match[1],
          line: index,
          label: match[1].charAt(0).toUpperCase() + match[1].slice(1)
        });
      }
    });
    setSections(foundSections);
  }, [code]);

  const handleHelpClick = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const { selectionStart, selectionEnd, value } = textarea;
      const selectedText = value.substring(selectionStart, selectionEnd).trim();
      if (selectedText) {
        onGetHelp(selectedText);
      } else {
        alert("Please select a keyword in the editor to get help.");
      }
    }
  };

  const handleInsertSnippet = (snippetCode: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Insert code at cursor position
    const newCode = code.substring(0, start) + snippetCode + code.substring(end);
    setCode(newCode);
    
    setIsSnippetsOpen(false);

    // Restore focus and move cursor to end of inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippetCode.length, start + snippetCode.length);
    }, 0);
  };
  
  const scrollToLine = (lineIndex: number) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const lineHeight = 20; // Approximation of line height
      textarea.scrollTop = lineIndex * lineHeight;
      textarea.focus();
      
      // Create a selection range for visual feedback (optional)
      const lines = code.split('\n');
      let charIndex = 0;
      for(let i = 0; i < lineIndex; i++) {
        charIndex += lines[i].length + 1; // +1 for newline
      }
      textarea.setSelectionRange(charIndex, charIndex);
    }
  };

  // Calculate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const anyLoading = isLoading || isExplaining || isFormatting;
  const buttonsDisabled = anyLoading || !isAIConfigured;

  return (
    <div className="flex flex-col bg-background-offset rounded-lg border border-border overflow-hidden h-[calc(100vh-150px)] lg:h-auto shadow-sm">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-background-offset/80 flex-wrap gap-2">
        
        {/* Left Side: Navigation */}
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground px-2">Editor</h2>
          
          {/* Structure Navigation */}
          <div className="relative group">
             <button className="flex items-center gap-1 text-xs bg-background border border-border px-2 py-1.5 rounded-md text-foreground hover:bg-border/50 transition-colors">
                <span>Jump to Section</span>
                <ChevronDownIcon className="w-3 h-3 opacity-50" />
             </button>
             <div className="absolute left-0 top-full mt-1 w-40 bg-background-offset border border-border rounded-md shadow-lg hidden group-hover:block z-20">
                {sections.length > 0 ? (
                   <ul className="py-1">
                      {sections.map((section) => (
                        <li key={section.id}>
                           <button 
                              onClick={() => scrollToLine(section.line)}
                              className="block w-full text-left px-4 py-2 text-xs text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                           >
                              {section.label}
                           </button>
                        </li>
                      ))}
                   </ul>
                ) : (
                   <div className="px-4 py-2 text-xs text-foreground-muted">No sections found</div>
                )}
             </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-1 flex-wrap">
           
           {/* File Operations Group */}
           <div className="flex items-center bg-background/50 rounded-md p-0.5 border border-border/50">
              <button onClick={onClear} className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted" title="Clear Editor">
                <TrashIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-border/50 mx-1"></div>
              <button onClick={onFileLoad} className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted" title="Import File">
                <UploadIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-border/50 mx-1"></div>
              <button onClick={onFileSave} className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted" title="Download File">
                <SaveIcon className="w-4 h-4" />
              </button>
           </div>

           <div className="w-px h-5 bg-border mx-1"></div>

           {/* Snippets Dropdown */}
           <div className="relative" ref={snippetDropdownRef}>
              <button 
                onClick={() => setIsSnippetsOpen(!isSnippetsOpen)}
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted" 
                title="Insert Syntax Snippets"
              >
                <CodeIcon className="w-4 h-4" />
              </button>
              
              {isSnippetsOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-background-offset border border-border rounded-md shadow-xl z-30 max-h-[500px] overflow-y-auto">
                   {Object.entries(SNIPPETS).map(([category, items]) => (
                     <div key={category} className="border-b border-border/50 last:border-0">
                        <div className="px-3 py-2 text-xs font-bold text-foreground-muted uppercase bg-background/50 sticky top-0">{category}</div>
                        <ul>
                           {items.map((item) => (
                              <li key={item.label}>
                                 <button
                                    onClick={() => handleInsertSnippet(item.code)}
                                    className="block w-full text-left px-4 py-2 text-xs text-foreground hover:bg-accent hover:text-accent-foreground transition-colors truncate"
                                    title={`Insert ${item.label}`}
                                 >
                                    {item.label}
                                 </button>
                              </li>
                           ))}
                        </ul>
                     </div>
                   ))}
                </div>
              )}
           </div>

           {/* AI Actions Group */}
           <div className="flex items-center gap-1">
              <button 
                onClick={handleHelpClick} 
                disabled={!isAIConfigured} 
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted disabled:opacity-30" 
                title={isAIConfigured ? "Select text and click to get Explanation & Example" : "Configure AI to use Help"}
              >
                <TextSearchIcon className="w-4 h-4" />
              </button>

              <button
                onClick={onFormatCode}
                disabled={buttonsDisabled}
                title={isAIConfigured ? "Format Code (Prettify)" : "Configure AI to Format"}
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted disabled:opacity-30"
              >
                {isFormatting ? <span className="animate-spin block">⟳</span> : <FormatIcon className="w-4 h-4" />}
              </button>

              <button
                onClick={onExplain}
                disabled={buttonsDisabled}
                title={isAIConfigured ? "Explain this file" : "Configure AI to Explain"}
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted disabled:opacity-30"
              >
                 {isExplaining ? <span className="animate-spin block">⟳</span> : <BookOpenIcon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={onAnalyze}
                disabled={buttonsDisabled}
                className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1.5 rounded-md hover:bg-accent-hover transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-2 shadow-sm"
                title="Analyze for errors and improvements"
              >
                {isLoading ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
                <span>Analyze & Fix</span>
              </button>
           </div>
        </div>
      </div>
      
      {/* Editor Area with Line Numbers */}
      <div className="relative flex-grow flex overflow-hidden">
        {/* Line Numbers */}
        <div className="flex-shrink-0 w-10 bg-background border-r border-border text-right pt-4 pr-2 text-foreground-muted text-xs select-none overflow-hidden">
           {lineNumbers.map(num => (
             <div key={num} style={{ height: '20px', lineHeight: '20px' }}>{num}</div>
           ))}
        </div>

        {/* Code Area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full flex-grow p-4 bg-editor-background text-foreground font-mono text-sm resize-none focus:outline-none leading-[20px] whitespace-pre"
          placeholder="Paste your docker-compose.yml content here..."
          spellCheck="false"
          style={{ tabSize: 2 }}
          onScroll={(e) => {
             // Sync scrolling could go here if line numbers were in a separate scrolling container,
             // but here the textarea handles its own scroll. 
             // Note: A robust editor syncs line numbers with textarea scroll. 
             // For this simple implementation, line numbers are static and might desync on scroll.
             // Improving this requires a more complex structure (overflow-y-auto on wrapper).
          }}
        />
      </div>
    </div>
  );
};