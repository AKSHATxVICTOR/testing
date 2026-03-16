// Main Application Logic

// State
let roleMultiSelect;
let topicMultiSelect;
let allQuestions = [];
let currentQuestionIndex = 0;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize multi-selects
    roleMultiSelect = new MultiSelect('role', SUGGESTED_ROLES);
    topicMultiSelect = new MultiSelect('topic', SUGGESTED_TOPICS);

    // Initialize difficulty validation
    updateDifficultyStatus();
    
    // Event listeners
    document.getElementById('diffEasy').addEventListener('input', updateDifficultyStatus);
    document.getElementById('diffMedium').addEventListener('input', updateDifficultyStatus);
    document.getElementById('diffHard').addEventListener('input', updateDifficultyStatus);
    
    document.getElementById('generateBtn').addEventListener('click', handleGenerate);
    document.getElementById('exportBtn').addEventListener('click', () => exportQuestions(allQuestions));
    document.getElementById('importFile').addEventListener('change', handleImport);
    
    document.getElementById('filterDifficulty').addEventListener('change', () => {
        renderQuestionList(
            allQuestions, 
            document.getElementById('filterDifficulty').value,
            document.getElementById('filterType').value
        );
    });
    
    document.getElementById('filterType').addEventListener('change', () => {
        renderQuestionList(
            allQuestions, 
            document.getElementById('filterDifficulty').value,
            document.getElementById('filterType').value
        );
    });

    // Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (!tab.disabled) {
                switchPage(tab.dataset.page);
            }
        });
    });

    // Preview navigation
    document.getElementById('backToListBtn').addEventListener('click', () => {
        switchPage('questions');
    });

    document.getElementById('prevQuestionBtn').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestionAtIndex(currentQuestionIndex);
        }
    });

    document.getElementById('nextQuestionBtn').addEventListener('click', () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestionAtIndex(currentQuestionIndex);
        }
    });
});

// Generate Questions
async function handleGenerate() {
    const roles = roleMultiSelect.getSelected();
    
    if (roles.length === 0) {
        showError('Please select at least one role');
        return;
    }

    if (!updateDifficultyStatus()) {
        showError('Difficulty distribution must sum to 100%');
        return;
    }

    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    btn.disabled = true;
    btnText.textContent = 'Generating...';
    btnSpinner.style.display = 'inline-block';
    hideError();

    const config = {
        roles: roles,
        topics: topicMultiSelect.getSelected(),
        numQuestions: parseInt(document.getElementById('numQuestions').value),
        language: document.getElementById('language').value,
        questionType: document.getElementById('questionType').value,
        difficultyDist: {
            easy: parseInt(document.getElementById('diffEasy').value),
            medium: parseInt(document.getElementById('diffMedium').value),
            hard: parseInt(document.getElementById('diffHard').value)
        }
    };

    try {
        const questions = await generateQuestions(config);
        allQuestions = questions;
        
        // Enable navigation tabs
        document.getElementById('questionsTab').disabled = false;
        document.getElementById('previewTab').disabled = false;
        
        // Update badge
        document.getElementById('questionsBadge').textContent = questions.length;
        
        // Switch to questions page
        switchPage('questions');
        
        // Render questions
        renderQuestionList(allQuestions);
        
    } catch (err) {
        showError(err.message);
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Generate Questions';
        btnSpinner.style.display = 'none';
    }
}

// API Call to Generate Questions
async function generateQuestions(config) {
    const userPrompt = generateUserPrompt(config);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16000,
            temperature: 0.2,
            system: SYSTEM_MESSAGE,
            messages: [
                { role: 'user', content: userPrompt }
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse JSON from response
    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const parsedQuestions = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return parsedQuestions;
    } catch (parseError) {
        throw new Error('Failed to parse questions from response. Response may not be valid JSON.');
    }
}

// Import Questions Handler
function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    importQuestions(file, (err, questions) => {
        if (err) {
            showError('Failed to parse imported file: ' + err.message);
            return;
        }

        allQuestions = questions;
        
        // Enable navigation tabs
        document.getElementById('questionsTab').disabled = false;
        document.getElementById('previewTab').disabled = false;
        
        // Update badge
        document.getElementById('questionsBadge').textContent = questions.length;
        
        // Switch to questions page
        switchPage('questions');
        
        // Render questions
        renderQuestionList(allQuestions);
    });

    // Reset file input
    event.target.value = '';
}

// Show Question at Index
function showQuestionAtIndex(index) {
    currentQuestionIndex = index;
    const question = allQuestions[index];
    renderQuestionDetail(question);
    updatePreviewNavigation(index, allQuestions);
}

// Override showQuestionPreview from ui.js to update currentQuestionIndex
window.showQuestionPreview = function(question, allQuestions) {
    currentQuestionIndex = allQuestions.indexOf(question);
    renderQuestionDetail(question);
    updatePreviewNavigation(currentQuestionIndex, allQuestions);
    switchPage('preview');
};