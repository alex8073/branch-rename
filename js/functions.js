// Кеширование элементов DOM
const elements = {
    form: document.getElementById('branchForm'),
    taskId: document.getElementById('taskId'),
    branchName: document.getElementById('branchName'),
    resultInput: document.getElementById('resultInput'),
    copyBtn: document.getElementById('copyBtn'),
    lengthInfo: document.getElementById('lengthInfo'),
    errors: {
        taskIdEmpty: document.getElementById('taskIdEmptyError'),
        taskIdFormat: document.getElementById('taskIdFormatError'),
        branchNameEmpty: document.getElementById('branchNameEmptyError'),
        branchNameRussian: document.getElementById('branchNameError')
    }
};

// Утилиты для работы с ошибками
const errorUtils = {
    clear(input) {
        input.classList.remove('error');
        Object.values(elements.errors).forEach(error => error.classList.remove('show'));
    },
    show(input, errorElement) {
        input.classList.add('error');
        errorElement.classList.add('show');
    }
};

// Утилиты для валидации
const validators = {
    hasRussianChars: (str) => /[а-яА-ЯёЁ]/.test(str),
    extractTaskId: (input) => {
        if (!input) return '';
        const match = input.match(/([A-Z]+-\d+)/i);
        return match ? match[1].toUpperCase() : '';
    },
    normalizeBranchName: (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
};

// Обработчик переключения типа ветки
document.querySelectorAll('input[name="branchType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        elements.taskId.disabled = e.target.value === 'hotfix';
        errorUtils.clear(elements.taskId);
        errorUtils.clear(elements.branchName);
    });
});

// Функция обновления длины результата
const updateResultLength = () => {
    const length = elements.resultInput.value.length;
    const isValid = length <= 40;
    elements.lengthInfo.className = `length-info ${isValid ? 'valid' : 'invalid'}`;
    
    if (isValid) {
        elements.lengthInfo.textContent = `Длина: ${length} символов ✓`;
    } else {
        elements.lengthInfo.innerHTML = `Длина: ${length} символов ⚠<br>Превышает максимальную длину (40 символов)`;
    }
};

// Обработчики очистки ошибок при вводе
elements.branchName.addEventListener('input', () => {
    errorUtils.clear(elements.branchName);
});

elements.taskId.addEventListener('input', () => {
    errorUtils.clear(elements.taskId);
});

// Обработчик изменения результата
elements.resultInput.addEventListener('input', updateResultLength);

// Обработчик отправки формы
elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const branchType = document.querySelector('input[name="branchType"]:checked').value;
    const taskIdValue = elements.taskId.value.trim();
    const branchNameValue = elements.branchName.value.trim();

    // Очистка всех ошибок
    errorUtils.clear(elements.taskId);
    errorUtils.clear(elements.branchName);

    // Валидация ID задачи для feature
    if (branchType === 'feature') {
        if (!taskIdValue) {
            errorUtils.show(elements.taskId, elements.errors.taskIdEmpty);
            return;
        }

        const extractedTaskId = validators.extractTaskId(taskIdValue);
        if (!extractedTaskId) {
            errorUtils.show(elements.taskId, elements.errors.taskIdFormat);
            return;
        }
    }

    // Валидация названия ветки
    if (!branchNameValue) {
        errorUtils.show(elements.branchName, elements.errors.branchNameEmpty);
        return;
    }

    if (validators.hasRussianChars(branchNameValue)) {
        errorUtils.show(elements.branchName, elements.errors.branchNameRussian);
        return;
    }

    // Генерация результата
    const normalized = validators.normalizeBranchName(branchNameValue);
    let result = '';

    if (branchType === 'hotfix') {
        result = `feature/hotfix-${normalized}`;
    } else {
        const taskId = validators.extractTaskId(taskIdValue);
        result = `${branchType}/${taskId}-${normalized}`;
    }

    // Отображение результата
    elements.resultInput.value = result;
    elements.resultInput.disabled = false;
    elements.copyBtn.disabled = false;

    // Информация о длине
    updateResultLength();
});

// Обработчик копирования
elements.copyBtn.addEventListener('click', () => {
    elements.resultInput.select();
    document.execCommand('copy');

    const originalText = elements.copyBtn.textContent;
    elements.copyBtn.textContent = '✓';
    elements.copyBtn.classList.add('copied');

    setTimeout(() => {
        elements.copyBtn.textContent = originalText;
        elements.copyBtn.classList.remove('copied');
    }, 2000);
});

