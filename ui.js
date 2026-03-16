// UI Helper Functions

// Multi-select dropdown functionality
class MultiSelect {
    constructor(type, suggestions) {
        this.type = type;
        this.suggestions = suggestions;
        this.selected = type === 'role' ? ['Software Development Engineer (SDE)'] : [];
        this.input = document.getElementById(`${type}Input`);
        this.optionsDiv = document.getElementById(`${type}Options`);
        this.chipsDiv = document.getElementById(`selected${this.capitalize(type)}s`);
        
        this.init();
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    init() {
        this.renderChips();
        
        // Focus event - show dropdown
        this.input.addEventListener('focus', () => {
            this.showDropdown();
        });

        // Input event - filter options
        this.input.addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.multi-select-container')) {
                this.hideDropdown();
            }
        });

        // Enter key to add custom value
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.input.value.trim()) {
                e.preventDefault();
                this.addCustom(this.input.value.trim());
                this.input.value = '';
                this.filterOptions('');
            }
        });
    }

    showDropdown() {
        this.optionsDiv.classList.add('active');
        this.filterOptions(this.input.value);
    }

    hideDropdown() {
        this.optionsDiv.classList.remove('active');
        this.input.value = '';
    }

    filterOptions(query) {
        const filtered = query 
            ? this.suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
            : this.suggestions;
        this.renderOptions(filtered);
    }

    renderOptions(options) {
        this.optionsDiv.innerHTML = options.map(option => {
            const isSelected = this.selected.includes(option);
            return `
                <div class="dropdown-option ${isSelected ? 'selected' : ''}" 
                     data-value="${this.escapeHtml(option)}">
                    ${this.escapeHtml(option)}
                </div>
            `;
        }).join('');

        // Add click listeners
        this.optionsDiv.querySelectorAll('.dropdown-option').forEach(opt => {
            opt.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent input blur
                this.toggleOption(opt.dataset.value);
            });
        });
    }

    renderChips() {
        this.chipsDiv.innerHTML = this.selected.map(item => `
            <div class="chip">
                ${this.escapeHtml(item)}
                <span class="chip-remove" data-value="${this.escapeHtml(item)}">×</span>
            </div>
        `).join('');

        // Add remove listeners
        this.chipsDiv.querySelectorAll('.chip-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeItem(btn.dataset.value);
            });
        });
    }

    toggleOption(value) {
        const index = this.selected.indexOf(value);
        if (index > -1) {
            this.selected.splice(index, 1);
        } else {
            this.selected.push(value);
        }
        this.renderChips();
        this.filterOptions(this.input.value);
    }

    addCustom(value) {
        if (!this.selected.includes(value)) {
            this.selected.push(value);
            this.renderChips();
        }
    }

    removeItem(value) {
        const index = this.selected.indexOf(value);
        if (index > -1) {
            this.selected.splice(index, 1);
            this.renderChips();
            this.filterOptions(this.input.value);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getSelected() {
        return this.selected;
    }
}

// Page Navigation
function switchPage(pageName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page-${pageName}`).classList.add('active');
}

// Difficulty Status Validation
function updateDifficultyStatus() {
    const easy = parseInt(document.getElementById('diffEasy').value) || 0;
    const medium = parseInt(document.getElementById('diffMedium').value) || 0;
    const hard = parseInt(document.getElementById('diffHard').value) || 0;
    const total = easy + medium + hard;
    
    const statusDiv = document.getElementById('difficultyStatus');
    
    if (total === 100) {
        statusDiv.className = 'difficulty-status valid';
        statusDiv.innerHTML = '✓ Valid (100%)';
        return true;
    } else {
        statusDiv.className = 'difficulty-status invalid';
        statusDiv.innerHTML = `✗ Invalid (Total: ${total}%)`;
        return false;
    }
}

// Error Handling
function showError(message) {
    const alertDiv = document.getElementById('errorAlert');
    alertDiv.className = 'alert alert-error';
    alertDiv.innerHTML = `
        <span style="font-size: 1.25rem;">⚠️</span>
        <div>
            <strong>Error</strong>
            <div style="font-size: 0.9rem; margin-top: 0.25rem;">${message}</div>
        </div>
    `;
    alertDiv.style.display = 'flex';
}

function hideError() {
    document.getElementById('errorAlert').style.display = 'none';
}

// Render Question List
function renderQuestionList(questions, filterDifficulty = 'all', filterType = 'all') {
    const filtered = questions.filter(q => {
        const diffMatch = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
        const typeMatch = filterType === 'all' || q.type === filterType;
        return diffMatch && typeMatch;
    });

    document.getElementById('questionCount').textContent = filtered.length;
    document.getElementById('questionsBadge').textContent = questions.length;

    const listDiv = document.getElementById('questionList');
    
    if (filtered.length === 0) {
        listDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">No questions found</div>
                <div class="empty-state-description">Try adjusting your filters</div>
            </div>
        `;
        return;
    }

    listDiv.innerHTML = filtered.map(q => `
        <div class="question-card" data-id="${q.id}">
            <div class="question-header">
                <div class="question-title">${escapeHtml(q.title)}</div>
                <span class="badge badge-difficulty-${q.difficulty}">${q.difficulty}</span>
            </div>
            <div class="question-meta">
                <span class="badge badge-type">${q.type.replace(/_/g, ' ')}</span>
                <span class="badge badge-time">⏱ ${q.estimated_time_mins} min</span>
            </div>
            <div class="question-roles">
                ${q.roles.slice(0, 2).map(role => `
                    <span class="role-tag">${escapeHtml(role)}</span>
                `).join('')}
                ${q.roles.length > 2 ? `<span class="role-tag">+${q.roles.length - 2} more</span>` : ''}
            </div>
        </div>
    `).join('');

    // Add click listeners
    listDiv.querySelectorAll('.question-card').forEach(card => {
        card.addEventListener('click', () => {
            const question = questions.find(q => q.id === card.dataset.id);
            showQuestionPreview(question, questions);
        });
    });
}

// Show Question Preview
function showQuestionPreview(question, allQuestions) {
    const currentIndex = allQuestions.indexOf(question);
    renderQuestionDetail(question);
    updatePreviewNavigation(currentIndex, allQuestions);
    switchPage('preview');
}

// Render Question Detail
function renderQuestionDetail(question) {
    const detailDiv = document.getElementById('questionDetail');
    
    if (!question) {
        detailDiv.className = 'question-detail empty';
        detailDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-title">No question selected</div>
                <div class="empty-state-description">Select a question from the list</div>
            </div>
        `;
        return;
    }

    detailDiv.className = 'question-detail';

    let html = `
        <div class="detail-section">
            <h3>${escapeHtml(question.title)}</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;">
                <span class="badge badge-difficulty-${question.difficulty}">${question.difficulty}</span>
                <span class="badge badge-type">${question.type.replace(/_/g, ' ')}</span>
                <span class="badge badge-time">⏱ ${question.estimated_time_mins} min</span>
            </div>
        </div>

        <div class="detail-section">
            <h3>Problem Statement</h3>
            <div class="detail-content">${escapeHtml(question.statement)}</div>
        </div>
    `;

    if (question.constraints) {
        html += `
            <div class="detail-section">
                <h3>Constraints</h3>
                <div class="detail-content">${escapeHtml(question.constraints)}</div>
            </div>
        `;
    }

    // MCQ Options
    if (question.type === 'mcq' && question.mcq_options) {
        html += `
            <div class="detail-section">
                <h3>Options</h3>
                <div style="display: grid; gap: 0.5rem;">
                    ${question.mcq_options.map((opt, i) => `
                        <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; ${opt.is_correct ? 'border: 2px solid var(--success); background: rgba(16, 185, 129, 0.1);' : 'border: 2px solid var(--border);'}">
                            <strong>${String.fromCharCode(65 + i)}.</strong> ${escapeHtml(opt.text)}
                            ${opt.is_correct ? '<span style="color: var(--success); font-weight: bold; margin-left: 0.5rem;">✓ Correct</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    html += `
        <div class="detail-section">
            <h3>Hints</h3>
            <div class="hints-list">
                ${question.hint_pool.map((hint, i) => `
                    <div class="hint-item">
                        <div class="hint-label">Hint ${i + 1}</div>
                        <div class="hint-text">${escapeHtml(hint)}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detail-section">
            <h3>Model Solution</h3>
            <div class="code-editor-container">
                <textarea id="codeEditorTextarea">${escapeHtml(question.model_solution)}</textarea>
            </div>
        </div>

        <div class="detail-section">
            <h3>Explanation</h3>
            <div class="detail-content">${escapeHtml(question.explanation)}</div>
        </div>

        <div class="detail-section">
            <h3>Test Cases</h3>
            <div class="test-cases-list">
                ${question.test_case_descriptions.map(tc => `
                    <div class="test-case-item">
                        <span class="test-case-bullet">•</span>
                        <span>${escapeHtml(tc)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detail-section">
            <h3>Grading Rubric</h3>
            <div class="rubric-list">
                ${question.rubric.map(r => `
                    <div class="rubric-item">
                        <span class="rubric-criterion">${escapeHtml(r.criterion)}</span>
                        <span class="rubric-weight">${r.weight}%</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detail-section">
            <h3>Tags</h3>
            <div class="tags-container">
                ${question.tags.map(tag => `
                    <span class="tag">${escapeHtml(tag)}</span>
                `).join('')}
            </div>
        </div>

        <div class="detail-section">
            <div class="metadata">
                <p><strong>ID:</strong> ${escapeHtml(question.id)}</p>
                <p><strong>Provenance:</strong> ${escapeHtml(question.provenance)}</p>
                <p><strong>Review Required:</strong> ${question.review_required ? 'Yes' : 'No'}</p>
            </div>
        </div>
    `;

    detailDiv.innerHTML = html;

    // Initialize CodeMirror
    initializeCodeEditor();
}

// Initialize Code Editor
let codeEditor = null;

function initializeCodeEditor() {
    setTimeout(() => {
        const textarea = document.getElementById('codeEditorTextarea');
        if (!textarea) return;

        const language = document.getElementById('language').value;
        let mode = 'python';
        if (language === 'javascript') mode = 'javascript';
        else if (language === 'java' || language === 'cpp' || language === 'csharp') mode = 'text/x-java';
        else if (language === 'sql') mode = 'sql';

        if (codeEditor) {
            codeEditor.toTextArea();
        }

        codeEditor = CodeMirror.fromTextArea(textarea, {
            mode: mode,
            theme: 'monokai',
            lineNumbers: true,
            readOnly: true,
            lineWrapping: true
        });
    }, 100);
}

// Update Preview Navigation
function updatePreviewNavigation(currentIndex, allQuestions) {
    document.getElementById('previewCounter').textContent = 
        `${currentIndex + 1} / ${allQuestions.length}`;
    
    document.getElementById('prevQuestionBtn').disabled = currentIndex === 0;
    document.getElementById('nextQuestionBtn').disabled = currentIndex === allQuestions.length - 1;
}

// Escape HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export Questions
function exportQuestions(questions) {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import Questions
function importQuestions(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            const questions = Array.isArray(imported) ? imported : [imported];
            callback(null, questions);
        } catch (err) {
            callback(err);
        }
    };
    reader.readAsText(file);
}