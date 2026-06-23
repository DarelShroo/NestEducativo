/**
 * Main Application Logic
 * NestJS Educational Platform
 */

// Application State
const state = {
  currentLevel: null,
  currentExercise: null,
  currentSection: 'welcome',
  exercises: [],
  progress: loadProgress(),
  initialFiles: [],
};

function saveUIState() {
  const uiState = {
    currentLevel: state.currentLevel,
    currentSection: state.currentSection,
    currentExerciseId: state.currentExercise ? state.currentExercise.id : null,
  };
  localStorage.setItem('nestjs_educativo_ui_state', JSON.stringify(uiState));
}

function loadUIState() {
  const saved = localStorage.getItem('nestjs_educativo_ui_state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// DOM Elements
const elements = {
  // Sections
  welcomeSection: document.getElementById('welcome-section'),
  nivelInfoSection: document.getElementById('nivel-info-section'),
  ejerciciosListaSection: document.getElementById('ejercicios-lista-section'),
  ejercicioDetalleSection: document.getElementById('ejercicio-detalle-section'),

  // Navigation
  navHomeBtn: document.getElementById('nav-home-btn'),
  logoBtn: document.getElementById('logo-btn'),
  backToWelcome: document.getElementById('back-to-welcome'),
  viewExercisesBtn: document.getElementById('view-exercises-btn'),
  backToInfo: document.getElementById('back-to-info'),
  backToList: document.getElementById('back-to-list'),

  // Level Info
  nivelTitle: document.getElementById('nivel-title'),
  nivelReadme: document.getElementById('nivel-readme'),

  // Exercise List
  ejerciciosTitle: document.getElementById('ejercicios-title'),
  ejerciciosGrid: document.getElementById('ejercicios-grid'),

  // Exercise Detail
  ejercicioTitulo: document.getElementById('ejercicio-titulo'),
  ejercicioDificultad: document.getElementById('ejercicio-dificultad'),
  ejercicioConcepts: document.getElementById('ejercicio-concepts'),
  ejercicioDescripcion: document.getElementById('ejercicio-descripcion'),
  codeEditor: document.getElementById('code-editor'),
  showSolutionBtn: document.getElementById('show-solution-btn'),
  resetCodeBtn: document.getElementById('reset-code-btn'),
  formatCodeBtn: document.getElementById('format-code-btn'),
  validarBtn: document.getElementById('validar-btn'),
  loadingIndicator: document.getElementById('loading-indicator'),
  hintsList: document.getElementById('hints-list'),
  toggleHintsBtn: document.getElementById('toggle-hints-btn'),
  hintsBtnText: document.getElementById('hints-btn-text'),

  // Results
  resultadoPanel: document.getElementById('resultado-panel'),
  resultadoStatus: document.getElementById('resultado-status'),
  resultadoOutput: document.getElementById('resultado-output'),
  resultadoOutputSection: document.getElementById('resultado-output-section'),
  resultadoErrores: document.getElementById('resultado-errores'),
  resultadoErroresSection: document.getElementById('resultado-errores-section'),
  resultadoSugerencias: document.getElementById('resultado-sugerencias'),
  resultadoSugerenciasSection: document.getElementById('resultado-sugerencias-section'),
  closeResultBtn: document.getElementById('close-result-btn'),

  // Progress
  progresoSidebar: document.getElementById('progreso-sidebar'),
  progresoList: document.getElementById('progreso-list'),
  statCompleted: document.getElementById('stat-completed'),
  statTotal: document.getElementById('stat-total'),
  progresoBar: document.getElementById('progreso-bar'),
  toggleProgresoBtn: document.getElementById('toggle-progreso-btn'),
  floatingToggleProgresoBtn: document.getElementById('floating-toggle-progreso-btn'),

  // Status
  statusIndicator: document.getElementById('status-indicator'),

  // IDE
  fileTreeContainer: document.getElementById('file-tree-container'),

  // Terminal
  terminalInput: document.getElementById('terminal-input'),
  terminalOutput: document.getElementById('terminal-output'),

  // HTTP Simulator
  openHttpSimulatorBtn: document.getElementById('open-http-simulator-btn'),
  httpSimulatorModal: document.getElementById('http-simulator-modal'),
  closeHttpModalBtn: document.getElementById('close-http-modal-btn'),
  httpMethod: document.getElementById('http-method'),
  httpRoute: document.getElementById('http-route'),
  httpBody: document.getElementById('http-body'),
  httpSendBtn: document.getElementById('http-send-btn'),
  httpResponseStatus: document.getElementById('http-response-status'),
  httpResponseBody: document.getElementById('http-response-body'),
};

// File tree and CLI instances
let fileTree = null;
let nestCli = null;

// ========== Initialization ==========

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  attachEventListeners();
  checkServerStatus();
});

function initializeApp() {
  const savedUIState = loadUIState();
  if (savedUIState && savedUIState.currentLevel) {
    handleLevelChange(savedUIState.currentLevel).then(() => {
      if (savedUIState.currentSection === 'ejercicios-lista') {
        showSection('ejercicios-lista');
      } else if (
        savedUIState.currentSection === 'ejercicio-detalle' &&
        savedUIState.currentExerciseId
      ) {
        loadExerciseDetail(savedUIState.currentExerciseId);
      } else {
        showSection(savedUIState.currentSection || 'welcome');
      }
    });
  } else {
    showSection('welcome');
  }
  updateProgressDisplay();
  setInterval(checkServerStatus, 30000);

  // Initialize file tree
  if (elements.fileTreeContainer && window.FileTree) {
    fileTree = new FileTree(elements.fileTreeContainer);

    fileTree.onFileSelect = (path) => {
      if (window.codeEditor) {
        window.codeEditor.selectFile(path);
      }
    };

    fileTree.onFileCreate = (path) => {
      if (window.vfs) {
        window.vfs.createFile(path, '');
        if (window.codeEditor) {
          window.codeEditor.openTab(path, '');
        }
      }
    };

    fileTree.onFileDelete = (path) => {
      if (window.vfs) {
        window.vfs.deleteFile(path);
        // Close the tab if open
        if (window.codeEditor) {
          const tabIdx = window.codeEditor.tabs.findIndex((t) => t.path === path);
          if (tabIdx >= 0) {
            window.codeEditor.closeTab(tabIdx);
          }
        }
      }
    };

    fileTree.onFileRename = (oldPath, newPath, type) => {
      if (window.vfs) {
        if (type === 'folder') {
          window.vfs.renameFolder(oldPath, newPath);
          // Update tabs
          if (window.codeEditor) {
            window.codeEditor.tabs.forEach((tab) => {
              if (tab.path.startsWith(oldPath + '/') || tab.path === oldPath) {
                const updated = newPath + tab.path.slice(oldPath.length);
                tab.path = updated;
              }
            });
            window.codeEditor._renderTabs();
          }
        } else {
          window.vfs.renameFile(oldPath, newPath);
          if (window.codeEditor) {
            window.codeEditor.renameTab(oldPath, newPath);
          }
        }
      }
    };

    fileTree.onFolderCreate = (folderPath) => {
      // Create a .gitkeep-style placeholder so the folder appears
      if (window.vfs) {
        const placeholder = folderPath + '/.gitkeep';
        window.vfs.createFile(placeholder, '');
      }
    };

    fileTree.onFolderDelete = (folderPath) => {
      if (window.vfs) {
        window.vfs.deleteFolder(folderPath);
        // Ensure any open tabs belonging to the deleted folder are closed
        if (window.codeEditor) {
          for (let i = window.codeEditor.tabs.length - 1; i >= 0; i--) {
            const tab = window.codeEditor.tabs[i];
            if (tab.path.startsWith(folderPath + '/') || tab.path === folderPath) {
              window.codeEditor.closeTab(i);
            }
          }
        }
      }
    };
  }

  if (window.vfs) {
    // Save state on any VFS change (debounced slightly to prevent stuttering if needed, though direct is fine for small apps)
    let saveTimeout;
    window.vfs.onChange(() => {
      if (state.currentLevel && state.currentExerciseId) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          const savedFilesKey = `nestjs_educativo_files_${state.currentLevel}_${state.currentExerciseId}`;
          localStorage.setItem(savedFilesKey, JSON.stringify(window.vfs.getAllContents()));
        }, 500);
      }
    });
  }

  // Initialize Nest CLI Simulator
  if (window.NestCLI) {
    nestCli = new NestCLI();
    nestCli.onOutput = (msg, isError) => {
      if (!elements.terminalOutput) return;
      const line = document.createElement('div');
      line.className = isError
        ? 'error'
        : msg.startsWith('CREATE') || msg.startsWith('UPDATE')
          ? 'success'
          : '';
      line.textContent = msg;
      elements.terminalOutput.appendChild(line);
      elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight;
    };
  }
}

async function checkServerStatus() {
  try {
    const status = await api.checkStatus();
    const dot = elements.statusIndicator.querySelector('.status-dot');

    if (status.docker && typeof status.docker === 'string' && status.docker.includes('Up')) {
      dot.style.background = 'var(--accent-success)';
      dot.title = 'Docker container running';
    } else {
      dot.style.background = 'var(--accent-error)';
      dot.title = 'Docker container not running';
    }
  } catch (error) {
    const dot = elements.statusIndicator.querySelector('.status-dot');
    dot.style.background = 'var(--accent-warning)';
    dot.title = 'Cannot connect to server';
  }
}

// ========== Event Listeners ==========

function attachEventListeners() {
  document.querySelectorAll('.level-card:not(.disabled)').forEach((card) => {
    card.addEventListener('click', () => {
      const nivel = parseInt(card.dataset.level);
      handleLevelChange(nivel);
    });
  });

  if (elements.navHomeBtn)
    elements.navHomeBtn.addEventListener('click', () => showSection('welcome'));
  if (elements.logoBtn) elements.logoBtn.addEventListener('click', () => showSection('welcome'));

  elements.backToWelcome.addEventListener('click', () => showSection('welcome'));
  elements.viewExercisesBtn.addEventListener('click', () => showSection('ejercicios-lista'));
  elements.backToInfo.addEventListener('click', () => showSection('nivel-info'));
  elements.backToList.addEventListener('click', () => showSection('ejercicios-lista'));

  elements.toggleHintsBtn.addEventListener('click', handleToggleHints);
  elements.showSolutionBtn.addEventListener('click', handleShowSolution);
  elements.resetCodeBtn.addEventListener('click', handleResetCode);
  if (elements.formatCodeBtn) elements.formatCodeBtn.addEventListener('click', handleFormatCode);
  elements.validarBtn.addEventListener('click', handleValidation);
  if (elements.openHttpSimulatorBtn)
    elements.openHttpSimulatorBtn.addEventListener('click', () => {
      elements.httpSimulatorModal.classList.remove('hidden');
    });
  if (elements.closeHttpModalBtn)
    elements.closeHttpModalBtn.addEventListener('click', () => {
      elements.httpSimulatorModal.classList.add('hidden');
    });
  if (elements.httpSendBtn) elements.httpSendBtn.addEventListener('click', handleHttpSimulation);

  if (elements.toggleProgresoBtn) {
    elements.toggleProgresoBtn.addEventListener('click', () => {
      elements.progresoSidebar.classList.add('hidden');
      if (elements.floatingToggleProgresoBtn && state.currentLevel) {
        elements.floatingToggleProgresoBtn.classList.remove('hidden');
      }
    });
  }

  if (elements.floatingToggleProgresoBtn) {
    elements.floatingToggleProgresoBtn.addEventListener('click', () => {
      elements.progresoSidebar.classList.remove('hidden');
      elements.floatingToggleProgresoBtn.classList.add('hidden');
    });
  }

  elements.closeResultBtn.addEventListener('click', () => {
    elements.resultadoPanel.classList.add('hidden');
  });

  // Terminal Input
  if (elements.terminalInput) {
    elements.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = e.target.value;
        if (!cmd.trim()) return;

        // Echo command
        const echo = document.createElement('div');
        echo.innerHTML = `<span style="color:var(--accent-success)">$</span> ${cmd}`;
        elements.terminalOutput.appendChild(echo);

        // Execute
        if (nestCli) {
          nestCli.execute(cmd);
        } else {
          const err = document.createElement('div');
          err.className = 'error';
          err.textContent = 'NestCLI simulator not initialized.';
          elements.terminalOutput.appendChild(err);
        }

        elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight;
        e.target.value = '';
      }
    });
  }
}

// ========== Section Management ==========

function showSection(section) {
  elements.welcomeSection.classList.add('hidden');
  elements.nivelInfoSection.classList.add('hidden');
  elements.ejerciciosListaSection.classList.add('hidden');
  elements.ejercicioDetalleSection.classList.add('hidden');
  elements.progresoSidebar.classList.add('hidden');
  if (elements.floatingToggleProgresoBtn)
    elements.floatingToggleProgresoBtn.classList.add('hidden');

  switch (section) {
    case 'welcome':
      elements.welcomeSection.classList.remove('hidden');
      break;
    case 'nivel-info':
      elements.nivelInfoSection.classList.remove('hidden');
      break;
    case 'ejercicios-lista':
      elements.ejerciciosListaSection.classList.remove('hidden');
      elements.progresoSidebar.classList.remove('hidden');
      if (elements.floatingToggleProgresoBtn)
        elements.floatingToggleProgresoBtn.classList.add('hidden');
      displayExerciseList(); // <-- Call this to ensure the grid is populated
      updateProgressDisplay();
      break;
    case 'ejercicio-detalle':
      elements.ejercicioDetalleSection.classList.remove('hidden');
      elements.progresoSidebar.classList.remove('hidden');
      if (elements.floatingToggleProgresoBtn)
        elements.floatingToggleProgresoBtn.classList.add('hidden');
      break;
  }

  state.currentSection = section;
  saveUIState();

  window.scrollTo(0, 0);
}

// ========== Level Handling ==========

async function handleLevelChange(nivel) {
  if (!nivel) {
    showSection('welcome');
    return;
  }

  state.currentLevel = nivel;
  saveUIState();

  try {
    const levelInfo = await api.getLevelInfo(nivel);
    displayLevelInfo(nivel, levelInfo);

    const exercises = await api.getExercises(nivel);
    state.exercises = exercises;

    showSection('nivel-info');
    updateProgressDisplay();
  } catch (error) {
    console.error('Error loading level:', error);
    alert('Error al cargar el nivel. Por favor, intenta de nuevo.');
  }
}

function displayLevelInfo(nivel, levelInfo) {
  const nivelNames = {
    1: 'Nivel 1: TypeScript Intro',
    2: 'Nivel 2: Conceptos NestJS',
    3: 'Nivel 3: DTOs y Validación',
    4: 'Nivel 4: Nest CLI Resource',
  };

  elements.nivelTitle.textContent = nivelNames[nivel];
  elements.nivelReadme.innerHTML = markdownToHTML(levelInfo.readme);
}

// ========== Exercise List ==========

function displayExerciseList() {
  const nivelNames = {
    1: 'Nivel 1: TypeScript Intro',
    2: 'Nivel 2: Conceptos NestJS',
    3: 'Nivel 3: DTOs y Validación',
    4: 'Nivel 4: Nest CLI Resource',
  };

  elements.ejerciciosTitle.textContent = `${nivelNames[state.currentLevel]} - Ejercicios`;
  elements.ejerciciosGrid.innerHTML = '';

  state.exercises.forEach((exercise) => {
    const card = createExerciseCard(exercise);
    elements.ejerciciosGrid.appendChild(card);
  });
}

function createExerciseCard(exercise) {
  const card = document.createElement('div');
  card.className = 'ejercicio-card';

  const isCompleted = isExerciseCompleted(state.currentLevel, exercise.id);
  if (isCompleted) {
    card.classList.add('completed');
  }

  card.innerHTML = `
    <div class="ejercicio-card-header">
      <h3 class="ejercicio-card-title">
        ${isCompleted ? '<span class="checkmark">✓</span> ' : ''}
        ${exercise.id}. ${exercise.title_es}
      </h3>
      <span class="badge difficulty-${String(exercise.difficulty).replace(/ /g, '_')}">
        ${getDifficultyLabel(exercise.difficulty)}
      </span>
    </div>
    <div class="ejercicio-card-concepts">
      ${exercise.concepts.map((c) => `<span class="concept-tag">${c}</span>`).join('')}
    </div>
  `;

  card.addEventListener('click', () => loadExerciseDetail(exercise.id));

  return card;
}

function getDifficultyLabel(difficulty) {
  const labels = {
    1: 'Fácil',
    2: 'Medio',
    3: 'Medio',
    4: 'Difícil',
    5: 'Difícil',
    6: 'Muy Difícil',
    7: 'Muy Difícil',
    easy: 'Fácil',
    facil: 'Fácil',
    medium: 'Medio',
    medio: 'Medio',
    hard: 'Difícil',
    dificil: 'Difícil',
    very_hard: 'Muy Difícil',
    muy_dificil: 'Muy Difícil',
    'muy dificil': 'Muy Difícil',
    'very hard': 'Muy Difícil',
  };
  return labels[difficulty] || 'Medio';
}

// ========== Exercise Detail ==========

async function loadExerciseDetail(exerciseId) {
  try {
    const exercise = await api.getExerciseDetail(state.currentLevel, exerciseId);
    state.currentExercise = exercise;
    state.currentExerciseId = exerciseId;
    saveUIState();

    // Store initial files for reset
    if (exercise.files && Array.isArray(exercise.files)) {
      state.initialFiles = JSON.parse(JSON.stringify(exercise.files));
    } else {
      // Legacy single-file exercise
      state.initialFiles = [{ path: 'src/main.ts', content: exercise.initial_script || '' }];
    }

    displayExerciseDetail(exercise);
    showSection('ejercicio-detalle');
  } catch (error) {
    console.error('Error loading exercise detail:', error);
    alert('Error al cargar el ejercicio. Por favor, intenta de nuevo.');
  }
}

function displayExerciseDetail(exercise) {
  elements.ejercicioTitulo.textContent = `${exercise.id}. ${exercise.title_es}`;
  elements.ejercicioDificultad.textContent = getDifficultyLabel(exercise.difficulty);
  elements.ejercicioDificultad.className = `badge difficulty-${String(exercise.difficulty).replace(/ /g, '_')}`;

  elements.ejercicioConcepts.innerHTML = exercise.concepts
    .map((c) => `<span class="concept-tag">${c}</span>`)
    .join('');

  elements.ejercicioDescripcion.innerHTML = markdownToHTML(exercise.description_es);

  // Prepare hints
  const hints = exercise.hints_es || [];
  if (hints.length > 0) {
    elements.hintsList.innerHTML = hints.map((hint) => `<li>${hint}</li>`).join('');
  } else {
    elements.hintsList.innerHTML = '<li>No hay pistas disponibles para este ejercicio</li>';
  }
  elements.hintsList.classList.add('hidden');
  elements.hintsBtnText.textContent = 'Mostrar Pistas';

  // Load project files into editor
  let files = JSON.parse(JSON.stringify(state.initialFiles));
  const savedFilesKey = `nestjs_educativo_files_${state.currentLevel}_${exercise.id}`;
  const savedFiles = localStorage.getItem(savedFilesKey);
  if (savedFiles) {
    try {
      const parsed = JSON.parse(savedFiles);
      files = Object.entries(parsed).map(([path, content]) => ({ path, content }));
    } catch (e) {}
  }

  if (window.codeEditor) {
    window.codeEditor.loadProject(files);
  }

  // Toggle IDE features based on level/complexity
  const isIDE = state.currentLevel >= 2;
  const sidebar = document.getElementById('ide-sidebar');
  const terminal = document.getElementById('terminal-panel');
  const tabsContainer = document.getElementById('editor-tabs-container');

  if (sidebar) sidebar.style.display = isIDE ? 'flex' : 'none';
  if (terminal) terminal.style.display = isIDE ? 'flex' : 'none';
  if (tabsContainer) tabsContainer.style.display = isIDE ? 'flex' : 'none';

  // Render file tree
  if (fileTree && isIDE) {
    fileTree.render();
  }

  // Clear terminal output
  if (elements.terminalOutput) {
    elements.terminalOutput.innerHTML = '';
  }

  // Hide results
  elements.resultadoPanel.classList.add('hidden');

  // Refresh editor after section becomes visible
  setTimeout(() => {
    if (window.codeEditor && window.codeEditor.cm) {
      window.codeEditor.cm.refresh();
    }
  }, 50);
}

function handleToggleHints() {
  const isHidden = elements.hintsList.classList.contains('hidden');

  if (isHidden) {
    elements.hintsList.classList.remove('hidden');
    elements.hintsBtnText.textContent = 'Ocultar Pistas';
  } else {
    elements.hintsList.classList.add('hidden');
    elements.hintsBtnText.textContent = 'Mostrar Pistas';
  }
}

function handleShowSolution() {
  if (!state.currentExercise) return;

  // Multi-file solution
  const solutionFiles = state.currentExercise.solution_files || null;
  const solutionScript = state.currentExercise.solution_script || null;

  if (!solutionFiles && !solutionScript) {
    alert('No hay solución disponible para este ejercicio.');
    return;
  }

  const confirmMsg = 'Esto reemplazará tu código actual con la solución de referencia. ¿Continuar?';
  if (confirm(confirmMsg)) {
    if (solutionFiles && window.codeEditor) {
      // Get current files from the editor
      const currentFiles = window.codeEditor.getProjectFiles();
      // Merge solution files into current files
      const mergedFiles = { ...currentFiles };
      solutionFiles.forEach((file) => {
        mergedFiles[file.path] = file.content;
      });
      // Convert back to array format for loadProject
      const filesArray = Object.entries(mergedFiles).map(([path, content]) => ({ path, content }));
      window.codeEditor.loadProject(filesArray);
      if (fileTree) fileTree.render();
    } else if (solutionScript && window.codeEditor) {
      window.codeEditor.setValue(solutionScript);
      if (fileTree) fileTree.render();
    }
  }
}

function handleResetCode() {
  if (confirm('¿Estás seguro de que quieres reiniciar el código al estado inicial?')) {
    const files = JSON.parse(JSON.stringify(state.initialFiles));

    // Clear saved state
    if (state.currentLevel && state.currentExerciseId) {
      const savedFilesKey = `nestjs_educativo_files_${state.currentLevel}_${state.currentExerciseId}`;
      localStorage.removeItem(savedFilesKey);
    }

    if (window.codeEditor) {
      window.codeEditor.loadProject(files);
    }
    if (fileTree) fileTree.render();
  }
}

async function handleFormatCode() {
  if (!window.prettier || !window.prettierPlugins) {
    alert('Prettier no está cargado correctamente. Intenta recargar la página.');
    return;
  }

  try {
    const content =
      window.codeEditor && window.codeEditor.cm
        ? window.codeEditor.cm.getValue()
        : elements.codeEditor.value;
    const formatted = await prettier.format(content, {
      parser: 'typescript',
      plugins: [prettierPlugins.typescript, prettierPlugins.estree],
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
      printWidth: 100,
    });

    if (window.codeEditor && window.codeEditor.cm) {
      const cursor = window.codeEditor.cm.getCursor();
      window.codeEditor.cm.setValue(formatted);
      window.codeEditor.cm.setCursor(cursor);
      // Ensure content is synced to VFS
      if (window.vfs && window.codeEditor.activeTabIndex >= 0) {
        const tab = window.codeEditor.tabs[window.codeEditor.activeTabIndex];
        window.vfs.setContent(tab.path, formatted);
      }
    } else {
      elements.codeEditor.value = formatted;
    }
  } catch (e) {
    console.error('Error al formatear:', e);
    alert('Error de sintaxis al formatear. Revisa tu código.');
  }
}

// ========== Validation ==========

async function handleValidation() {
  if (!state.currentExercise) return;

  const files = window.codeEditor
    ? window.codeEditor.getProjectFiles()
    : { 'src/main.ts': elements.codeEditor.value };
  const script = window.codeEditor ? window.codeEditor.getValue() : elements.codeEditor.value;

  if (!script.trim() && Object.keys(files).length === 0) {
    alert('Por favor, escribe tu solución antes de validar.');
    return;
  }

  elements.validarBtn.disabled = true;
  elements.loadingIndicator.classList.remove('hidden');
  elements.resultadoPanel.classList.add('hidden');

  try {
    const result = await api.validateExercise(
      state.currentLevel,
      state.currentExercise.id,
      script,
      files
    );

    displayValidationResult(result);

    if (result.correcto) {
      markExerciseCompleted(state.currentLevel, state.currentExercise.id);
      updateProgressDisplay();
    }
  } catch (error) {
    console.error('Error validating:', error);
    displayValidationError(error.message);
  } finally {
    elements.validarBtn.disabled = false;
    elements.loadingIndicator.classList.add('hidden');
  }
}

function displayValidationResult(result) {
  elements.resultadoPanel.classList.remove('hidden');

  elements.resultadoStatus.textContent = result.correcto ? '¡Correcto!' : 'Incorrecto';
  elements.resultadoStatus.className = result.correcto
    ? 'resultado-status success'
    : 'resultado-status error';

  if (result.output) {
    elements.resultadoOutput.textContent = result.output;
    elements.resultadoOutputSection.classList.remove('hidden');
  } else {
    elements.resultadoOutputSection.classList.add('hidden');
  }

  if (result.errores && result.errores.trim()) {
    elements.resultadoErrores.textContent = result.errores;
    elements.resultadoErroresSection.classList.remove('hidden');
  } else {
    elements.resultadoErroresSection.classList.add('hidden');
  }

  if (result.sugerencias && result.sugerencias.length > 0) {
    elements.resultadoSugerencias.innerHTML = result.sugerencias
      .map((s) => `<li>${s}</li>`)
      .join('');
    elements.resultadoSugerenciasSection.classList.remove('hidden');
  } else {
    elements.resultadoSugerenciasSection.classList.add('hidden');
  }

  elements.resultadoPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayValidationError(errorMessage) {
  elements.resultadoPanel.classList.remove('hidden');
  elements.resultadoStatus.textContent = 'Error de validación';
  elements.resultadoStatus.className = 'resultado-status error';

  elements.resultadoErrores.textContent = errorMessage;
  elements.resultadoErroresSection.classList.remove('hidden');

  elements.resultadoOutputSection.classList.add('hidden');
  elements.resultadoSugerenciasSection.classList.add('hidden');

  elements.resultadoPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========== HTTP Simulator ==========

async function handleHttpSimulation() {
  if (!state.currentExercise) return;

  const files = window.codeEditor
    ? window.codeEditor.getProjectFiles()
    : { 'src/main.ts': elements.codeEditor.value };

  const method = elements.httpMethod.value;
  const route = elements.httpRoute.value || '/';
  let body = elements.httpBody.value.trim();

  try {
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      JSON.parse(body); // Validate JSON format
    }
  } catch (e) {
    alert('El JSON del cuerpo no es válido.');
    return;
  }

  elements.httpSendBtn.disabled = true;
  elements.httpSendBtn.textContent = 'Cargando...';
  elements.httpResponseStatus.textContent = 'Procesando...';
  elements.httpResponseBody.textContent = 'Levantando servidor y enviando petición...';
  elements.httpResponseStatus.style.background = '#374151';
  elements.httpResponseStatus.style.color = '#e5e7eb';

  try {
    const reqData = { method, route, body: body ? JSON.parse(body) : undefined };
    const result = await api.simulateHttp(reqData, files);

    if (result.success && result.response) {
      elements.httpResponseStatus.textContent = `${result.response.status}`;

      // Set color based on status code
      if (result.response.status >= 200 && result.response.status < 300) {
        elements.httpResponseStatus.style.background = 'rgba(34, 197, 94, 0.2)';
        elements.httpResponseStatus.style.color = '#4ade80';
      } else if (result.response.status >= 400) {
        elements.httpResponseStatus.style.background = 'rgba(239, 68, 68, 0.2)';
        elements.httpResponseStatus.style.color = '#f87171';
      } else {
        elements.httpResponseStatus.style.background = 'rgba(234, 179, 8, 0.2)';
        elements.httpResponseStatus.style.color = '#facc15';
      }

      // Parse response data if it's object, otherwise show raw
      const resData =
        typeof result.response.data === 'object'
          ? JSON.stringify(result.response.data, null, 2)
          : result.response.data;

      elements.httpResponseBody.textContent = resData;
    } else {
      elements.httpResponseStatus.textContent = 'Error';
      elements.httpResponseStatus.style.background = 'rgba(239, 68, 68, 0.2)';
      elements.httpResponseStatus.style.color = '#f87171';
      const errMsg = result.error || 'Fallo de compilación o servidor.';
      elements.httpResponseBody.textContent = errMsg + '\n\nLogs:\n' + (result.logs || '');
    }
  } catch (error) {
    console.error('Simulation error:', error);
    elements.httpResponseStatus.textContent = 'Error';
    elements.httpResponseStatus.style.background = 'rgba(239, 68, 68, 0.2)';
    elements.httpResponseStatus.style.color = '#f87171';
    elements.httpResponseBody.textContent = error.message;
  } finally {
    elements.httpSendBtn.disabled = false;
    elements.httpSendBtn.textContent = 'Enviar';
  }
}

// ========== Terminal ==========

function loadProgress() {
  const saved = localStorage.getItem('nestjsProgress');
  return saved ? JSON.parse(saved) : {};
}

function saveProgress() {
  localStorage.setItem('nestjsProgress', JSON.stringify(state.progress));
}

function markExerciseCompleted(nivel, exerciseId) {
  const key = `${nivel}_${exerciseId}`;
  if (!state.progress[key]) {
    state.progress[key] = {
      completed: true,
      timestamp: new Date().toISOString(),
    };
    saveProgress();
  }
}

function isExerciseCompleted(nivel, exerciseId) {
  const key = `${nivel}_${exerciseId}`;
  return state.progress[key] && state.progress[key].completed;
}

function updateProgressDisplay() {
  if (!state.exercises || state.exercises.length === 0) return;

  const total = state.exercises.length;
  const completed = state.exercises.filter((ex) =>
    isExerciseCompleted(state.currentLevel, ex.id)
  ).length;

  elements.statCompleted.textContent = completed;
  elements.statTotal.textContent = total;

  const percentage = (completed / total) * 100;
  elements.progresoBar.style.width = `${percentage}%`;

  // Populate the progress list in the sidebar
  if (elements.progresoList) {
    elements.progresoList.innerHTML = '';
    state.exercises.forEach((ex) => {
      const isCompleted = isExerciseCompleted(state.currentLevel, ex.id);
      const item = document.createElement('div');
      item.className = `progreso-item ${isCompleted ? 'completed' : ''}`;
      item.innerHTML = `
                <span class="progreso-icon">${isCompleted ? '✓' : '○'}</span>
                <span class="progreso-title">${ex.id}. ${ex.title_es}</span>
            `;
      // Make them clickable to navigate!
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        loadExerciseDetail(ex.id);
      });
      elements.progresoList.appendChild(item);
    });
  }
}

// ========== Utilities ==========

function markdownToHTML(markdown) {
  if (typeof marked !== 'undefined') {
    let html = marked.parse(markdown);

    // Add IDs to headers to fix table of contents links
    html = html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (match, level, text) => {
      const rawText = text.replace(/<[^>]*>?/gm, '');
      const id = rawText
        .toLowerCase()
        .replace(/[\s\.,:]+/g, '-')
        .replace(/[^\w\-áéíóúüñ]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return `<h${level} id="${id}">${text}</h${level}>`;
    });

    setTimeout(() => {
      document
        .querySelectorAll('.nivel-readme pre code, .ejercicio-descripcion pre code')
        .forEach((block) => {
          if (
            typeof hljs !== 'undefined' &&
            !block.dataset.highlighted &&
            !block.classList.contains('language-mermaid')
          ) {
            hljs.highlightElement(block);
          }
        });

      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({ querySelector: '.language-mermaid' });
        } catch (e) {}
      }

      // Intercept anchor links for smooth scrolling within the container
      document.querySelectorAll('.nivel-readme a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }, 10);
    return html;
  }
  return `<p>Error: Markdown parser not loaded.</p>`;
}

// Re-render exercise list when view-exercises-btn is clicked
elements.viewExercisesBtn.addEventListener('click', () => {
  displayExerciseList();
});
