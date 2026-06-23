/**
 * Code Editor with Multi-Tab Support
 * Manages CodeMirror instances, tab lifecycle, drag-and-drop reorder,
 * and synchronization with the VFS.
 */

class CodeEditor {
  constructor(textareaId) {
    this.textarea = document.getElementById(textareaId);
    if (!this.textarea) return;

    /** @type {Array<{path: string, doc: any}>} */
    this.tabs = [];
    this.activeTabIndex = -1;

    // NestJS keywords for autocomplete
    const nestjsKeywords = [
      'Injectable',
      'Controller',
      'Get',
      'Post',
      'Patch',
      'Delete',
      'Put',
      'Param',
      'Body',
      'Query',
      'Headers',
      'Req',
      'Res',
      'Module',
      'NotFoundException',
      'BadRequestException',
      'UnauthorizedException',
      'ParseIntPipe',
      'ParseUUIDPipe',
      'PipeTransform',
      '@nestjs/common',
      'ExecutionContext',
      'CallHandler',
      'NestInterceptor',
      'CanActivate',
      'UseGuards',
      'UseInterceptors',
      'UsePipes',
      'SetMetadata',
      'createParamDecorator',
      'applyDecorators',
    ];

    // Register NestJS hint helper
    CodeMirror.registerHelper('hint', 'nestjs', function (cm) {
      const cursor = cm.getCursor();
      const token = cm.getTokenAt(cursor);
      let start = token.start,
        end = token.end,
        word = token.string;
      if (word === '@') {
        word = '';
      } else if (word.startsWith('@') && word !== '@nestjs/common') {
        word = word.substring(1);
        start++;
      }
      const jsHints = CodeMirror.hint.javascript(cm) || { list: [] };
      let list = jsHints.list.map((item) => (typeof item === 'string' ? item : item.text));

      // Contextual LS
      if (window.LanguageService) {
        const contextualHints = window.LanguageService.getContextualHints(cm, cursor, token, word);
        if (contextualHints && contextualHints.length > 0) {
          const ctxList = contextualHints.map((hint) => {
            return {
              text: hint.text,
              displayText: hint.displayText || hint.text,
              hint: function (cm, data, completion) {
                cm.replaceRange(completion.text, data.from, data.to);
              },
            };
          });
          return {
            list: ctxList,
            from: CodeMirror.Pos(cursor.line, start),
            to: CodeMirror.Pos(cursor.line, end),
          };
        }
      }

      const nestMatches = nestjsKeywords.filter((k) =>
        k.toLowerCase().startsWith(word.toLowerCase())
      );
      for (let match of nestMatches) {
        if (!list.includes(match) && !list.some((l) => typeof l === 'object' && l.text === match)) {
          list.unshift({
            text: match,
            displayText: match + ' (NestJS)',
            hint: function (cm, data, completion) {
              cm.replaceRange(completion.text, data.from, data.to);
              if (match === '@nestjs/common') return;

              const content = cm.getValue();
              const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@nestjs\/common['"]/;
              const matchImport = content.match(importRegex);

              if (matchImport) {
                const importsStr = matchImport[1];
                const imports = importsStr.split(',').map((s) => s.trim());
                if (!imports.includes(match)) {
                  imports.push(match);
                  const newImportStr = imports.join(', ');
                  const lines = content.split('\n');
                  for (let i = 0; i < lines.length; i++) {
                    if (lines[i].match(importRegex)) {
                      const newStr = lines[i].replace(/\{([^}]+)\}/, `{ ${newImportStr} }`);
                      cm.replaceRange(newStr, { line: i, ch: 0 }, { line: i, ch: lines[i].length });
                      break;
                    }
                  }
                }
              } else {
                cm.replaceRange(`import { ${match} } from '@nestjs/common';\n`, { line: 0, ch: 0 });
              }
            },
          });
        }
      }
      return {
        list,
        from: CodeMirror.Pos(cursor.line, start),
        to: CodeMirror.Pos(cursor.line, end),
      };
    });

    // Initialize CodeMirror
    this.cm = CodeMirror.fromTextArea(this.textarea, {
      mode: 'text/typescript',
      theme: 'material-darker',
      lineNumbers: true,
      autoCloseBrackets: true,
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      lineWrapping: true,
      hintOptions: { hint: CodeMirror.hint.nestjs },
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        Tab: (cm) => {
          if (cm.state.completionActive && cm.state.completionActive.widget) {
            cm.state.completionActive.widget.pick();
          } else if (cm.somethingSelected()) {
            cm.indentSelection('add');
          } else {
            cm.replaceSelection('  ', 'end');
          }
        },
      },
    });

    this.cm.on('inputRead', (cm, change) => {
      if (
        change.origin !== 'setValue' &&
        (change.text[0].match(/[a-zA-Z.]/) || change.text[0] === '@')
      ) {
        CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
      }
    });

    this.cm.on('mousedown', (cm, event) => {
      if (event.ctrlKey || event.metaKey) {
        if (window.LanguageService) {
          window.LanguageService.goToDefinition(cm, event);
        }
      }
    });

    this.cm.on('focus', () => {
      this.cm.getWrapperElement().closest('.editor-wrapper').classList.add('focused');
    });
    this.cm.on('blur', () => {
      this.cm.getWrapperElement().closest('.editor-wrapper').classList.remove('focused');
    });

    // Sync content back to VFS on change
    this.cm.on('change', () => {
      if (this.activeTabIndex >= 0 && this.activeTabIndex < this.tabs.length) {
        const tab = this.tabs[this.activeTabIndex];
        if (window.vfs) {
          window.vfs.setContent(tab.path, this.cm.getValue());
        }
      }
    });

    this._setupTabsUI();
    this._setupDragAndDrop();
  }

  // ==================== Tab UI ====================

  _setupTabsUI() {
    this.tabsEl = document.getElementById('editor-tabs');
    this.addTabBtn = document.getElementById('add-tab-btn');
    if (this.addTabBtn) {
      this.addTabBtn.addEventListener('click', () => {
        const name = prompt('Nombre del nuevo fichero (ej: user.service.ts):');
        if (name && name.trim()) {
          const path = 'src/' + name.trim();
          if (window.vfs) {
            window.vfs.createFile(path, '');
          }
          this.openTab(path, '');
        }
      });
    }
  }

  _setupDragAndDrop() {
    this._dragSrcIndex = null;
  }

  /** Open a file as a tab (or switch to it if already open) */
  openTab(filePath, content) {
    const existingIndex = this.tabs.findIndex((t) => t.path === filePath);
    if (existingIndex >= 0) {
      if (content != null) {
        this.tabs[existingIndex].doc.setValue(content);
      }
      this.selectTab(existingIndex);
      return;
    }

    const fileContent =
      content != null ? content : window.vfs ? window.vfs.getContent(filePath) || '' : '';
    const doc = CodeMirror.Doc(fileContent, 'text/typescript');

    // Store doc in VFS
    if (window.vfs) {
      window.vfs.setDoc(filePath, doc);
    }

    this.tabs.push({ path: filePath, doc });
    this.selectTab(this.tabs.length - 1);
  }

  /** Switch to a tab by index */
  selectTab(index) {
    if (index < 0 || index >= this.tabs.length) return;

    // Save current doc content to VFS before swapping
    if (this.activeTabIndex >= 0 && this.activeTabIndex < this.tabs.length) {
      const oldTab = this.tabs[this.activeTabIndex];
      if (window.vfs) {
        window.vfs.setContent(oldTab.path, oldTab.doc.getValue());
      }
    }

    this.activeTabIndex = index;
    this.cm.swapDoc(this.tabs[index].doc);
    this._renderTabs();
    this.cm.focus();
    setTimeout(() => this.cm.refresh(), 10);
  }

  /** Close a tab */
  closeTab(index, event) {
    if (event) event.stopPropagation();
    if (this.tabs.length <= 1) return; // Keep at least one

    const closedPath = this.tabs[index].path;
    this.tabs.splice(index, 1);

    if (this.activeTabIndex >= this.tabs.length) {
      this.activeTabIndex = this.tabs.length - 1;
    } else if (this.activeTabIndex > index) {
      this.activeTabIndex--;
    } else if (this.activeTabIndex === index) {
      this.activeTabIndex = Math.min(index, this.tabs.length - 1);
    }

    this.selectTab(this.activeTabIndex);
  }

  /** Rename a tab (called when VFS renames a file) */
  renameTab(oldPath, newPath) {
    const tab = this.tabs.find((t) => t.path === oldPath);
    if (tab) {
      tab.path = newPath;
      this._renderTabs();
    }
  }

  /** Render the tab bar */
  _renderTabs() {
    if (!this.tabsEl) return;
    this.tabsEl.innerHTML = '';

    this.tabs.forEach((tab, index) => {
      const tabEl = document.createElement('div');
      tabEl.className = `editor-tab ${index === this.activeTabIndex ? 'active' : ''}`;
      tabEl.draggable = true;
      tabEl.dataset.index = index;

      const basename = tab.path.split('/').pop();
      const icon = this._getTabIcon(basename);

      tabEl.innerHTML = `
                <span class="tab-icon">${icon}</span>
                <span class="tab-name">${basename}</span>
                ${this.tabs.length > 1 ? '<span class="editor-tab-close" title="Cerrar">&times;</span>' : ''}
            `;

      tabEl.addEventListener('click', () => this.selectTab(index));

      // Double-click to rename
      const nameSpan = tabEl.querySelector('.tab-name');
      nameSpan.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this._startRenameTab(index, nameSpan);
      });

      // Close button
      const closeBtn = tabEl.querySelector('.editor-tab-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => this.closeTab(index, e));
      }

      // Drag & drop
      tabEl.addEventListener('dragstart', (e) => {
        this._dragSrcIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        tabEl.classList.add('dragging');
      });
      tabEl.addEventListener('dragend', () => {
        tabEl.classList.remove('dragging');
      });
      tabEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        tabEl.classList.add('drag-over');
      });
      tabEl.addEventListener('dragleave', () => {
        tabEl.classList.remove('drag-over');
      });
      tabEl.addEventListener('drop', (e) => {
        e.preventDefault();
        tabEl.classList.remove('drag-over');
        if (this._dragSrcIndex !== null && this._dragSrcIndex !== index) {
          // Swap tabs
          const [moved] = this.tabs.splice(this._dragSrcIndex, 1);
          this.tabs.splice(index, 0, moved);
          if (this.activeTabIndex === this._dragSrcIndex) {
            this.activeTabIndex = index;
          } else if (this._dragSrcIndex < this.activeTabIndex && index >= this.activeTabIndex) {
            this.activeTabIndex--;
          } else if (this._dragSrcIndex > this.activeTabIndex && index <= this.activeTabIndex) {
            this.activeTabIndex++;
          }
          this._renderTabs();
        }
        this._dragSrcIndex = null;
      });

      this.tabsEl.appendChild(tabEl);
    });
  }

  _getTabIcon(filename) {
    if (filename.endsWith('.module.ts')) return '📦';
    if (filename.endsWith('.controller.ts')) return '🎮';
    if (filename.endsWith('.service.ts')) return '⚙️';
    if (filename.endsWith('.dto.ts')) return '📋';
    if (filename.endsWith('.entity.ts')) return '🗃️';
    if (filename.endsWith('.guard.ts')) return '🛡️';
    if (filename.endsWith('.pipe.ts')) return '🔧';
    if (filename.endsWith('.spec.ts')) return '🧪';
    if (filename.endsWith('.ts')) return '📄';
    return '📄';
  }

  /** Inline rename of a tab */
  _startRenameTab(index, nameSpan) {
    const tab = this.tabs[index];
    const oldBasename = tab.path.split('/').pop();
    const parentPath = tab.path.substring(0, tab.path.length - oldBasename.length);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tab-rename-input';
    input.value = oldBasename;
    input.style.width = `${Math.max(oldBasename.length * 8, 60)}px`;

    nameSpan.replaceWith(input);
    input.focus();
    input.select();

    const commit = () => {
      const newName = input.value.trim();
      if (newName && newName !== oldBasename) {
        const newPath = parentPath + newName;
        if (window.vfs) {
          window.vfs.renameFile(tab.path, newPath);
        }
        tab.path = newPath;
      }
      this._renderTabs();
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      }
      if (e.key === 'Escape') {
        input.value = oldBasename;
        input.blur();
      }
    });
  }

  // ==================== Public API ====================

  /**
   * Load a multi-file exercise into the editor.
   * @param {Object[]} files - [{path, content}]
   */
  loadProject(files) {
    // Clear all tabs
    this.tabs = [];
    this.activeTabIndex = -1;

    // Load into VFS
    if (window.vfs) {
      window.vfs.loadProject(files);
    }

    // Open tabs for each file
    files.forEach((f, i) => {
      const doc = CodeMirror.Doc(f.content || '', 'text/typescript');
      if (window.vfs) window.vfs.setDoc(f.path, doc);
      this.tabs.push({ path: f.path, doc });
    });

    // Select first tab
    if (this.tabs.length > 0) {
      this.selectTab(0);
    }
  }

  /** Legacy API: set a single-file value */
  setValue(value) {
    this.loadProject([{ path: 'src/main.ts', content: value || '' }]);
  }

  /** Get all files as an object for backend execution */
  getProjectFiles() {
    if (!window.vfs) {
      return { 'src/main.ts': this.cm ? this.cm.getValue() : this.textarea.value };
    }
    return window.vfs.getAllContents();
  }

  /** Legacy API support */
  getValue() {
    const files = this.getProjectFiles();
    return Object.entries(files)
      .map(([p, content]) => `// ---- ${p} ----\n${content}`)
      .join('\n\n');
  }

  /** Select a file from the tree (opens it as tab) */
  selectFile(filePath) {
    this.openTab(filePath);
  }

  focus() {
    if (this.cm) this.cm.focus();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.codeEditor = new CodeEditor('code-editor');
});
