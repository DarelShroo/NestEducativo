/**
 * File Tree Component
 * VS Code-like hierarchical file explorer with context menus.
 */

class FileTree {
    constructor(containerEl) {
        this.container = containerEl;
        this.selectedPath = null;
        this.expandedFolders = new Set();
        this.onFileSelect = null;    // callback(path)
        this.onFileCreate = null;    // callback(parentFolder)
        this.onFileDelete = null;    // callback(path)
        this.onFileRename = null;    // callback(oldPath, newPath)
        this.onFolderCreate = null;  // callback(parentFolder)

        // Listen for VFS changes
        if (window.vfs) {
            window.vfs.onChange(() => this.render());
        }

        // Close context menu on click outside
        document.addEventListener('click', () => this._closeContextMenu());
    }

    render() {
        if (!window.vfs) return;
        const tree = window.vfs.getTree();
        this.container.innerHTML = '';

        // Expand root and src by default
        this.expandedFolders.add('');
        this.expandedFolders.add('src');

        // Render root children directly (skip the invisible project root)
        tree.children.forEach(child => {
            this.container.appendChild(this._renderNode(child, 0));
        });
    }

    _renderNode(node, depth) {
        const el = document.createElement('div');
        el.className = 'tree-node';

        if (node.type === 'folder') {
            const isExpanded = this.expandedFolders.has(node.path);
            const row = document.createElement('div');
            row.className = `tree-row tree-folder depth-${depth}`;
            row.style.paddingLeft = `${8 + depth * 16}px`;
            row.innerHTML = `
                <span class="tree-icon tree-chevron">${isExpanded ? '▾' : '▸'}</span>
                <span class="tree-icon">📁</span>
                <span class="tree-label">${node.name}/</span>
            `;
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isExpanded) {
                    this.expandedFolders.delete(node.path);
                } else {
                    this.expandedFolders.add(node.path);
                }
                this.render();
            });
            row.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._showContextMenu(e, 'folder', node);
            });
            el.appendChild(row);

            if (isExpanded && node.children) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';
                node.children.forEach(child => {
                    childrenContainer.appendChild(this._renderNode(child, depth + 1));
                });
                el.appendChild(childrenContainer);
            }
        } else {
            // File
            const row = document.createElement('div');
            row.className = `tree-row tree-file depth-${depth}`;
            if (this.selectedPath === node.path) row.classList.add('selected');
            row.style.paddingLeft = `${8 + depth * 16}px`;

            const icon = this._getFileIcon(node.name);
            row.innerHTML = `
                <span class="tree-icon">${icon}</span>
                <span class="tree-label">${node.name}</span>
            `;
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedPath = node.path;
                if (this.onFileSelect) this.onFileSelect(node.path);
                this.render();
            });
            row.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._showContextMenu(e, 'file', node);
            });
            el.appendChild(row);
        }

        return el;
    }

    _getFileIcon(filename) {
        if (filename.endsWith('.module.ts')) return '📦';
        if (filename.endsWith('.controller.ts')) return '🎮';
        if (filename.endsWith('.service.ts')) return '⚙️';
        if (filename.endsWith('.dto.ts')) return '📋';
        if (filename.endsWith('.entity.ts')) return '🗃️';
        if (filename.endsWith('.guard.ts')) return '🛡️';
        if (filename.endsWith('.pipe.ts')) return '🔧';
        if (filename.endsWith('.interceptor.ts')) return '🔄';
        if (filename.endsWith('.decorator.ts')) return '🏷️';
        if (filename.endsWith('.spec.ts')) return '🧪';
        if (filename.endsWith('.ts')) return '📄';
        return '📄';
    }

    _showContextMenu(event, type, node) {
        this._closeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'tree-context-menu';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;

        const items = [];

        if (type === 'folder') {
            items.push({ label: '📄 Nuevo Archivo', action: () => {
                const name = prompt('Nombre del archivo (ej: user.service.ts):');
                if (name && name.trim()) {
                    const newPath = `${node.path}/${name.trim()}`;
                    if (this.onFileCreate) this.onFileCreate(newPath);
                }
            }});
            items.push({ label: '📁 Nueva Carpeta', action: () => {
                const name = prompt('Nombre de la carpeta (ej: dto):');
                if (name && name.trim()) {
                    const folderPath = `${node.path}/${name.trim()}`;
                    if (this.onFolderCreate) this.onFolderCreate(folderPath);
                }
            }});
            // Don't allow renaming the root 'src' folder
            if (node.path !== 'src') {
                items.push({ label: '✏️ Renombrar Carpeta', action: () => {
                    const parts = node.path.split('/');
                    const oldName = parts.pop();
                    const newName = prompt('Nuevo nombre:', oldName);
                    if (newName && newName.trim() && newName !== oldName) {
                        const newPath = [...parts, newName.trim()].join('/');
                        if (this.onFileRename) this.onFileRename(node.path, newPath, 'folder');
                    }
                }});
            }
        } else {
            items.push({ label: '✏️ Renombrar', action: () => {
                const parts = node.path.split('/');
                const oldName = parts.pop();
                const newName = prompt('Nuevo nombre:', oldName);
                if (newName && newName.trim() && newName !== oldName) {
                    const newPath = [...parts, newName.trim()].join('/');
                    if (this.onFileRename) this.onFileRename(node.path, newPath, 'file');
                }
            }});
            items.push({ label: '🗑️ Eliminar', action: () => {
                if (confirm(`¿Eliminar "${node.name}"?`)) {
                    if (this.onFileDelete) this.onFileDelete(node.path);
                }
            }});
        }

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'tree-context-item';
            el.textContent = item.label;
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this._closeContextMenu();
                item.action();
            });
            menu.appendChild(el);
        });

        document.body.appendChild(menu);
        this._activeMenu = menu;
    }

    _closeContextMenu() {
        if (this._activeMenu) {
            this._activeMenu.remove();
            this._activeMenu = null;
        }
    }
}

window.FileTree = FileTree;
