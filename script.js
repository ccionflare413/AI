const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");

const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

let displayValue = "0";
let firstOperand = null;
let operator = null;
let waitingForOperand = false;
let lastOperator = null;
let lastOperand = null;

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const rounded = Number(value.toPrecision(12));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function render() {
  display.textContent = displayValue;
}

function clear() {
  displayValue = "0";
  firstOperand = null;
  operator = null;
  waitingForOperand = false;
  lastOperator = null;
  lastOperand = null;
  expression.textContent = "";
  render();
}

function inputDigit(digit) {
  if (displayValue === "Error" || waitingForOperand) {
    displayValue = digit;
    waitingForOperand = false;
  } else if (displayValue === "-0") {
    displayValue = `-${digit}`;
  } else {
    displayValue = displayValue === "0" ? digit : displayValue + digit;
  }

  render();
}

function inputDecimal() {
  if (displayValue === "Error" || waitingForOperand) {
    displayValue = "0.";
    waitingForOperand = false;
  } else if (!displayValue.includes(".")) {
    displayValue += ".";
  }

  render();
}

function toggleSign() {
  if (displayValue === "Error") {
    return;
  }

  if (waitingForOperand) {
    displayValue = "-0";
    waitingForOperand = false;
  } else if (displayValue.startsWith("-")) {
    displayValue = displayValue.slice(1);
  } else if (displayValue !== "0") {
    displayValue = `-${displayValue}`;
  }

  render();
}

function backspace() {
  if (displayValue === "Error") {
    clear();
    return;
  }

  if (waitingForOperand) {
    return;
  }

  displayValue = displayValue.length <= 1 || displayValue.length === 2 && displayValue.startsWith("-")
    ? "0"
    : displayValue.slice(0, -1);
  render();
}

function calculate(left, right, selectedOperator) {
  switch (selectedOperator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? NaN : left / right;
    default:
      return right;
  }
}

function chooseOperator(nextOperator) {
  if (displayValue === "Error") {
    clear();
    return;
  }

  const inputValue = Number(displayValue);

  if (operator && !waitingForOperand) {
    const result = calculate(firstOperand, inputValue, operator);
    displayValue = formatNumber(result);
    if (displayValue === "Error") {
      firstOperand = null;
      operator = null;
      lastOperator = null;
      lastOperand = null;
      expression.textContent = "";
      render();
      return;
    }
    firstOperand = Number(displayValue);
  } else if (firstOperand === null || !waitingForOperand) {
    firstOperand = inputValue;
  }

  operator = nextOperator;
  waitingForOperand = true;
  lastOperator = null;
  lastOperand = null;
  expression.textContent = `${formatNumber(firstOperand)} ${operatorSymbols[operator]}`;
  render();
}

function equals() {
  if (displayValue === "Error") {
    return;
  }

  if (operator !== null && !waitingForOperand) {
    const right = Number(displayValue);
    const result = calculate(firstOperand, right, operator);
    expression.textContent = `${formatNumber(firstOperand)} ${operatorSymbols[operator]} ${formatNumber(right)} =`;
    lastOperator = operator;
    lastOperand = right;
    displayValue = formatNumber(result);
    firstOperand = null;
    operator = null;
    waitingForOperand = true;
  } else if (operator === null && lastOperator !== null) {
    const left = Number(displayValue);
    const result = calculate(left, lastOperand, lastOperator);
    expression.textContent = `${formatNumber(left)} ${operatorSymbols[lastOperator]} ${formatNumber(lastOperand)} =`;
    displayValue = formatNumber(result);
    waitingForOperand = true;
  }

  if (displayValue === "Error") {
    firstOperand = null;
    operator = null;
    lastOperator = null;
    lastOperand = null;
  }

  render();
}

function handleAction(action, value) {
  switch (action) {
    case "digit":
      inputDigit(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      chooseOperator(value);
      break;
    case "equals":
      equals();
      break;
    case "clear":
      clear();
      break;
    case "backspace":
      backspace();
      break;
    case "sign":
      toggleSign();
      break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button) {
    handleAction(button.dataset.action, button.dataset.value);
  }
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) {
    inputDigit(event.key);
  } else if (event.key === ".") {
    inputDecimal();
  } else if (Object.hasOwn(operatorSymbols, event.key)) {
    chooseOperator(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    equals();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (event.key === "Escape") {
    clear();
  }
});

render();
