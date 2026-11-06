// 1. PROTECCIÓN DE LA PÁGINA (¿Hay sesión iniciada?)
const token = localStorage.getItem('token');
const usuarioStr = localStorage.getItem('usuario');

if (!token || !usuarioStr) {
  alert('Debes iniciar sesión para acceder a esta página.');
  window.location.href = 'login.html';
}

// 2. MOSTRAR DATOS DEL USUARIO EN EL SIDEBAR
if (usuarioStr) {
  const usuario = JSON.parse(usuarioStr);
  document.getElementById('userName').textContent = usuario.nombre;
  document.getElementById('userEmail').textContent = usuario.email;
  document.getElementById('userAvatar').textContent = usuario.nombre.charAt(0).toUpperCase();
}

// 3. CERRAR SESIÓN
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
});

// 4. FUNCIONAMIENTO DE LAS PESTAÑAS (TABS)
const navItems = document.querySelectorAll('.nav-item');
const contents = document.querySelectorAll('.tab-content');
const crumbActive = document.getElementById('crumbActive');

const tabNames = {
  dashboard: 'Dashboard', estudiantes: 'Estudiantes', profesores: 'Profesores',
  materias: 'Materias', inscripciones: 'Inscripciones', calificaciones: 'Calificaciones'
};

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const tab = item.dataset.tab;
    
    // Quitar clase active de todos
    navItems.forEach(n => n.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    // Poner active al seleccionado
    item.classList.add('active');
    document.querySelector(`[data-content="${tab}"]`).classList.add('active');
    crumbActive.textContent = tabNames[tab];
  });
});

// 5. RELOJ
function updateClock() {
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + 
               now.getMinutes().toString().padStart(2, '0') + ':' + 
               now.getSeconds().toString().padStart(2, '0');
  document.getElementById('clock').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();


/* =====================================================
   MÓDULO: ESTUDIANTES (Conexión a Base de Datos)
===================================================== */
async function cargarEstudiantes() {
  const tbody = document.getElementById('tablaEstudiantesBody');
  const count = document.getElementById('countEstudiantes');

  try {
    // Hacemos la petición a nuestra API, enviando el token
    const respuesta = await fetch('http://localhost:3000/api/estudiantes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` // Aquí enviamos la llave que guardamos en el login
      }
    });

    if (!respuesta.ok) {
      throw new Error('Error al cargar los estudiantes');
    }

    const estudiantes = await respuesta.json();
    
    // Actualizamos el contador
    count.textContent = `${estudiantes.length} registros`;

    // Si no hay estudiantes, mostramos un mensaje
    if (estudiantes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay estudiantes registrados.</td></tr>';
      return;
    }

    // Limpiamos la tabla y dibujamos las filas
    tbody.innerHTML = '';
    // (Dentro de cargarEstudiantes, reemplaza tu forEach por este)
    estudiantes.forEach(est => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${String(est.id).padStart(3, '0')}</td>
        <td>${est.nombre}</td>
        <td>${est.documento}</td>
        <td>${est.email}</td>
        <td>${est.telefono || '—'}</td>
        <td><span class="badge ${est.estado}">${est.estado}</span></td>
        <td class="col-actions">
          <div class="row-actions">
            <!-- Llamamos a las funciones JS pasando los datos -->
            <button class="icon-btn" onclick="abrirEditar('${est.id}', '${est.nombre}', '${est.email}', '${est.documento}', '${est.telefono || ''}', '${est.estado}')">✎</button>
            <button class="icon-btn danger" onclick="eliminarEstudiante('${est.id}')">✕</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: #ef4444;">Error al conectar con la base de datos.</td></tr>';
  }
}

// Llamamos a la función apenas cargue la página
cargarEstudiantes();

/* =====================================================
   LÓGICA DEL MODAL, CREACIÓN, EDICIÓN Y ELIMINACIÓN
===================================================== */
const modal = document.getElementById('modalEstudiante');
const formEstudiante = document.getElementById('formEstudiante');
const modalTitulo = document.getElementById('modalTitulo');
const editId = document.getElementById('editId');
const estadoField = document.getElementById('estadoField');

// Abrir modal para CREAR
document.querySelector('[data-content="estudiantes"] .btn-primary').addEventListener('click', () => {
  formEstudiante.reset();
  editId.value = ''; // Limpiamos el ID
  modalTitulo.textContent = 'Nuevo Estudiante';
  estadoField.style.display = 'none'; // Ocultamos el estado
  modal.style.display = 'flex';
});

// Cerrar modal
document.getElementById('btnCerrarModal').addEventListener('click', () => modal.style.display = 'none');
document.getElementById('btnCancelarModal').addEventListener('click', () => modal.style.display = 'none');

// Guardar (POST o PUT dependiendo de si hay ID)
formEstudiante.addEventListener('submit', async (e) => {
  e.preventDefault();

  const esEdicion = editId.value !== '';
  const url = esEdicion 
    ? `http://localhost:3000/api/estudiantes/${editId.value}` 
    : 'http://localhost:3000/api/estudiantes';
  const metodo = esEdicion ? 'PUT' : 'POST';

  const nuevoEstudiante = {
    nombre: document.getElementById('newNombre').value,
    email: document.getElementById('newEmail').value,
    documento: document.getElementById('newDocumento').value,
    telefono: document.getElementById('newTelefono').value,
    estado: document.getElementById('newEstado').value
  };

  const btnGuardar = document.getElementById('btnGuardar');
  btnGuardar.textContent = 'Guardando...';
  btnGuardar.disabled = true;

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(nuevoEstudiante)
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.message);

    alert(esEdicion ? 'Estudiante actualizado' : 'Estudiante creado');
    modal.style.display = 'none';
    cargarEstudiantes(); // Recargar la tabla

  } catch (error) {
    alert(error.message);
  } finally {
    btnGuardar.textContent = 'Guardar Estudiante';
    btnGuardar.disabled = false;
  }
});

// FUNCIÓN PARA EDITAR (Se llama desde el botón ✎ de la tabla)
function abrirEditar(id, nombre, email, documento, telefono, estado) {
  formEstudiante.reset();
  editId.value = id;
  document.getElementById('newNombre').value = nombre;
  document.getElementById('newEmail').value = email;
  document.getElementById('newDocumento').value = documento;
  document.getElementById('newTelefono').value = telefono;
  document.getElementById('newEstado').value = estado;
  
  modalTitulo.textContent = 'Editar Estudiante';
  estadoField.style.display = 'flex'; // Mostramos el estado
  modal.style.display = 'flex';
}

// FUNCIÓN PARA ELIMINAR (Se llama desde el botón ✕ de la tabla)
async function eliminarEstudiante(id) {
  if (!confirm('¿Estás seguro de eliminar este estudiante? Esta acción no se puede deshacer.')) return;

  try {
    const respuesta = await fetch(`http://localhost:3000/api/estudiantes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!respuesta.ok) throw new Error('Error al eliminar');
    
    alert('Estudiante eliminado');
    cargarEstudiantes(); // Recargar la tabla
  } catch (error) { 
    alert(error.message);
  }
}

/* =====================================================
   MÓDULO: PROFESORES
===================================================== */
async function cargarProfesores() {
  const tbody = document.getElementById('tablaProfesoresBody');
  try {
    const respuesta = await fetch('http://localhost:3000/api/profesores', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profesores = await respuesta.json();
    
    tbody.innerHTML = '';
    profesores.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td>#${String(p.id).padStart(3, '0')}</td>
          <td>${p.nombre}</td>
          <td>${p.documento}</td>
          <td>${p.especialidad}</td>
          <td>${p.email}</td>
          <td><span class="badge ${p.estado}">${p.estado}</span></td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="icon-btn" onclick="abrirEditarProfesor('${p.id}', '${p.nombre}', '${p.email}', '${p.documento}', '${p.especialidad}', '${p.telefono || ''}', '${p.estado}')">✎</button>
              <button class="icon-btn danger" onclick="eliminarProfesor('${p.id}')">✕</button>
            </div>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error(error);
  }
}

const modalProfesor = document.getElementById('modalProfesor');
const formProfesor = document.getElementById('formProfesor');

function abrirModalProfesor() {
  formProfesor.reset();
  document.getElementById('editIdProf').value = '';
  document.getElementById('modalTituloProfesor').textContent = 'Nuevo Profesor';
  document.getElementById('profEstadoField').style.display = 'none';
  modalProfesor.style.display = 'flex';
}

function cerrarModalProfesor() {
  modalProfesor.style.display = 'none';
}

function abrirEditarProfesor(id, nombre, email, documento, especialidad, telefono, estado) {
  formProfesor.reset();
  document.getElementById('editIdProf').value = id;
  document.getElementById('profNombre').value = nombre;
  document.getElementById('profEmail').value = email;
  document.getElementById('profDocumento').value = documento;
  document.getElementById('profEspecialidad').value = especialidad;
  document.getElementById('profTelefono').value = telefono;
  document.getElementById('profEstado').value = estado;
  document.getElementById('modalTituloProfesor').textContent = 'Editar Profesor';
  document.getElementById('profEstadoField').style.display = 'flex';
  modalProfesor.style.display = 'flex';
}

formProfesor.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editIdProf').value;
  const esEdicion = id !== '';
  
  const data = {
    nombre: document.getElementById('profNombre').value,
    email: document.getElementById('profEmail').value,
    documento: document.getElementById('profDocumento').value,
    especialidad: document.getElementById('profEspecialidad').value,
    telefono: document.getElementById('profTelefono').value,
    estado: document.getElementById('profEstado').value
  };

  const url = esEdicion ? `http://localhost:3000/api/profesores/${id}` : 'http://localhost:3000/api/profesores';
  const metodo = esEdicion ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al guardar');
    alert(esEdicion ? 'Profesor actualizado' : 'Profesor creado');
    cerrarModalProfesor();
    cargarProfesores();
  } catch (error) {
    alert(error.message);
  }
});

async function eliminarProfesor(id) {
  if (!confirm('¿Eliminar profesor?')) return;
  try {
    await fetch(`http://localhost:3000/api/profesores/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    cargarProfesores();
  } catch (error) {
    alert('Error al eliminar');
  }
}

// Cargar profesores cuando se abre la pestaña
document.querySelector('[data-tab="profesores"]').addEventListener('click', () => {
  cargarProfesores();
});
// Cargar al inicio por si acaso
cargarProfesores();