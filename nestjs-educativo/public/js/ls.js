/**
 * Language Server (LS) functionalities
 * Provides IntelliSense for \`this.\` contextual autocompletion and Go-To-Definition (Ctrl+Click).
 */

class LanguageService {
  static getContextualHints(cm, cursor, token, word) {
    const line = cm.getLine(cursor.line);
    const prefix = line.substring(0, cursor.ch);

    let list = [];

    if (prefix.match(/this\.\w*$/)) {
      // Typing this.something
      list = this.getThisSuggestions(cm.getValue(), word);
    } else {
      const serviceMatch = prefix.match(/this\.([a-zA-Z0-9_]+)\.\w*$/);
      if (serviceMatch) {
        const serviceVarName = serviceMatch[1];
        list = this.getServiceSuggestions(cm.getValue(), serviceVarName, word);
      }
    }

    return list;
  }

  static getThisSuggestions(content, searchWord) {
    const suggestions = [];
    const methodRegex = /\b([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/g;
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
      if (!['constructor', 'catch', 'if', 'for', 'while', 'switch'].includes(match[1])) {
        suggestions.push({ text: match[1], displayText: match[1] + '()', type: 'method' });
      }
    }

    const constructorMatch = content.match(/constructor\s*\(([^)]+)\)/);
    if (constructorMatch) {
      const paramsStr = constructorMatch[1];
      const paramRegex =
        /(?:private|protected|public)?\s*(?:readonly)?\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g;
      let pMatch;
      while ((pMatch = paramRegex.exec(paramsStr)) !== null) {
        suggestions.push({
          text: pMatch[1],
          displayText: pMatch[1] + ' (Service)',
          type: 'property',
          refType: pMatch[2],
        });
      }
    }

    return searchWord
      ? suggestions.filter((s) => s.text.toLowerCase().startsWith(searchWord.toLowerCase()))
      : suggestions;
  }

  static getServiceSuggestions(currentContent, serviceVarName, searchWord) {
    if (!window.vfs) return [];
    // Find the type of the service
    const constructorMatch = currentContent.match(/constructor\s*\(([^)]+)\)/);
    if (!constructorMatch) return [];

    const paramRegex = new RegExp(
      `(?:private|protected|public)?\\s*(?:readonly)?\\s*${serviceVarName}\\s*:\\s*([a-zA-Z0-9_]+)`
    );
    const pMatch = constructorMatch[1].match(paramRegex);
    if (!pMatch) return [];

    const serviceClassName = pMatch[1];

    // Find the service in VFS
    let targetContent = null;
    for (const [path, entry] of window.vfs.files.entries()) {
      if (entry.content.includes(`class ${serviceClassName}`)) {
        targetContent = entry.content;
        break;
      }
    }

    if (!targetContent) return [];

    const suggestions = [];
    const methodRegex = /\b([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/g;
    let match;
    while ((match = methodRegex.exec(targetContent)) !== null) {
      if (!['constructor', 'catch', 'if', 'for', 'while', 'switch'].includes(match[1])) {
        suggestions.push({ text: match[1], displayText: match[1] + '()', type: 'method' });
      }
    }

    return searchWord
      ? suggestions.filter((s) => s.text.toLowerCase().startsWith(searchWord.toLowerCase()))
      : suggestions;
  }

  static goToDefinition(cm, event) {
    if (!event.ctrlKey || !window.vfs || !window.codeEditor) return;

    const pos = cm.coordsChar({ left: event.clientX, top: event.clientY });
    const token = cm.getTokenAt(pos);
    if (!token || !token.string.trim() || token.string.match(/^[.,;(){}\[\]]+$/)) return;

    const word = token.string.trim();
    const line = cm.getLine(pos.line);

    // Let's search VFS for class/interface definition
    for (const [path, entry] of window.vfs.files.entries()) {
      if (entry.content.includes(`class ${word}`) || entry.content.includes(`interface ${word}`)) {
        window.codeEditor.openTab(path);
        // Try to jump to definition line
        setTimeout(() => {
          const lines = entry.content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(`class ${word}`) || lines[i].includes(`interface ${word}`)) {
              window.codeEditor.cm.setCursor({ line: i, ch: 0 });
              // center cursor
              window.codeEditor.cm.scrollIntoView({ line: i, ch: 0 }, 200);
              break;
            }
          }
        }, 100);
        return; // Found definition
      }
    }

    // Check if it's a method on a service: this.myService.word()
    const methodCallMatch = line.match(new RegExp(`this\\.([a-zA-Z0-9_]+)\\.${word}`));
    if (methodCallMatch) {
      const serviceVarName = methodCallMatch[1];
      // Find service class
      const constructorMatch = cm.getValue().match(/constructor\\s*\\(([^)]+)\\)/);
      if (constructorMatch) {
        const paramRegex = new RegExp(
          `(?:private|protected|public)?\\s*(?:readonly)?\\s*${serviceVarName}\\s*:\\s*([a-zA-Z0-9_]+)`
        );
        const pMatch = constructorMatch[1].match(paramRegex);
        if (pMatch) {
          const serviceClassName = pMatch[1];
          for (const [path, entry] of window.vfs.files.entries()) {
            if (entry.content.includes(`class ${serviceClassName}`)) {
              window.codeEditor.openTab(path);
              setTimeout(() => {
                const lines = entry.content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].includes(`${word}(`)) {
                    window.codeEditor.cm.setCursor({ line: i, ch: 0 });
                    window.codeEditor.cm.scrollIntoView({ line: i, ch: 0 }, 200);
                    break;
                  }
                }
              }, 100);
              return;
            }
          }
        }
      }
    }
  }
}
window.LanguageService = LanguageService;
