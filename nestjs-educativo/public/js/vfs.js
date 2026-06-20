/**
 * Virtual File System (VFS)
 * Manages a hierarchical in-memory file system for the NestJS Educational Platform.
 * Provides CRUD operations, path resolution, and event-driven updates.
 */

class VirtualFileSystem {
    constructor() {
        /** @type {Map<string, {content: string, doc: any|null}>} */
        this.files = new Map();
        this.listeners = [];
    }

    /** Subscribe to VFS change events */
    onChange(callback) {
        this.listeners.push(callback);
    }

    _emit(event, data) {
        this.listeners.forEach(fn => fn(event, data));
    }

    /**
     * Load a project structure from an exercise definition.
     * @param {Object[]} files - Array of {path, content} objects
     */
    loadProject(files) {
        this.files.clear();
        files.forEach(f => {
            this.files.set(f.path, { content: f.content, doc: null });
        });
        this._emit('project-loaded', { files: this.getPaths() });
    }

    /** Create or overwrite a file */
    createFile(filePath, content = '') {
        this.files.set(filePath, { content, doc: null });
        this._emit('file-created', { path: filePath });
    }

    /** Delete a file */
    deleteFile(filePath) {
        if (!this.files.has(filePath)) return false;
        this.files.delete(filePath);
        this._emit('file-deleted', { path: filePath });
        return true;
    }

    /** Rename / move a file */
    renameFile(oldPath, newPath) {
        if (!this.files.has(oldPath)) return false;
        const entry = this.files.get(oldPath);
        this.files.delete(oldPath);
        this.files.set(newPath, entry);
        this._emit('file-renamed', { oldPath, newPath });
        return true;
    }

    /** Rename a folder (updates all paths under it) */
    renameFolder(oldPrefix, newPrefix) {
        const affected = [];
        for (const [path, entry] of this.files.entries()) {
            if (path.startsWith(oldPrefix + '/') || path === oldPrefix) {
                const newPath = newPrefix + path.slice(oldPrefix.length);
                this.files.delete(path);
                this.files.set(newPath, entry);
                affected.push({ oldPath: path, newPath });
            }
        }
        if (affected.length) {
            this._emit('folder-renamed', { oldPrefix, newPrefix, affected });
        }
        return affected.length > 0;
    }

    /** Get file content */
    getContent(filePath) {
        const entry = this.files.get(filePath);
        return entry ? entry.content : null;
    }

    /** Update file content (from editor) */
    setContent(filePath, content) {
        const entry = this.files.get(filePath);
        if (entry) {
            entry.content = content;
            this._emit('content-changed', { path: filePath });
        }
    }

    /** Get CodeMirror Doc reference */
    getDoc(filePath) {
        const entry = this.files.get(filePath);
        return entry ? entry.doc : null;
    }

    /** Store CodeMirror Doc reference */
    setDoc(filePath, doc) {
        const entry = this.files.get(filePath);
        if (entry) entry.doc = doc;
    }

    /** Check if a file exists */
    hasFile(filePath) {
        return this.files.has(filePath);
    }

    /** Get all file paths sorted */
    getPaths() {
        return Array.from(this.files.keys()).sort();
    }

    /**
     * Build a hierarchical tree structure from flat paths.
     * Returns a nested object suitable for rendering.
     */
    getTree() {
        const root = { name: 'project', type: 'folder', children: [], path: '' };
        const paths = this.getPaths();

        paths.forEach(filePath => {
            const parts = filePath.split('/');
            let current = root;

            parts.forEach((part, i) => {
                if (i === parts.length - 1) {
                    current.children.push({
                        name: part,
                        type: 'file',
                        path: filePath,
                        children: []
                    });
                } else {
                    let folder = current.children.find(c => c.name === part && c.type === 'folder');
                    if (!folder) {
                        folder = {
                            name: part,
                            type: 'folder',
                            path: parts.slice(0, i + 1).join('/'),
                            children: []
                        };
                        current.children.push(folder);
                    }
                    current = folder;
                }
            });
        });

        const sortNode = (node) => {
            if (node.children) {
                node.children.sort((a, b) => {
                    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                    return a.name.localeCompare(b.name);
                });
                node.children.forEach(sortNode);
            }
        };
        sortNode(root);

        return root;
    }

    /**
     * Get all file contents as a map for validation.
     * @returns {Object} { "path": "content", ... }
     */
    getAllContents() {
        const result = {};
        for (const [path, entry] of this.files.entries()) {
            // If there's an attached CodeMirror doc, use its live value
            result[path] = entry.doc ? entry.doc.getValue() : entry.content;
        }
        return result;
    }

    /** Get all folders (unique directory paths) */
    getFolders() {
        const folders = new Set();
        for (const filePath of this.files.keys()) {
            const parts = filePath.split('/');
            for (let i = 1; i < parts.length; i++) {
                folders.add(parts.slice(0, i).join('/'));
            }
        }
        return Array.from(folders).sort();
    }
}

// Global singleton
window.vfs = new VirtualFileSystem();
