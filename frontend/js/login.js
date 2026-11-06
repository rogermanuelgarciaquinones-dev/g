// SELECTOR DE ROL Y DISEÑO
const roleTabs    = document.querySelectorAll('.role-tab');
const roleInput   = document.getElementById('role');
const roleLabel   = document.getElementById('roleLabel');
const emailInput  = document.getElementById('email');
const passInput   = document.getElementById('password');

const roleConfig = {
  admin:      { label: 'Administrador', email: 'admin@escuela.com',      accent: '#ff5a1f' },
  profesor:   { label: 'Profesor',      email: 'ana@escuela.com',         accent: '#ffe14d' },
  estudiante: { label: 'Estudiante',    email: 'estudiante@escuela.com',  accent: '#f2efe6' },
};

function setRole(role) {
  roleTabs.forEach(t => {
    t.classList.toggle('active', t.dataset.role === role);
  });
  roleInput.value = role;
  roleLabel.textContent = roleConfig[role].label;
  document.documentElement.style.setProperty('--accent', roleConfig[role].accent);
  emailInput.placeholder = roleConfig[role].email;
}

roleTabs.forEach(tab => {
  tab.addEventListener('click', () => setRole(tab.dataset.role));
});

document.getElementById('togglePass').addEventListener('click', () => {
  const isPass = passInput.type === 'password';
  passInput.type = isPass ? 'text' : 'password';
  document.getElementById('togglePass').textContent = isPass ? 'OCULTAR' : 'VER';
});

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const role = btn.dataset.quick;
    setRole(role);
    emailInput.value = roleConfig[role].email;
    passInput.value  = '123456';
    emailInput.focus();
  });
});

// CONEXIÓN CON EL BACKEND
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passInput.value;
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;

  submitBtn.innerHTML = '<span>Verificando...</span>';
  submitBtn.disabled = true;

  try {
    const respuesta = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.message || 'Error al iniciar sesión');
    }

    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));

    alert(`¡Bienvenido ${datos.usuario.nombre}! Entrando como ${datos.usuario.rol}...`);
    
    // Aquí luego redirigiremos a los paneles reales
    // window.location.href = 'admin.html';
    // ...
    // Redirigimos al panel correspondiente
    if (datos.usuario.rol === 'admin') {
      window.location.href = 'admin.html';
    } else if (datos.usuario.rol === 'profesor') {
      alert('Panel de profesor en construcción.');
    } else {
      alert('Panel de estudiante en construcción.');
    }
// ...

  } catch (error) {
    alert(error.message);
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});