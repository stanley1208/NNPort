/**
 * NNPort - Neural Network Porting Tool
 * Main Application JavaScript
 */

// ============================================
// State Management
// ============================================

const state = {
    exploratoryMode: false,
    sourceModel: null,
    referenceCode: null,
    targetCode: null,
    targetHardware: '',
    useAdb: false,
    quantize: false,
    profile: false,
    isPorting: false,
    currentStage: 0
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    exploratoryToggle: document.getElementById('exploratory-toggle'),
    standardFields: document.getElementById('standard-fields'),
    exploratoryFields: document.getElementById('exploratory-fields'),
    sourceModel: document.getElementById('source-model'),
    sourceModelName: document.getElementById('source-model-name'),
    sourceModelUpload: document.getElementById('source-model-upload'),
    referenceCode: document.getElementById('reference-code'),
    referenceCodeName: document.getElementById('reference-code-name'),
    referenceCodeUpload: document.getElementById('reference-code-upload'),
    targetCode: document.getElementById('target-code'),
    targetCodeName: document.getElementById('target-code-name'),
    targetCodeUpload: document.getElementById('target-code-upload'),
    targetHardware: document.getElementById('target-hardware'),
    useAdb: document.getElementById('use-adb'),
    quantize: document.getElementById('quantize'),
    profile: document.getElementById('profile'),
    adbOptions: document.getElementById('adb-options'),
    adbDevice: document.getElementById('adb-device'),
    startPorting: document.getElementById('start-porting'),
    emptyState: document.getElementById('empty-state'),
    portingProgress: document.getElementById('porting-progress'),
    portingResults: document.getElementById('porting-results'),
    progressBar: document.getElementById('progress-bar'),
    progressStatus: document.getElementById('progress-status'),
    logContent: document.getElementById('log-content')
};

// ============================================
// Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeAnimations();
    // Set initial hardware selection
    state.targetHardware = elements.targetHardware.value;
});

function initializeEventListeners() {
    // File upload handlers
    elements.sourceModel.addEventListener('change', handleSourceModelUpload);
    elements.referenceCode.addEventListener('change', handleReferenceCodeUpload);
    elements.targetCode.addEventListener('change', handleTargetCodeUpload);
    
    // Drag and drop for file uploads
    setupDragAndDrop(elements.sourceModelUpload, elements.sourceModel, handleSourceModelUpload);
    setupDragAndDrop(elements.referenceCodeUpload, elements.referenceCode, handleReferenceCodeUpload);
    setupDragAndDrop(elements.targetCodeUpload, elements.targetCode, handleTargetCodeUpload);
    
    // Hardware selection
    elements.targetHardware.addEventListener('change', (e) => {
        state.targetHardware = e.target.value;
        updateHardwareColor();
        validateForm();
    });
    
    // Set initial color
    updateHardwareColor();
    
    // Checkbox handlers
    elements.useAdb.addEventListener('change', (e) => {
        state.useAdb = e.target.checked;
        elements.adbOptions.style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked) {
            refreshDevices();
        }
    });
    
    elements.quantize.addEventListener('change', (e) => {
        state.quantize = e.target.checked;
    });
    
    elements.profile.addEventListener('change', (e) => {
        state.profile = e.target.checked;
    });
}

function setupDragAndDrop(dropZone, fileInput, handler) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });
    
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            // Create a synthetic event object
            const syntheticEvent = { target: { files: files } };
            handler(syntheticEvent);
        }
    }, false);
}

function initializeAnimations() {
    // Stagger animation for form groups
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            group.style.transition = 'all 0.4s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateX(0)';
        }, 100 + index * 80);
    });
}

// ============================================
// Mode Toggle
// ============================================

function toggleExploratoryMode() {
    state.exploratoryMode = elements.exploratoryToggle.checked;
    
    if (state.exploratoryMode) {
        elements.standardFields.classList.add('hidden');
        elements.exploratoryFields.classList.remove('hidden');
    } else {
        elements.standardFields.classList.remove('hidden');
        elements.exploratoryFields.classList.add('hidden');
    }
    
    // Reset state and validate
    resetFileInputs();
    validateForm();
}

// ============================================
// File Upload Handlers
// ============================================

function handleSourceModelUpload(e) {
    const file = e.target.files[0];
    if (file) {
        state.sourceModel = file;
        const fileSize = formatFileSize(file.size);
        elements.sourceModelName.textContent = `${file.name} (${fileSize})`;
        elements.sourceModelName.classList.add('active');
        elements.sourceModelUpload.classList.add('has-file');
        
        // Show a toast notification
        showToast(`Loaded: ${file.name}`, 'success');
    }
    validateForm();
}

function handleReferenceCodeUpload(e) {
    const file = e.target.files[0];
    if (file) {
        state.referenceCode = file;
        const fileSize = formatFileSize(file.size);
        elements.referenceCodeName.textContent = `${file.name} (${fileSize})`;
        elements.referenceCodeName.classList.add('active');
        elements.referenceCodeUpload.classList.add('has-file');
        showToast(`Loaded: ${file.name}`, 'success');
    }
    validateForm();
}

function handleTargetCodeUpload(e) {
    const file = e.target.files[0];
    if (file) {
        state.targetCode = file;
        const fileSize = formatFileSize(file.size);
        elements.targetCodeName.textContent = `${file.name} (${fileSize})`;
        elements.targetCodeName.classList.add('active');
        elements.targetCodeUpload.classList.add('has-file');
        showToast(`Loaded: ${file.name}`, 'success');
    }
    validateForm();
}

function resetFileInputs() {
    state.sourceModel = null;
    state.referenceCode = null;
    state.targetCode = null;
    
    elements.sourceModelName.textContent = 'No File Chosen';
    elements.sourceModelName.classList.remove('active');
    elements.sourceModelUpload.classList.remove('has-file');
    
    elements.referenceCodeName.textContent = 'No File Chosen';
    elements.referenceCodeName.classList.remove('active');
    elements.referenceCodeUpload.classList.remove('has-file');
    
    elements.targetCodeName.textContent = 'No File Chosen';
    elements.targetCodeName.classList.remove('active');
    elements.targetCodeUpload.classList.remove('has-file');
    
    elements.sourceModel.value = '';
    elements.referenceCode.value = '';
    elements.targetCode.value = '';
}

// ============================================
// Form Validation
// ============================================

function validateForm() {
    let isValid = false;
    
    // Always have a valid hardware selection now (no empty option)
    state.targetHardware = elements.targetHardware.value;
    
    if (state.exploratoryMode) {
        isValid = state.referenceCode && state.targetCode;
    } else {
        isValid = state.sourceModel !== null;
    }
    
    elements.startPorting.disabled = !isValid;
    return isValid;
}

// ============================================
// ADB Device Management
// ============================================

function refreshDevices() {
    elements.adbDevice.innerHTML = '<option value="">Scanning devices...</option>';
    
    // Simulate device scanning
    setTimeout(() => {
        const mockDevices = [
            { id: 'emulator-5554', name: 'Android Emulator' },
            { id: 'RF8M33XXXXX', name: 'Samsung Galaxy S21' },
            { id: 'XXXXXXX', name: 'Pixel 6 Pro' }
        ];
        
        elements.adbDevice.innerHTML = '<option value="">Select device</option>';
        mockDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = `${device.name} (${device.id})`;
            elements.adbDevice.appendChild(option);
        });
    }, 1500);
}

// ============================================
// Porting Process
// ============================================

function startPorting() {
    if (!validateForm() || state.isPorting) return;
    
    state.isPorting = true;
    state.currentStage = 0;
    
    // Update UI
    elements.emptyState.classList.add('hidden');
    elements.portingResults.classList.add('hidden');
    elements.portingProgress.classList.remove('hidden');
    elements.startPorting.disabled = true;
    elements.startPorting.innerHTML = `
        <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"/>
        </svg>
        Porting...
    `;
    
    // Clear log
    elements.logContent.innerHTML = '';
    addLogEntry('Initializing porting session...');
    
    // Start the porting simulation
    simulatePortingProcess();
}

function simulatePortingProcess() {
    const stages = [
        { name: 'Model Analysis', duration: 2000, logs: [
            'Loading model file...',
            'Parsing model architecture...',
            'Detected 152 layers, 25.6M parameters',
            'Input shape: [1, 3, 224, 224]',
            'Output shape: [1, 1000]'
        ]},
        { name: 'Graph Optimization', duration: 2500, logs: [
            'Applying graph optimizations...',
            'Fusing BatchNorm with Conv layers...',
            'Fused 53 BatchNorm operations',
            'Eliminating dead code...',
            'Optimized graph: 98 nodes'
        ]},
        { name: 'Code Generation', duration: 3000, logs: [
            `Generating ${state.targetHardware} kernels...`,
            'Optimizing memory layout for target...',
            'Generating weight serialization...',
            'Creating inference runner...',
            'Code generation complete'
        ]},
        { name: 'Compilation', duration: 2000, logs: [
            'Compiling generated code...',
            'Linking runtime libraries...',
            'Applying target-specific optimizations...',
            'Build successful'
        ]},
        { name: 'Deployment', duration: 1500, logs: [
            state.useAdb ? 'Connecting to device via ADB...' : 'Preparing deployment package...',
            state.useAdb ? 'Pushing binaries to device...' : 'Packaging output files...',
            state.profile ? 'Running performance benchmark...' : 'Validating output...',
            'Deployment complete!'
        ]}
    ];
    
    let totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
    let elapsed = 0;
    
    function processStage(stageIndex) {
        if (stageIndex >= stages.length) {
            finishPorting();
            return;
        }
        
        const stage = stages[stageIndex];
        state.currentStage = stageIndex + 1;
        
        // Update stage indicators
        updateStageIndicators(stageIndex);
        elements.progressStatus.textContent = stage.name + '...';
        
        // Add logs progressively
        const logInterval = stage.duration / stage.logs.length;
        stage.logs.forEach((log, i) => {
            setTimeout(() => {
                addLogEntry(log, i === stage.logs.length - 1 ? 'success' : '');
            }, logInterval * i);
        });
        
        // Update progress bar
        const progressInterval = 50;
        const progressSteps = stage.duration / progressInterval;
        const progressIncrement = (100 / stages.length) / progressSteps;
        
        let stepCount = 0;
        const progressTimer = setInterval(() => {
            stepCount++;
            elapsed += progressInterval;
            const progress = (elapsed / totalDuration) * 100;
            elements.progressBar.style.width = Math.min(progress, 100) + '%';
            
            if (stepCount >= progressSteps) {
                clearInterval(progressTimer);
                setTimeout(() => processStage(stageIndex + 1), 200);
            }
        }, progressInterval);
    }
    
    processStage(0);
}

function updateStageIndicators(currentIndex) {
    for (let i = 1; i <= 5; i++) {
        const stage = document.getElementById(`stage-${i}`);
        stage.classList.remove('active', 'completed');
        
        if (i < currentIndex + 1) {
            stage.classList.add('completed');
        } else if (i === currentIndex + 1) {
            stage.classList.add('active');
        }
    }
}

function addLogEntry(message, type = '') {
    const time = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
    elements.logContent.appendChild(line);
    elements.logContent.scrollTop = elements.logContent.scrollHeight;
}

function finishPorting() {
    state.isPorting = false;
    
    // Update all stages to completed
    for (let i = 1; i <= 5; i++) {
        const stage = document.getElementById(`stage-${i}`);
        stage.classList.remove('active');
        stage.classList.add('completed');
    }
    
    elements.progressBar.style.width = '100%';
    elements.progressStatus.textContent = 'Completed!';
    addLogEntry('Porting completed successfully!', 'success');
    
    // Show results after a brief delay
    setTimeout(() => {
        elements.portingProgress.classList.add('hidden');
        elements.portingResults.classList.remove('hidden');
        
        // Update result card with actual data
        const modelName = state.sourceModel ? state.sourceModel.name.replace(/\.[^/.]+$/, '') : 'model';
        document.getElementById('result-model-name').textContent = modelName + '_' + state.targetHardware;
        document.getElementById('result-timestamp').textContent = 'Ported on ' + new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Reset button
        elements.startPorting.disabled = false;
        elements.startPorting.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Start Porting Loop
        `;
    }, 1000);
}

function clearLog() {
    elements.logContent.innerHTML = '';
}

// ============================================
// Output Actions
// ============================================

function downloadOutput() {
    // Simulate download
    const modelName = document.getElementById('result-model-name').textContent;
    alert(`Downloading ${modelName}.zip\n\nThis would download the generated files in a production environment.`);
}

function deployToDevice() {
    if (!state.useAdb) {
        alert('Please enable ADB and select a device to deploy directly.');
        return;
    }
    alert('Deploying to device...\n\nThis would push the compiled model to the selected device in a production environment.');
}

// ============================================
// Hardware Color Management
// ============================================

function updateHardwareColor() {
    const select = elements.targetHardware;
    const value = select.value;
    
    // Remove all hardware classes
    select.classList.remove('hardware-opencl', 'hardware-cuda', 'hardware-tflite', 'hardware-executorch');
    
    // Add the appropriate class based on selection
    if (value) {
        select.classList.add(`hardware-${value}`);
    }
}

// ============================================
// Helper Functions
// ============================================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' 
                ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
            }
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// CSS Animation for spinner and toast
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
    
    .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-sm);
        color: var(--text-primary);
        font-size: 0.9rem;
        box-shadow: var(--shadow-lg);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .toast.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .toast-success {
        border-color: var(--success);
    }
    
    .toast-success svg {
        color: var(--success);
    }
    
    .toast-error {
        border-color: var(--error);
    }
    
    .toast-error svg {
        color: var(--error);
    }
`;
document.head.appendChild(style);

