const elements = {
    form: document.getElementById('branchForm'),
    taskId: document.getElementById('taskId'),
    branchName: document.getElementById('branchName'),
    resultInput: document.getElementById('resultInput'),
    copyBtn: document.getElementById('copyBtn'),
    lengthInfo: document.getElementById('lengthInfo'),
    errors: {
        taskId: document.getElementById('taskIdError'),
        branchName: document.getElementById('branchNameError')
    }
};

const errorUtils = {
    clear(input) {
        if (!input) return;
        input.classList.remove('error');
        
        const errorElement = input.id === 'taskId' ? elements.errors.taskId : 
                            input.id === 'branchName' ? elements.errors.branchName : null;
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    },
    show(input, message) {
        if (!input) return;
        input.classList.add('error');
        
        const errorElement = input.id === 'taskId' ? elements.errors.taskId : 
                            input.id === 'branchName' ? elements.errors.branchName : null;
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
};

const validators = {
    isValidBranchName: (str) => {
        if (!str) return false;
        const allowedPattern = /^[a-zA-Z0-9\s_-]+$/;
        return allowedPattern.test(str);
    },
    extractTaskId: (input) => {
        if (!input) return '';
        const match = input.match(/([A-Z]+-\d+)/i);
        return match ? match[1].toUpperCase() : '';
    },
    normalizeBranchName: (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s_-]/g, '')
            .replace(/[\s-]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }
};

document.querySelectorAll('input[name="branchType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (elements.taskId) {
            elements.taskId.disabled = e.target.value === 'hotfix';
            errorUtils.clear(elements.taskId);
        }
        if (elements.branchName) {
            errorUtils.clear(elements.branchName);
        }
    });
});

const applyTheme = (theme) => {
    document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '');
    if (theme) {
        document.documentElement.classList.add(`theme-${theme}`);
    }
    
    if (document.body) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        if (theme) {
            document.body.classList.add(`theme-${theme}`);
        }
    }
    
    try {
        localStorage.setItem('theme', theme || 'light');
    } catch (e) {
        console.warn('Не удалось сохранить тему в localStorage:', e);
    }
};

const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('theme-dark');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
};

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const htmlHasTheme = document.documentElement.classList.contains('theme-dark') || 
                         document.documentElement.classList.contains('theme-light');
    const bodyHasTheme = document.body && (document.body.classList.contains('theme-dark') || 
                                           document.body.classList.contains('theme-light'));
    
    if (!htmlHasTheme && !bodyHasTheme) {
        try {
            const savedTheme = localStorage.getItem('theme') || 'light';
            applyTheme(savedTheme);
        } catch (e) {
            console.warn('Не удалось прочитать тему из localStorage:', e);
            applyTheme('light');
        }
    } else if (htmlHasTheme && document.body) {
        const htmlTheme = Array.from(document.documentElement.classList)
            .find(cls => cls.startsWith('theme-'));
        if (htmlTheme) {
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            document.body.classList.add(htmlTheme);
        }
    }
});

const updateResultLength = () => {
    if (!elements.resultInput || !elements.lengthInfo) return;
    
    const length = elements.resultInput.value.length;
    const isValid = length <= 40;
    elements.lengthInfo.className = `length-info ${isValid ? 'valid' : 'invalid'}`;
    
    if (isValid) {
        elements.lengthInfo.textContent = `Длина: ${length} символов ✓`;
    } else {
        elements.lengthInfo.innerHTML = `Длина: ${length} символов ⚠<br>Превышает максимальную длину (40 символов)`;
    }
};

if (elements.branchName) {
    elements.branchName.addEventListener('input', () => {
        errorUtils.clear(elements.branchName);
    });
}

if (elements.taskId) {
    elements.taskId.addEventListener('input', () => {
        errorUtils.clear(elements.taskId);
    });
}

if (elements.resultInput) {
    elements.resultInput.addEventListener('input', updateResultLength);
}

if (elements.form) {
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const branchTypeRadio = document.querySelector('input[name="branchType"]:checked');
        if (!branchTypeRadio) return;
        
        const branchType = branchTypeRadio.value;
        const taskIdValue = elements.taskId ? elements.taskId.value.trim() : '';
        const branchNameValue = elements.branchName ? elements.branchName.value.trim() : '';

        if (elements.taskId) {
            errorUtils.clear(elements.taskId);
        }
        if (elements.branchName) {
            errorUtils.clear(elements.branchName);
        }

        if (branchType === 'feature') {
            if (!taskIdValue) {
                if (elements.taskId) {
                    errorUtils.show(elements.taskId, 'Пожалуйста, заполните ID задачи');
                }
                return;
            }

            const isUrl = /^https?:\/\//i.test(taskIdValue);
            if (!isUrl && !validators.isValidBranchName(taskIdValue)) {
                if (elements.taskId) {
                    errorUtils.show(elements.taskId, 'Используйте только латинские буквы, цифры и дефисы');
                }
                return;
            }

            const extractedTaskId = validators.extractTaskId(taskIdValue);
            if (!extractedTaskId) {
                if (elements.taskId) {
                    errorUtils.show(elements.taskId, 'Неверный формат ID (ожидается PROJECT-123)');
                }
                return;
            }
        }

        if (!branchNameValue) {
            if (elements.branchName) {
                errorUtils.show(elements.branchName, 'Пожалуйста, заполните это поле');
            }
            return;
        }

        if (!validators.isValidBranchName(branchNameValue)) {
            if (elements.branchName) {
                errorUtils.show(elements.branchName, 'Используйте только латинские буквы, цифры и дефисы');
            }
            return;
        }

        const normalized = validators.normalizeBranchName(branchNameValue);
        let result = '';

        if (branchType === 'hotfix') {
            result = `feature/hotfix-${normalized}`;
        } else {
            const taskId = validators.extractTaskId(taskIdValue);
            result = `${branchType}/${taskId}-${normalized}`;
        }

        if (elements.resultInput) {
            elements.resultInput.value = result;
            elements.resultInput.disabled = false;
        }
        if (elements.copyBtn) {
            elements.copyBtn.disabled = false;
        }

        updateResultLength();

        const submitButton = elements.form.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalText = submitButton.textContent;
            submitButton.textContent = '✓';
            
            setTimeout(() => {
                submitButton.textContent = originalText;
            }, 800);
        }
    });
}

if (elements.copyBtn && elements.resultInput) {
    elements.copyBtn.addEventListener('click', async () => {
        const textToCopy = elements.resultInput.value;
        if (!textToCopy) return;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                elements.resultInput.select();
                elements.resultInput.setSelectionRange(0, 99999);
                const successful = document.execCommand('copy');
                if (!successful) {
                    throw new Error('Не удалось скопировать текст');
                }
            }

            const originalText = elements.copyBtn.textContent;
            elements.copyBtn.textContent = '✓';
            elements.copyBtn.classList.add('copied');

            setTimeout(() => {
                elements.copyBtn.textContent = originalText;
                elements.copyBtn.classList.remove('copied');
            }, 800);
        } catch (err) {
            console.error('Ошибка при копировании:', err);
            const originalText = elements.copyBtn.textContent;
            elements.copyBtn.textContent = 'Ошибка';
            elements.copyBtn.classList.add('error');

            setTimeout(() => {
                elements.copyBtn.textContent = originalText;
                elements.copyBtn.classList.remove('error');
            }, 2000);
        }
    });
}

