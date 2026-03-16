// Suggested Options for Dropdowns
const SUGGESTED_ROLES = [
    'Software Development Engineer (SDE)',
    'Senior Software Engineer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Cloud Engineer',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Data Engineer',
    'QA Engineer',
    'Security Engineer',
    'Mobile Developer (iOS)',
    'Mobile Developer (Android)',
    'System Administrator',
    'Database Administrator',
    'Product Manager (Technical)',
    'Solutions Architect',
    'Site Reliability Engineer (SRE)',
    'Platform Engineer'
];

const SUGGESTED_TOPICS = [
    'Data Structures & Algorithms',
    'Arrays & Strings',
    'Linked Lists',
    'Trees & Graphs',
    'Dynamic Programming',
    'Sorting & Searching',
    'Hash Tables',
    'Stacks & Queues',
    'Recursion',
    'Backtracking',
    'Greedy Algorithms',
    'Bit Manipulation',
    'System Design',
    'Object-Oriented Design',
    'Database Design',
    'API Design',
    'Microservices',
    'Scalability',
    'Load Balancing',
    'Caching Strategies',
    'Cloud Computing (AWS)',
    'Cloud Computing (Azure)',
    'Cloud Computing (GCP)',
    'Kubernetes',
    'Docker & Containers',
    'CI/CD',
    'Infrastructure as Code',
    'Machine Learning Fundamentals',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Feature Engineering',
    'Model Evaluation',
    'SQL & Database Queries',
    'NoSQL Databases',
    'Database Optimization',
    'Networking',
    'TCP/IP',
    'HTTP/HTTPS',
    'Security & Authentication',
    'OAuth & JWT',
    'Encryption',
    'Testing & Quality Assurance',
    'Unit Testing',
    'Integration Testing',
    'Behavioral Questions',
    'Problem Solving',
    'Code Review',
    'Debugging',
    'Performance Optimization'
];

// System Message for Claude API
const SYSTEM_MESSAGE = `You are a precise, conservative technical question writer and content assistant. Always produce accurate, non-plagiarized, and well-structured output. When asked to generate questions, follow the requested JSON schema exactly. Do not include any additional commentary, prose, or meta text outside the JSON object. If you are unsure about correctness of a generated solution or test case, mark that field with the string "REQUIRES_REVIEW" instead of fabricating an answer.`;

// Generate provenance tag
function getProvenanceTag() {
    return `claude-v1-draft-${new Date().toISOString().split('T')[0]}`;
}

// Generate user prompt for API
function generateUserPrompt(config) {
    const { roles, topics, numQuestions, language, difficultyDist, questionType } = config;
    const provenanceTag = getProvenanceTag();

    // Adjust prompt based on question type
    let typeInstructions = '';
    if (questionType === 'coding') {
        typeInstructions = 'Focus primarily on coding and algorithmic questions. Include data structure problems, algorithm implementation, and code optimization tasks.';
    } else if (questionType === 'theory') {
        typeInstructions = 'Focus on theoretical questions including system design, behavioral questions, MCQs, architectural concepts, and conceptual understanding. Minimize pure coding problems.';
    } else {
        typeInstructions = 'Generate a balanced mix of coding questions (algorithms, data structures, implementation) and theoretical questions (system design, MCQs, behavioral, conceptual).';
    }

    return `Generate ${numQuestions} questions for role(s) and topic(s) specified below. ${typeInstructions} For each question produce a JSON object with the exact fields described in the schema. Make sure questions are original (not copied verbatim from known platforms). Keep each statement ≤ 180 words for coding and ≤ 120 words for behavioral prompts. Provide progressive hints (3 levels). For coding problems, include at least 5 descriptive test_case_descriptions covering normal and edge cases, but do not produce executable test files. For system design or cloud scenario prompts, include expected trade-offs and checklist items for manual rubric review. For MCQ questions, include 4 options with one correct answer. If you cannot provide a reliable model_solution or test-case detail, set that field to "REQUIRES_REVIEW".

Parameters:
roles: ${JSON.stringify(roles)}
topics: ${topics.length > 0 ? JSON.stringify(topics) : '["General"]'}
difficulty_distribution: ${JSON.stringify(difficultyDist)}
N: ${numQuestions}
language: ["${language}", "pseudocode"]
output_format: "compact"
provenance_tag: "${provenanceTag}"
question_type: "${questionType}"

JSON schema (exact):
Return a JSON array of N objects. Each object must contain these fields exactly:

{
"id": "<uuid4 or unique draft id>",
"provenance": "<provenance_tag>",
"roles": ["<role1>", "<role2>", ...],
"primary_topic": "<primary topic>",
"subtopics": ["<sub1>", "<sub2>", ...],
"type": "<coding|system_design|cloud_scenario|ml_case_study|sql|behavioral|mcq>",
"difficulty": "<easy|medium|hard>",
"title": "<short title ≤ 10 words>",
"statement": "<problem statement>",
"constraints": "<constraints or assumptions (if any)>",
"hint_pool": ["<hint1>","<hint2>","<hint3>"],
"model_solution": "<concise solution or pseudocode or 'REQUIRES_REVIEW'>",
"explanation": "<short explanation of approach or 'REQUIRES_REVIEW'>",
"test_case_descriptions": ["<desc1>","<desc2>", "..."],
"mcq_options": [{"text":"<option text>","is_correct":true/false}] (only for MCQ type),
"rubric": [{"criterion":"<criterion name>","weight":<number between 0-100>}],
"estimated_time_mins": <integer>,
"tags": ["<tag1>", "<tag2>", ...],
"source_license": "generated_by_claude",
"review_required": true
}

Generation rules (must follow):
- Ensure difficulty distribution matches difficulty_distribution parameter as closely as possible.
- Keep coding statements language-agnostic unless language is requested; model_solution may use requested language or pseudocode.
- Hints must be ordered from least revealing to most revealing.
- Rubric must total weights summing to 100.
- estimated_time_mins should be realistic for the difficulty (easy 10–20, medium 20–45, hard 45–120).
- Tags must include role and topic names.
- For MCQ questions, include exactly 4 options with only one correct answer.
- Do not include company-specific confidential questions or verbatim copies from known proprietary sources.
- Do not output any fields beyond those in the schema.
- Output only valid JSON (no trailing commas, no comments).

Generate the questions now using the parameters above.`;
}