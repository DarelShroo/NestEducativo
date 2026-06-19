/**
 * Code Editor Enhancements using CodeMirror
 */

class CodeEditor {
    constructor(textareaId) {
        this.textarea = document.getElementById(textareaId);
        if (!this.textarea) return;

        // Initialize CodeMirror
        this.cm = CodeMirror.fromTextArea(this.textarea, {
            mode: "text/typescript",
            theme: "material-darker",
            lineNumbers: true,
            autoCloseBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            indentWithTabs: false,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Tab": (cm) => {
                    if (cm.somethingSelected()) {
                        cm.indentSelection("add");
                    } else {
                        cm.replaceSelection("  ", "end");
                    }
                }
            }
        });

        // Auto-show hints when typing letters
        this.cm.on("inputRead", (cm, change) => {
            if (change.origin !== "setValue" && change.text[0].match(/[a-zA-Z]/)) {
                CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
            }
        });
        
        // Let the wrapper know it's ready
        this.cm.on("focus", () => {
            this.cm.getWrapperElement().parentNode.classList.add("focused");
        });
        
        this.cm.on("blur", () => {
            this.cm.getWrapperElement().parentNode.classList.remove("focused");
        });
    }

    setValue(value) {
        if (this.cm) {
            this.cm.setValue(value || '');
            // Refresh to ensure proper rendering if it was hidden
            setTimeout(() => this.cm.refresh(), 10);
        } else {
            this.textarea.value = value || '';
        }
    }

    getValue() {
        if (this.cm) {
            return this.cm.getValue();
        }
        return this.textarea.value;
    }

    focus() {
        if (this.cm) {
            this.cm.focus();
        } else {
            this.textarea.focus();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.codeEditor = new CodeEditor('code-editor');
});
