import React, { useRef, useState, useEffect } from 'react';
import { UploadIcon, SaveIcon, SquareArrowInIcon, SquareQuestionIcon, ChevronDownIcon, TrashIcon } from './icons';

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

interface CodeSection {
  id: string;
  line: number;
  label: string;
  startIndex: number;
  endIndex: number;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  code, setCode, onAnalyze, onFileLoad, onFileSave, onClear, onGetHelp, isLoading, 
  onExplain, isExplaining, onFormatCode, isFormatting,
  isAIConfigured
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sections, setSections] = useState<CodeSection[]>([]);
  const [detectedVersion, setDetectedVersion] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  // Parse sections and detect version
  useEffect(() => {
    const lines = code.split('\n');
    const foundSections: CodeSection[] = [];
    let charCount = 0;
    
    lines.forEach((line, index) => {
      // Standardize line length calculation. 
      const lineLength = line.length + 1; 
      
      // Regex to match top-level keys like "services:", "version:", "networks:"
      const match = line.match(/^([a-z_]+):/);
      
      if (match) {
        foundSections.push({
          id: match[1] + '-' + index, // Make ID unique with index
          line: index,
          label: match[1].charAt(0).toUpperCase() + match[1].slice(1),
          startIndex: charCount,
          endIndex: charCount + line.length
        });
      }
      charCount += lineLength;
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

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newVersion = e.target.value;
      setSelectedVersion(newVersion);
      if (newVersion) {
        onFormatCode(newVersion);
      }
  };

  const handleJumpToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const sectionId = e.target.value;
      if (!sectionId) return;
      
      const section = sections.find(s => s.id === sectionId);
      if (section && textareaRef.current) {
        const textarea = textareaRef.current;
        
        textarea.focus();
        textarea.setSelectionRange(section.startIndex, section.endIndex);
        
        // Calculate approximate scroll position assuming 20px line height
        const lineHeight = 20;
        const scrollPos = Math.max(0, (section.line - 2) * lineHeight); // 2 lines context
        textarea.scrollTop = scrollPos;
      }
      
      // Reset the select
      e.target.value = "";
  };

  const handleSnippetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const snippetCode = e.target.value;
      if (!snippetCode) return;

      const textarea = textareaRef.current;
      if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newCode = code.substring(0, start) + snippetCode + code.substring(end);
          setCode(newCode);
          
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + snippetCode.length, start + snippetCode.length);
          }, 0);
      }
      // Reset select
      e.target.value = "";
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
         <div className="px-4 py-2 bg-background-offset border-t border-x border-border rounded-t-lg font-semibold text-sm transform translate-y-[1px] z-10 select-none shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
           Editor
         </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-grow bg-background-offset border border-border rounded-lg rounded-tl-none overflow-hidden shadow-sm relative z-0">
        {/* Toolbar */}
        <div className="flex items-center p-2 border-b border-border bg-background-offset/50 flex-wrap gap-3">
          
          {/* Group 1: File Actions */}
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

          {/* Group 2: Format & Version */}
          <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-foreground-muted hidden sm:block">Format to Ver:</label>
              <div className="relative min-w-[110px]">
                 <select 
                   value={selectedVersion} 
                   onChange={handleVersionChange}
                   disabled={buttonsDisabled}
                   className="w-full appearance-none bg-background border border-border text-foreground text-xs rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer hover:bg-border/30 transition-colors disabled:opacity-50"
                   title="Select Version to Format Code"
                 >
                    <option value="">Auto ({detectedVersion || 'Latest'})</option>
                    {DOCKER_VERSIONS.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                 </select>
                 <ChevronDownIcon className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                 {isFormatting && <span className="absolute right-7 top-1/2 -translate-y-1/2 text-accent animate-spin">⟳</span>}
              </div>
          </div>

          {/* Group 3: Jump To */}
          <div className="relative min-w-[100px]">
             <select
                onChange={handleJumpToChange}
                className="w-full appearance-none bg-background border border-border text-foreground text-xs rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer hover:bg-border/30 transition-colors"
                defaultValue=""
             >
                <option value="" disabled>Jump to</option>
                {sections.length > 0 ? (
                    sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)
                ) : (
                    <option disabled>No sections</option>
                )}
             </select>
             <ChevronDownIcon className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
          </div>

          {/* Group 4: Insert Snippet */}
          <div className="relative min-w-[120px]">
              <select
                 onChange={handleSnippetChange}
                 className="w-full appearance-none bg-background border border-border text-foreground text-xs rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer hover:bg-border/30 transition-colors"
                 defaultValue=""
              >
                 <option value="" disabled>Insert Snippet</option>
                 {Object.entries(SNIPPETS).map(([category, items]) => (
                     <optgroup key={category} label={category}>
                         {items.map(item => (
                             <option key={item.label} value={item.code}>{item.label}</option>
                         ))}
                     </optgroup>
                 ))}
              </select>
              <ChevronDownIcon className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
          </div>

          <div className="flex-grow"></div>

          {/* Group 5: AI Actions */}
          <div className="flex items-center gap-1">
             <button 
                onClick={handleHelpClick} 
                disabled={!isAIConfigured} 
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted disabled:opacity-30" 
                title={isAIConfigured ? "Select & Explain (Highlight text first)" : "Configure AI first"}
              >
                <SquareArrowInIcon className="w-5 h-5" />
              </button>

              <button
                onClick={onExplain}
                disabled={buttonsDisabled}
                title={isAIConfigured ? "Explain this File" : "Configure AI to Explain"}
                className="p-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-foreground-muted disabled:opacity-30"
              >
                 {isExplaining ? <span className="animate-spin block w-5 h-5 text-center">⟳</span> : <SquareQuestionIcon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => onAnalyze(effectiveVersion)}
                disabled={buttonsDisabled}
                className="px-4 py-1.5 rounded-md hover:bg-accent-hover hover:text-accent-foreground transition-colors text-xs font-bold text-accent border border-accent disabled:opacity-50 disabled:cursor-not-allowed ml-2 shadow-sm"
                title="Analyze for errors and improvements"
              >
                {isLoading ? "Analyzing..." : "Analyze & Fix"}
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