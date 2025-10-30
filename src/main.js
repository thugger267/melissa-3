import './styles.css';
import { login, register, logout, getCurrentUser, onAuthStateChange, checkIfCook } from './auth.js';
import { calculateBMI, generateDietPlan } from './diet.js';
import { supabase } from './supabase.js';

let currentUser = null;

onAuthStateChange((event, session) => {
  (async () => {
    currentUser = session?.user || null;
    updateUI();
  })();
});

async function init() {
  currentUser = await getCurrentUser();
  updateUI();
  setupEventListeners();
}

function updateUI() {
  const welcomeMsg = document.querySelector('header p:last-child');
  if (welcomeMsg && currentUser) {
    welcomeMsg.textContent = `Welcome, ${currentUser.user_metadata.username || 'User'}!`;
  }
}

function setupEventListeners() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const patientForm = document.getElementById('patientForm');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  if (patientForm) {
    patientForm.addEventListener('submit', handlePatientSubmit);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const loginBtn = e.target.querySelector('button[type="submit"]');

  loginBtn.textContent = 'Logging in...';
  loginBtn.disabled = true;

  const { data, error } = await login(username, password);

  if (error) {
    alert('Login failed: ' + error.message);
    loginBtn.textContent = 'Login to System';
    loginBtn.disabled = false;
  } else {
    const isCook = await checkIfCook();
    window.location.href = isCook ? '/cooks.html' : '/patient_form.html';
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;
  const registerBtn = e.target.querySelector('button[type="submit"]');

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long!');
    return;
  }

  registerBtn.textContent = 'Registering...';
  registerBtn.disabled = true;

  const { data, error } = await register(username, password);

  if (error) {
    alert('Registration failed: ' + error.message);
    registerBtn.textContent = 'Register';
    registerBtn.disabled = false;
  } else {
    alert('Registration successful! Please login.');
    window.location.href = '/login.html';
  }
}

async function handlePatientSubmit(e) {
  e.preventDefault();

  if (!currentUser) {
    alert('Please login first');
    window.location.href = '/login.html';
    return;
  }

  const formData = new FormData(e.target);
  const patientData = {
    name: formData.get('patient_name'),
    age: parseInt(formData.get('age')),
    weight: parseFloat(formData.get('weight')),
    diagnosis: formData.get('diagnosis'),
    allergies: formData.get('allergies') || '',
    medical_history: formData.get('medical_history') || '',
    lifestyle: formData.get('lifestyle') || 'sedentary'
  };

  const bmi = calculateBMI(patientData.weight);
  const dietPlan = generateDietPlan(
    patientData.diagnosis,
    patientData.age,
    patientData.weight,
    patientData.lifestyle,
    patientData.allergies
  );

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Generating...';
  submitBtn.disabled = true;

  const { data, error } = await supabase
    .from('patients')
    .insert([{
      user_id: currentUser.id,
      name: patientData.name,
      age: patientData.age,
      weight: patientData.weight,
      diagnosis: patientData.diagnosis,
      allergies: patientData.allergies,
      medical_history: patientData.medical_history,
      lifestyle: patientData.lifestyle,
      bmi: parseFloat(bmi),
      diet_plan: dietPlan
    }])
    .select()
    .maybeSingle();

  if (error) {
    alert('Error saving patient data: ' + error.message);
    submitBtn.textContent = 'Generate Diet Plan';
    submitBtn.disabled = false;
  } else {
    sessionStorage.setItem('currentPatient', JSON.stringify(data));
    window.location.href = '/diet_result.html';
  }
}

async function handleLogout() {
  await logout();
  window.location.href = '/index.html';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.loadReports = async function() {
  if (!currentUser) {
    alert('Please login first');
    return;
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    alert('Error loading reports: ' + error.message);
    return;
  }

  const reportsContainer = document.getElementById('reportsContainer');
  if (!reportsContainer) return;

  if (data.length === 0) {
    reportsContainer.innerHTML = '<p>No patient records found.</p>';
    return;
  }

  reportsContainer.innerHTML = data.map(patient => `
    <div class="patient-card">
      <h3>${patient.name}</h3>
      <p><strong>Age:</strong> ${patient.age} | <strong>Weight:</strong> ${patient.weight}kg | <strong>BMI:</strong> ${patient.bmi}</p>
      <p><strong>Diagnosis:</strong> ${patient.diagnosis}</p>
      <p><strong>Date:</strong> ${new Date(patient.created_at).toLocaleDateString()}</p>
      <button onclick="viewPatientDetails('${patient.id}')">View Details</button>
    </div>
  `).join('');
};

window.viewPatientDetails = async function(patientId) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .maybeSingle();

  if (error || !data) {
    alert('Error loading patient details');
    return;
  }

  sessionStorage.setItem('currentPatient', JSON.stringify(data));
  window.location.href = '/diet_result.html';
};
