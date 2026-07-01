const header = document.getElementById('mainHeader');

const bmiForm = document.getElementById('bmiForm');
const fullNameInput = document.getElementById('fullName');
const ageInput = document.getElementById('age');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');

const calculateBtn = document.getElementById('calculateBtn');
const calculateBtnText = document.getElementById('calculateBtnText');
const calculateSpinner = document.getElementById('calculateSpinner');

const resultCard = document.getElementById('resultCard');
const toastContainer = document.getElementById('toastContainer');
const backToTopBtn = document.getElementById('backToTopBtn');
const livePreview = document.getElementById('livePreview');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => spyObserver.observe(section));
}
initScrollSpy();

function initScrollReveal() {
  const revealTargets = document.querySelectorAll('.tip-card, .bmi-card');

  revealTargets.forEach((el) => el.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}
initScrollReveal();

document.querySelectorAll('.btn-ripple').forEach((btn) => {
  btn.addEventListener('click', function (e) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);

    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

let submissions = [];
let recordIdCounter = 1;

function validateField(fieldName, value) {
  if (fieldName === 'fullName') {
    if (value.trim() === '') {
      return 'Please enter your full name.';
    } else if (value.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(value.trim())) {
      return 'Name should only contain letters, spaces, and hyphens.';
    } else {
      return '';
    }
  }

  else if (fieldName === 'age') {
    const age = Number(value);
    if (value === '' || value === null) {
      return 'Please enter your age.';
    } else if (isNaN(age)) {
      return 'Age must be a valid number.';
    } else if (age < 10) {
      return 'Age must be at least 10.';
    } else if (age > 100) {
      return 'Age must be 100 or below.';
    } else {
      return '';
    }
  }

  else if (fieldName === 'sex') {
    if (value === '' || value === null) {
      return 'Please select your sex.';
    } else {
      return '';
    }
  }

  else if (fieldName === 'weight') {
    const weight = Number(value);
    if (value === '' || value === null) {
      return 'Please enter your weight.';
    } else if (isNaN(weight)) {
      return 'Weight must be a valid number.';
    } else if (weight < 20) {
      return 'Weight must be at least 20 kg.';
    } else if (weight > 300) {
      return 'Weight must be 300 kg or below.';
    } else {
      return '';
    }
  }

  else if (fieldName === 'height') {
    const height = Number(value);
    if (value === '' || value === null) {
      return 'Please enter your height.';
    } else if (isNaN(height)) {
      return 'Height must be a valid number.';
    } else if (height < 80) {
      return 'Height must be at least 80 cm.';
    } else if (height > 250) {
      return 'Height must be 250 cm or below.';
    } else {
      return '';
    }
  }

  return '';
}

function validateForm() {
  const sexChecked = document.querySelector('input[name="sex"]:checked');

  const fields = [
    { name: 'fullName', value: fullNameInput.value, input: fullNameInput, errorEl: document.getElementById('fullNameError') },
    { name: 'age', value: ageInput.value, input: ageInput, errorEl: document.getElementById('ageError') },
    { name: 'sex', value: sexChecked ? sexChecked.value : '', input: null, errorEl: document.getElementById('sexError') },
    { name: 'weight', value: weightInput.value, input: weightInput, errorEl: document.getElementById('weightError') },
    { name: 'height', value: heightInput.value, input: heightInput, errorEl: document.getElementById('heightError') },
  ];

  let isFormValid = true;

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const errorMessage = validateField(field.name, field.value);

    if (errorMessage !== '') {
      isFormValid = false;
      field.errorEl.textContent = errorMessage;
      if (field.input) field.input.classList.add('is-invalid');
    } else {
      field.errorEl.textContent = '';
      if (field.input) field.input.classList.remove('is-invalid');
    }
  }

  return isFormValid;
}

function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

function updateLivePreview() {
  const weight = Number(weightInput.value);
  const height = Number(heightInput.value);

  const weightValid = weight >= 20 && weight <= 300;
  const heightValid = height >= 80 && height <= 250;

  if (weightValid && heightValid) {
    const estimatedBmi = calculateBMI(weight, height);
    const classification = classifyBMI(estimatedBmi);
    livePreview.innerHTML = `<i class="bi ${classification.icon}" aria-hidden="true"></i> Live estimate: ${estimatedBmi} — ${classification.category}`;
    livePreview.classList.remove('d-none');
  } else {
    livePreview.classList.add('d-none');
  }
}

weightInput.addEventListener('input', updateLivePreview);
heightInput.addEventListener('input', updateLivePreview);

function classifyBMI(bmi) {
  let category;

  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  let result = {
    category: category,
    badgeClass: '',
    icon: '',
    recommendation: '',
  };

  switch (category) {
    case 'Underweight':
      result.badgeClass = 'badge-underweight';
      result.icon = 'bi-arrow-down-circle-fill';
      result.recommendation = 'Increase nutrient-rich food intake and consult a healthcare professional if needed.';
      break;

    case 'Normal':
      result.badgeClass = 'badge-normal';
      result.icon = 'bi-check-circle-fill';
      result.recommendation = 'Great job! Maintain your healthy lifestyle with regular exercise.';
      break;

    case 'Overweight':
      result.badgeClass = 'badge-overweight';
      result.icon = 'bi-exclamation-circle-fill';
      result.recommendation = 'Consider increasing physical activity and eating a balanced diet.';
      break;

    case 'Obese':
      result.badgeClass = 'badge-obese';
      result.icon = 'bi-exclamation-triangle-fill';
      result.recommendation = 'Please consult a healthcare provider for personalized guidance.';
      break;

    default:
      result.badgeClass = 'badge-normal';
      result.icon = 'bi-info-circle-fill';
      result.recommendation = 'Unable to determine category.';
  }

  return result;
}

function hideResultCard() {
  resultCard.classList.remove('show');
  resultCard.classList.add('d-none');
  resultCard.innerHTML = '';
}

function clearValidationMessages() {
  const errorFields = [
    { input: fullNameInput, errorEl: document.getElementById('fullNameError') },
    { input: ageInput, errorEl: document.getElementById('ageError') },
    { input: null, errorEl: document.getElementById('sexError') },
    { input: weightInput, errorEl: document.getElementById('weightError') },
    { input: heightInput, errorEl: document.getElementById('heightError') },
  ];

  for (let i = 0; i < errorFields.length; i++) {
    errorFields[i].errorEl.textContent = '';
    if (errorFields[i].input) errorFields[i].input.classList.remove('is-invalid');
  }
}

function clearFormFieldValues() {
  fullNameInput.value = '';
  ageInput.value = '';
  weightInput.value = '';
  heightInput.value = '';
  document.querySelectorAll('input[name="sex"]').forEach((radio) => {
    radio.checked = false;
  });
  livePreview.classList.add('d-none');
}

function resetKioskState() {
  hideResultCard();
  clearValidationMessages();
  livePreview.classList.add('d-none');
}
bmiForm.addEventListener('reset', resetKioskState);

function handleFreshInputStart() {
  if (!resultCard.classList.contains('d-none')) {
    hideResultCard();
  }
}
bmiForm.addEventListener('input', handleFreshInputStart);
bmiForm.addEventListener('change', handleFreshInputStart);

function buildGaugeSVG(bmi) {
  const clampedBmi = Math.min(Math.max(bmi, 10), 40);
  const targetAngle = -90 + ((clampedBmi - 10) / 30) * 180;

  return `
    <svg viewBox="0 0 240 150" class="bmi-gauge" role="img" aria-label="BMI gauge showing a value of ${bmi}">
      <path d="M20 120 A100 100 0 0 1 220 120" class="gauge-track"/>
      <path d="M20 120 A100 100 0 0 1 220 120" class="gauge-zone gauge-zone-under" stroke-dasharray="89.01 225.15" stroke-dashoffset="0"/>
      <path d="M20 120 A100 100 0 0 1 220 120" class="gauge-zone gauge-zone-normal" stroke-dasharray="68.07 246.09" stroke-dashoffset="-89.01"/>
      <path d="M20 120 A100 100 0 0 1 220 120" class="gauge-zone gauge-zone-over" stroke-dasharray="52.36 261.80" stroke-dashoffset="-157.08"/>
      <path d="M20 120 A100 100 0 0 1 220 120" class="gauge-zone gauge-zone-obese" stroke-dasharray="104.72 209.44" stroke-dashoffset="-209.44"/>
      <line x1="120" y1="120" x2="120" y2="38" class="gauge-needle" data-target-angle="${targetAngle}" style="transform: rotate(-90deg);"/>
      <circle cx="120" cy="120" r="7" class="gauge-pivot"/>
      <text x="120" y="112" class="gauge-value">${bmi}</text>
      <text x="120" y="132" class="gauge-caption">BMI</text>
    </svg>
  `;
}

function renderResultCard(record) {
  resultCard.innerHTML = `
    <div class="result-header">
      <p class="mb-0 text-muted">Result for <strong>${record.name}</strong></p>
      <span class="result-badge ${record.badgeClass}">
        <i class="bi ${record.icon}" aria-hidden="true"></i> ${record.category}
      </span>
    </div>
    <div class="gauge-wrapper">
      ${buildGaugeSVG(record.bmi)}
    </div>
    <div class="result-recommendation">
      <strong>Recommendation:</strong> ${record.recommendation}
    </div>
    <p class="result-meta">Recorded on ${record.date}</p>
  `;

  resultCard.classList.remove('d-none', 'show');
  void resultCard.offsetWidth;
  resultCard.classList.add('show');

  resultCard.setAttribute('tabindex', '-1');
  resultCard.focus({ preventScroll: true });

  const needle = resultCard.querySelector('.gauge-needle');
  if (needle) {
    const targetAngle = needle.getAttribute('data-target-angle');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        needle.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
        needle.style.transform = `rotate(${targetAngle}deg)`;
      });
    });
  }

  resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showToast(message, type = 'success') {
  const bgClass =
    type === 'success' ? 'text-bg-success' :
    type === 'danger' ? 'text-bg-danger' :
    'text-bg-info';

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center ${bgClass} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);

  const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

bmiForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (calculateBtn.disabled) return;

  const isValid = validateForm();
  if (!isValid) {
    showToast('Please fix the highlighted fields.', 'danger');
    return;
  }

  calculateBtnText.textContent = 'Calculating...';
  calculateSpinner.classList.remove('d-none');
  calculateBtn.disabled = true;

  setTimeout(() => {
    const name = fullNameInput.value.trim();
    const age = Number(ageInput.value);
    const sex = document.querySelector('input[name="sex"]:checked').value;
    const weight = Number(weightInput.value);
    const height = Number(heightInput.value);

    const bmi = calculateBMI(weight, height);
    const classification = classifyBMI(bmi);

    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const record = {
      id: recordIdCounter++,
      name,
      age,
      sex,
      weight,
      height,
      bmi,
      category: classification.category,
      badgeClass: classification.badgeClass,
      icon: classification.icon,
      recommendation: classification.recommendation,
      date: formattedDate,
    };

    submissions.unshift(record);

    renderResultCard(record);
    sendToGoogleSheets(record);

    calculateBtnText.textContent = 'Calculate BMI';
    calculateSpinner.classList.add('d-none');
    calculateBtn.disabled = false;

    showToast('BMI calculated successfully!', 'success');
    clearFormFieldValues();
  }, 600);
});

function sendToGoogleSheets(data) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwR4EUbsloouYNpH_8Fgw49oFK0Cla7VyOPvY3PBGcW-2l8RkLqeA1XjF-GmEviwO4/exec";

  if (!scriptURL || scriptURL.includes("PASTE_YOUR")) {
    console.warn('sendToGoogleSheets(): no Web App URL configured yet.', data);
    return;
  }

  const formData = new URLSearchParams();
  formData.append('name', data.name);
  formData.append('age', data.age);
  formData.append('sex', data.sex);
  formData.append('weight', data.weight);
  formData.append('height', data.height);
  formData.append('bmi', data.bmi);
  formData.append('category', data.category);

  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData,
  })
    .then(() => {
      console.log('Submission sent to Google Sheets.');
    })
    .catch((error) => {
      console.error('Error sending to Google Sheets:', error);
      showToast('Saved locally, but could not reach Google Sheets.', 'danger');
    });
}