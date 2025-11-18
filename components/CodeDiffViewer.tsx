import React, { useMemo } from 'react';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  line: string;
}

interface CodeDiffViewerProps {
  oldCode: string;
  newCode: string;
}

// A simple line-by-line diffing algorithm to find additions and removals.
const createDiff = (oldCode: string, newCode: string): DiffLine[] => {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const diff: DiffLine[] = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length && newIndex < newLines.length) {
    if (oldLines[oldIndex] === newLines[newIndex]) {
      diff.push({ type: 'unchanged', line: oldLines[oldIndex] });
      oldIndex++;
      newIndex++;
    } else {
      const oldLineInNew = newLines.indexOf(oldLines[oldIndex], newIndex);
      const newLineInOld = oldLines.indexOf(newLines[newIndex], oldIndex);

      if (newLineInOld === -1) {
        // This new line doesn't exist in the rest of the old code, so it's an addition.
        diff.push({ type: 'added', line: newLines[newIndex] });
        newIndex++;
      } else if (oldLineInNew === -1) {
        // This old line doesn't exist in the rest of the new code, so it's a deletion.
        diff.push({ type: 'removed', line: oldLines[oldIndex] });
        oldIndex++;
      } else {
        // Both lines exist later on. Assume the one whose match appears sooner is the correct path.
        if (oldLineInNew <= newLineInOld) {
          diff.push({ type: 'removed', line: oldLines[oldIndex] });
          oldIndex++;
        } else {
          diff.push({ type: 'added', line: newLines[newIndex] });
          newIndex++;
        }
      }
    }
  }

  // Add any remaining lines from either file
  while (oldIndex < oldLines.length) {
    diff.push({ type: 'removed', line: oldLines[oldIndex] });
    oldIndex++;
  }
  while (newIndex < newLines.length) {
    diff.push({ type: 'added', line: newLines[newIndex] });
    newIndex++;
  }

  return diff;
};

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ oldCode, newCode }) => {
  const diff = useMemo(() => createDiff(oldCode, newCode), [oldCode, newCode]);
  
  let oldLineNum = 1;
  let newLineNum = 1;

  return (
    <pre className="bg-editor-background p-4 rounded-md overflow-x-auto text-sm text-foreground font-mono">
      <code>
        {diff.map((item, index) => {
          let currentOldLine = '';
          let currentNewLine = '';
          let bgClass = '';
          let operator = ' ';

          switch (item.type) {
            case 'added':
              currentNewLine = (newLineNum++).toString();
              bgClass = 'bg-green-500/20';
              operator = '+';
              break;
            case 'removed':
              currentOldLine = (oldLineNum++).toString();
              bgClass = 'bg-red-500/20';
              operator = '-';
              break;
            case 'unchanged':
            default:
              currentOldLine = (oldLineNum++).toString();
              currentNewLine = (newLineNum++).toString();
              bgClass = 'hover:bg-white/5';
              break;
          }

          return (
            <div key={index} className={`flex ${bgClass}`}>
              <span className="w-10 text-right pr-4 text-foreground-muted select-none flex-shrink-0">{currentOldLine}</span>
              <span className="w-10 text-right pr-4 text-foreground-muted select-none flex-shrink-0">{currentNewLine}</span>
              <div className="flex-grow">
                <span className="w-4 inline-block mr-2 text-center select-none">{operator}</span>
                <span>{item.line}</span>
              </div>
            </div>
          );
        })}
      </code>
    </pre>
  );
};