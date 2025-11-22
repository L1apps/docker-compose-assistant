import React, { useRef, useState, useEffect } from 'react';
import { UploadIcon, SaveIcon, SparklesIcon, SquareArrowInIcon, ExplainFileIcon, FormatIcon, ChevronDownIcon, TrashIcon, CodeIcon } from './icons';

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  onAnalyze: (version: string) => void;
  onFileLoad: () => void;
  onFileSave: () => void;
  onClear: () => void;
  onGetHelp: (keyword: string, version: string) => void;
  isLoading: boolean;
  onExplain: () => void;
  isExplaining: boolean;
  onFormatCode: (version: string) => void;
  isFormatting: boolean;
  isAIConfigured: boolean;
}

const DOCKER_VERSIONS = [
  '3.9', '3.8', '3.7', '3.6', '3.5', '3.4', '3.3', '3.2', '3.1', '3.0',
  '2.4', '2.3', '2.2', '2.1', '2.0'
];

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
  const [detectedVersion, setDetectedVersion] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

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

  // Parse sections and detect version
  useEffect(() => {
    const lines = code.split('\n');
    const foundSections: Array<{ id: string, line: number, label: string }> = [];
    
    // Simple regex to find top-level keys
    lines.forEach((line, index) => {
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

    // Detect version
    const versionMatch = code.match(/version:\s*['"]?([0-9.]+)['"]?/);
    if (versionMatch) {
      setDetectedVersion(versionMatch[1]);
    } else {
      setDetectedVersion(null);
    }
  }, [code]);

  // Determine effective version to use
  const effectiveVersion = selectedVersion || detectedVersion || '3.8';

  const handleHelpClick = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const { selectionStart, selectionEnd, value } = textarea;
      const selectedText = value.substring(selectionStart, selectionEnd).trim();
      if (selectedText) {
        onGetHelp(selectedText, effectiveVersion);
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
      const lineHeight = 20; 
      textarea.scrollTop = lineIndex * lineHeight;
      textarea.focus();
    }
  };

  // Calculate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const anyLoading = isLoading || isExplaining || isFormatting;
  const buttonsDisabled = anyLoading || !isAIConfigured;

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] lg:h-auto">
      {/* Folder Tab Header */}
      <div className="flex px-4">
         <div className="px-4 py-2 bg-background-offset border-t border-x border-border rounded-t-lg font-semibold text-sm transform translate-y-[1px] z-10 select-none">
           Editor
         </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-grow bg-background-offset border border-border rounded-lg rounded-tl-none overflow-hidden shadow-sm relative z-0">
        {/* Toolbar */}
        <div className="flex items-center p-2 border-b border-border bg-background-offset/50 flex-wrap gap-2">
          
          {/* File Actions Group */}
          <div className="flex items-center bg-background/50 rounded-md p-0.5 border border-border/50">
             <button onClick={onFileLoad} className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted" title="Import File">
               <UploadIcon className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-border/50 mx-1"></div>
             <button onClick={onFileSave} className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted" title="Save / Download File">
               <SaveIcon className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-border/50 mx-1"></div>
             <button onClick={onClear} className="p-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-foreground-muted" title="Clear Editor">
               <TrashIcon className="w-4 h-4" />
             </button>
          </div>

          <div className="w-px h-5 bg-border mx-1 hidden sm:block"></div>

          {/* Version Selection */}
          <div className="relative group min-w-[120px]">
             <select 
               value={selectedVersion} 
               onChange={(e) => setSelectedVersion(e.target.value)}
               className="w-full appearance-none bg-background border border-border text-foreground text-xs rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer hover:bg-border/30 transition-colors"
               title="Select Docker Compose Version for AI context"
             >
                <option value="">{detectedVersion ? `Auto (${detectedVersion})` : 'Auto (Latest)'}</option>
                {DOCKER_VERSIONS.map(v => (
                  <option key={v} value={v}>Version {v}</option>
                ))}
             </select>
             <ChevronDownIcon className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
          </div>

          {/* Jump To */}
          <div className="relative group">
             <button className="flex items-center gap-1 text-xs bg-background border border-border px-3 py-2 rounded-md text-foreground hover:bg-border/50 transition-colors">
                <span>Jump to</span>
                <ChevronDownIcon className="w-3 h-3 opacity-50" />
             </button>
             <div className="absolute left-0 top-full mt-1 w-40 bg-background-offset border border-border rounded-md shadow-lg hidden group-hover:block z-20">
                {sections.length > 0 ? (
                   <ul className="py-1 max-h-60 overflow-y-auto">
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

          {/* Insert Snippet Dropdown */}
          <div className="relative" ref={snippetDropdownRef}>
              <button 
                onClick={() => setIsSnippetsOpen(!isSnippetsOpen)}
                className="flex items-center gap-1 text-xs bg-background border border-border px-3 py-2 rounded-md text-foreground hover:bg-border/50 transition-colors"
                title="Insert Syntax Snippets"
              >
                <span>Insert Snippet</span>
                <ChevronDownIcon className="w-3 h-3 opacity-50" />
              </button>
              
              {isSnippetsOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-background-offset border border-border rounded-md shadow-xl z-30 max-h-[400px] overflow-y-auto">
                   {Object.entries(SNIPPETS).map(([category, items]) => (
                     <div key={category} className="border-b border-border/50 last:border-0">
                        <div className="px-3 py-2 text-[10px] font-bold text-foreground-muted uppercase bg-background/50 sticky top-0 backdrop-blur-sm">{category}</div>
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

          <div className="flex-grow"></div>

          {/* AI Actions Group */}
          <div className="flex items-center gap-1">
             <button 
                onClick={handleHelpClick} 
                disabled={!isAIConfigured} 
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted disabled:opacity-30" 
                title={isAIConfigured ? "Select text and click to Explain" : "Configure AI to use Help"}
              >
                <SquareArrowInIcon className="w-4 h-4" />
              </button>

              <button
                onClick={onExplain}
                disabled={buttonsDisabled}
                title={isAIConfigured ? "Explain this file" : "Configure AI to Explain"}
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted disabled:opacity-30"
              >
                 {isExplaining ? <span className="animate-spin block w-4 h-4 text-center">⟳</span> : <ExplainFileIcon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => onFormatCode(effectiveVersion)}
                disabled={buttonsDisabled}
                title={isAIConfigured ? "Format Code (Prettify)" : "Configure AI to Format"}
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted disabled:opacity-30"
              >
                {isFormatting ? <span className="animate-spin block w-4 h-4 text-center">⟳</span> : <FormatIcon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => onAnalyze(effectiveVersion)}
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
          />
        </div>
      </div>
    </div>
  );
};