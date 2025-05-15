// Variables globales
let modal;
let employeeForm;
let employeesTableBody;

// Funciones para spinner y confirmación visual
function mostrarSpinner() {
    document.getElementById('spinnerGlobal').style.display = 'block';
}
function ocultarSpinner() {
    document.getElementById('spinnerGlobal').style.display = 'none';
}
function mostrarConfirmacion(mensaje) {
    const confirmDiv = document.getElementById('confirmacionVisual');
    confirmDiv.textContent = mensaje;
    confirmDiv.style.display = 'block';
    setTimeout(() => {
        confirmDiv.style.display = 'none';
    }, 2000);
}

// Función para cargar empleados
function loadEmployees() {
    mostrarSpinner();
    fetch('api/employees/manage_employees.php?action=get')
        .then(response => response.json())
        .then(employees => {
            ocultarSpinner();
            displayEmployees(employees);
        })
        .catch(error => {
            ocultarSpinner();
            console.error('Error:', error);
            alert('Error al cargar los empleados');
        });
}

// Función para mostrar empleados en la tabla
function displayEmployees(employees) {
    employeesTableBody.innerHTML = '';
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.username}</td>
            <td>${employee.name}</td>
            <td>${employee.role_name}</td>
            <td>
                <button onclick="editEmployee(${employee.id})">Editar</button>
                <button onclick="deleteEmployee(${employee.id})">Eliminar</button>
            </td>
        `;
        employeesTableBody.appendChild(row);
    });
}

// Función para abrir el modal
function openModal(employee = null) {
    document.getElementById('modalTitle').textContent = employee ? 'Editar Empleado' : 'Agregar Empleado';
    if (employee) {
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('employeeUsername').value = employee.username;
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeRole').value = employee.role_id;
        document.getElementById('employeePassword').required = false;
    } else {
        employeeForm.reset();
        document.getElementById('employeeId').value = '';
        document.getElementById('employeePassword').required = true;
    }
    modal.style.display = 'block';
}

// Función para cerrar el modal
function closeModal() {
    modal.style.display = 'none';
    employeeForm.reset();
}

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    modal = document.getElementById('employeeModal');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const closeBtn = document.querySelector('.close');
    employeeForm = document.getElementById('employeeForm');
    employeesTableBody = document.getElementById('employeesTableBody');

    // Cargar empleados al iniciar
    loadEmployees();

    // Event Listeners
    addEmployeeBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    employeeForm.addEventListener('submit', handleFormSubmit);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Función para manejar el envío del formulario
    function handleFormSubmit(e) {
        e.preventDefault();
        const formData = {
            username: document.getElementById('employeeUsername').value,
            name: document.getElementById('employeeName').value,
            role_id: document.getElementById('employeeRole').value
        };
        const employeeId = document.getElementById('employeeId').value;
        if (employeeId) {
            formData.id = employeeId;
        }
        const password = document.getElementById('employeePassword').value;
        if (password) {
            formData.password = password;
        }
        const action = employeeId ? 'update' : 'add';
        mostrarSpinner();
        fetch(`api/employees/manage_employees.php?action=${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            ocultarSpinner();
            if (data.success) {
                mostrarConfirmacion('Empleado guardado');
                alert(data.message);
                closeModal();
                loadEmployees();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            ocultarSpinner();
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        });
    }
});

// Funciones globales para los botones de acción
function editEmployee(id) {
    fetch(`api/employees/manage_employees.php?action=get`)
        .then(response => response.json())
        .then(employees => {
            const employee = employees.find(e => e.id === id);
            if (employee) {
                openModal(employee);
            } else {
                alert('Empleado no encontrado');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar el empleado');
        });
}

function deleteEmployee(id) {
    if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
        mostrarSpinner();
        fetch(`api/employees/manage_employees.php?action=delete&id=${id}`)
            .then(response => response.json())
            .then(data => {
                ocultarSpinner();
                if (data.success) {
                    mostrarConfirmacion('Empleado eliminado');
                    alert(data.message);
                    loadEmployees();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                ocultarSpinner();
                console.error('Error:', error);
                alert('Error al eliminar el empleado');
            });
    }
} 