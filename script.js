const screen = document.getElementById('screen');
const buttons = document.querySelectorAll('.button');
let expression = '';

const sanitizeExpression = (expr) => {
  return expr.replace(/×/g, '*').replace(/÷/g, '/');
};

const updateScreen = () => {
  screen.textContent = expression || '0';
};

const appendValue = (value) => {
  const lastChar = expression.slice(-1);

  if (value === '.') {
    const parts = expression.split(/[-+*/]/);
    const currentNumber = parts[parts.length - 1] || '';
    if (currentNumber.includes('.')) return;
  }

  if (/[+\-*/]/.test(value)) {
    if (!expression) return;
    if (/[+\-*/]$/.test(lastChar)) {
      expression = expression.slice(0, -1) + value;
      updateScreen();
      return;
    }
  }

  expression += value;
  updateScreen();
};

const calculateResult = () => {
  if (!expression) return;

  const sanitized = sanitizeExpression(expression);
  try {
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
      screen.textContent = 'Error';
      expression = '';
      return;
    }
    expression = String(result);
    updateScreen();
  } catch {
    screen.textContent = 'Error';
    expression = '';
  }
};

const handleFunction = (action) => {
  if (action === 'clear') {
    expression = '';
    updateScreen();
    return;
  }

  if (action === 'delete') {
    expression = expression.slice(0, -1);
    updateScreen();
    return;
  }

  if (action === 'percent') {
    if (!expression) return;
    const sanitized = sanitizeExpression(expression);
    try {
      const result = Function(`"use strict"; return (${sanitized}) / 100`)();
      expression = String(result);
      updateScreen();
    } catch {
      screen.textContent = 'Error';
      expression = '';
    }
  }
};

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.action;

    if (button.classList.contains('number')) {
      appendValue(value);
      return;
    }

    if (button.classList.contains('operator')) {
      appendValue(value);
      return;
    }

    if (button.classList.contains('function')) {
      handleFunction(value);
      return;
    }

    if (button.classList.contains('equals')) {
      calculateResult();
    }
  });
});

window.addEventListener('keydown', (event) => {
  const allowedKeys = '0123456789+-*/.';
  if (allowedKeys.includes(event.key)) {
    appendValue(event.key);
    event.preventDefault();
    return;
  }

  if (event.key === 'Enter' || event.key === '=') {
    calculateResult();
    event.preventDefault();
    return;
  }

  if (event.key === 'Backspace') {
    handleFunction('delete');
    event.preventDefault();
    return;
  }

  if (event.key.toLowerCase() === 'c') {
    handleFunction('clear');
    event.preventDefault();
  }
});
