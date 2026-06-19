/**
 * Main Application Logic
 * NestJS Educational Platform
 */

// Application State
const state = {
    currentLevel: null,
    currentExercise: null,
    exercises: [],
    progress: loadProgress(),
    initialScript: ''
};

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
    statCompleted: document.getElementById('stat-completed'),
    statTotal: document.getElementById('stat-total'),
    progresoBar: document.getElementById('progreso-bar'),

    // Status
    statusIndicator: document.getElementById('status-indicator')
};

// ========== Initialization ==========

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    attachEventListeners();
    checkServerStatus();
});

function initializeApp() {
    // Show welcome screen initially
    showSection('welcome');

    // Check server status periodically
    setInterval(checkServerStatus, 30000); // Every 30 seconds
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
    // Level selection from cards
    document.querySelectorAll('.level-card:not(.disabled)').forEach(card => {
        card.addEventListener('click', () => {
            const nivel = parseInt(card.dataset.level);
            handleLevelChange(nivel);
        });
    });

    // Navigation
    if (elements.navHomeBtn) elements.navHomeBtn.addEventListener('click', () => showSection('welcome'));
    if (elements.logoBtn) elements.logoBtn.addEventListener('click', () => showSection('welcome'));
    
    elements.backToWelcome.addEventListener('click', () => showSection('welcome'));
    elements.viewExercisesBtn.addEventListener('click', () => showSection('ejercicios-lista'));
    elements.backToInfo.addEventListener('click', () => showSection('nivel-info'));
    elements.backToList.addEventListener('click', () => showSection('ejercicios-lista'));

    // Exercise actions
    elements.toggleHintsBtn.addEventListener('click', handleToggleHints);
    elements.showSolutionBtn.addEventListener('click', handleShowSolution);
    elements.resetCodeBtn.addEventListener('click', handleResetCode);
    elements.validarBtn.addEventListener('click', handleValidation);
    elements.closeResultBtn.addEventListener('click', () => {
        elements.resultadoPanel.classList.add('hidden');
    });
}

// ========== Section Management ==========

function showSection(section) {
    // Hide all sections
    elements.welcomeSection.classList.add('hidden');
    elements.nivelInfoSection.classList.add('hidden');
    elements.ejerciciosListaSection.classList.add('hidden');
    elements.ejercicioDetalleSection.classList.add('hidden');
    elements.progresoSidebar.classList.add('hidden');

    // Show requested section
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
            updateProgressDisplay();
            break;
        case 'ejercicio-detalle':
            elements.ejercicioDetalleSection.classList.remove('hidden');
            elements.progresoSidebar.classList.remove('hidden');
            break;
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// ========== Level Handling ==========

async function handleLevelChange(nivel) {
    if (!nivel) {
        showSection('welcome');
        return;
    }

    state.currentLevel = nivel;

    try {
        // Load level info
        const levelInfo = await api.getLevelInfo(nivel);
        displayLevelInfo(nivel, levelInfo);

        // Load exercises
        const exercises = await api.getExercises(nivel);
        state.exercises = exercises;

        showSection('nivel-info');

    } catch (error) {
        console.error('Error loading level:', error);
        alert('Error al cargar el nivel. Por favor, intenta de nuevo.');
    }
}

function displayLevelInfo(nivel, levelInfo) {
    const nivelNames = {
        1: 'Nivel 1: TypeScript Intro'
    };

    elements.nivelTitle.textContent = nivelNames[nivel];
    elements.nivelReadme.innerHTML = markdownToHTML(levelInfo.readme);
}

// ========== Exercise List ==========

function displayExerciseList() {
    const nivelNames = {
        1: 'Nivel 1: TypeScript Intro'
    };

    elements.ejerciciosTitle.textContent = `${nivelNames[state.currentLevel]} - Ejercicios`;
    elements.ejerciciosGrid.innerHTML = '';

    state.exercises.forEach(exercise => {
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
      <span class="badge difficulty-${exercise.difficulty}">
        ${getDifficultyLabel(exercise.difficulty)}
      </span>
    </div>
    <div class="ejercicio-card-concepts">
      ${exercise.concepts.map(c => `<span class="concept-tag">${c}</span>`).join('')}
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
        7: 'Muy Difícil'
    };
    return labels[difficulty] || 'Medio';
}

// ========== Exercise Detail ==========

async function loadExerciseDetail(exerciseId) {
    try {
        const exercise = await api.getExerciseDetail(state.currentLevel, exerciseId);
        state.currentExercise = exercise;
        state.initialScript = exercise.initial_script || '';

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
    elements.ejercicioDificultad.className = `badge difficulty-${exercise.difficulty}`;

    elements.ejercicioConcepts.innerHTML = exercise.concepts
        .map(c => `<span class="concept-tag">${c}</span>`)
        .join('');

    elements.ejercicioDescripcion.innerHTML = markdownToHTML(exercise.description_es);

    // Prepare hints (hidden by default)
    const hints = exercise.hints_es || [];
    if (hints.length > 0) {
        elements.hintsList.innerHTML = hints.map(hint => `<li>${hint}</li>`).join('');
    } else {
        elements.hintsList.innerHTML = '<li>No hay pistas disponibles para este ejercicio</li>';
    }
    // Reset hints to hidden
    elements.hintsList.classList.add('hidden');
    elements.hintsBtnText.textContent = 'Mostrar Pistas';

    // Set initial code
    if (window.codeEditor) {
        window.codeEditor.setValue(state.initialScript);
    } else {
        elements.codeEditor.value = state.initialScript;
    }

    // Hide results
    elements.resultadoPanel.classList.add('hidden');
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
    if (!state.currentExercise || !state.currentExercise.solution_script) {
        alert('No hay solución disponible para este ejercicio.');
        return;
    }

    const confirmMsg = 'Esto reemplazará tu código actual con la solución de referencia. ¿Continuar?';
    if (confirm(confirmMsg)) {
        if (window.codeEditor) {
            window.codeEditor.setValue(state.currentExercise.solution_script);
        } else {
            elements.codeEditor.value = state.currentExercise.solution_script;
        }
    }
}

function handleResetCode() {
    if (confirm('¿Estás seguro de que quieres reiniciar el código al estado inicial?')) {
        if (window.codeEditor) {
            window.codeEditor.setValue(state.initialScript);
        } else {
            elements.codeEditor.value = state.initialScript;
        }
    }
}

// ========== Validation ==========

async function handleValidation() {
    if (!state.currentExercise) return;

    const script = window.codeEditor ? window.codeEditor.getValue() : elements.codeEditor.value;

    if (!script.trim()) {
        alert('Por favor, escribe tu solución antes de validar.');
        return;
    }

    // Show loading
    elements.validarBtn.disabled = true;
    elements.loadingIndicator.classList.remove('hidden');
    elements.resultadoPanel.classList.add('hidden');

    try {
        const result = await api.validateExercise(
            state.currentLevel,
            state.currentExercise.id,
            script
        );

        displayValidationResult(result);

        // Update progress if correct
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

    // Status
    elements.resultadoStatus.textContent = result.correcto ? '¡Correcto!' : 'Incorrecto';
    elements.resultadoStatus.className = result.correcto ? 'resultado-status success' : 'resultado-status error';

    // Output
    if (result.output) {
        elements.resultadoOutput.textContent = result.output;
        elements.resultadoOutputSection.classList.remove('hidden');
    } else {
        elements.resultadoOutputSection.classList.add('hidden');
    }

    // Errors
    if (result.errores && result.errores.trim()) {
        elements.resultadoErrores.textContent = result.errores;
        elements.resultadoErroresSection.classList.remove('hidden');
    } else {
        elements.resultadoErroresSection.classList.add('hidden');
    }

    // Suggestions
    if (result.sugerencias && result.sugerencias.length > 0) {
        elements.resultadoSugerencias.innerHTML = result.sugerencias
            .map(s => `<li>${s}</li>`)
            .join('');
        elements.resultadoSugerenciasSection.classList.remove('hidden');
    } else {
        elements.resultadoSugerenciasSection.classList.add('hidden');
    }

    // Scroll to results
    elements.resultadoPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayValidationError(errorMessage) {
    elements.resultadoPanel.classList.remove('hidden');
    elements.resultadoStatus.textContent = 'Error';
    elements.resultadoStatus.className = 'resultado-status error';

    elements.resultadoErrores.textContent = errorMessage;
    elements.resultadoErroresSection.classList.remove('hidden');

    elements.resultadoOutputSection.classList.add('hidden');
    elements.resultadoSugerenciasSection.classList.add('hidden');
}

// ========== Progress Tracking ==========

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
            timestamp: new Date().toISOString()
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
    const completed = state.exercises.filter(ex =>
        isExerciseCompleted(state.currentLevel, ex.id)
    ).length;

    elements.statCompleted.textContent = completed;
    elements.statTotal.textContent = total;

    const percentage = (completed / total) * 100;
    elements.progresoBar.style.width = `${percentage}%`;
}

// ========== Utilities ==========

function markdownToHTML(markdown) {
    if (typeof marked !== 'undefined') {
        let html = marked.parse(markdown);
        
        // Add IDs to headers to fix table of contents links
        html = html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (match, level, text) => {
            const rawText = text.replace(/<[^>]*>?/gm, '');
            const id = rawText.toLowerCase()
                .replace(/[\s\.,:]+/g, '-')
                .replace(/[^\w\-áéíóúüñ]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            return `<h${level} id="${id}">${text}</h${level}>`;
        });

        setTimeout(() => {
            document.querySelectorAll('.nivel-readme pre code').forEach((block) => {
                if (typeof hljs !== 'undefined') {
                    hljs.highlightElement(block);
                }
            });
            
            // Intercept anchor links for smooth scrolling within the container
            document.querySelectorAll('.nivel-readme a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
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
