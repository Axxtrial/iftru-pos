// Función para cargar los datos de ventas por día
async function cargarVentasPorDia() {
    try {
        mostrarSpinner();
        const response = await fetch('api/analytics/manage_analytics.php?action=ventas_por_dia');
        const data = await response.json();
        ocultarSpinner();
        const ctx = document.getElementById('ventasPorDiaChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.fecha),
                datasets: [{
                    label: 'Ventas por Día',
                    data: data.map(item => item.total),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total de Ventas ($)'
                        }
                    }
                }
            }
        });
        mostrarConfirmacion('Datos de ventas por día cargados');
    } catch (error) {
        ocultarSpinner();
        mostrarConfirmacion('Error al cargar ventas por día', true);
    }
}

// Función para cargar los productos más vendidos
async function cargarProductosMasVendidos() {
    try {
        mostrarSpinner();
        const response = await fetch('api/analytics/manage_analytics.php?action=productos_mas_vendidos');
        const data = await response.json();
        ocultarSpinner();
        const ctx = document.getElementById('productosMasVendidosChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    label: 'Cantidad Vendida',
                    data: data.map(item => item.total_vendido),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Unidades Vendidas'
                        }
                    }
                }
            }
        });
        mostrarConfirmacion('Datos de productos más vendidos cargados');
    } catch (error) {
        ocultarSpinner();
        mostrarConfirmacion('Error al cargar productos más vendidos', true);
    }
}

// Función para cargar las ventas por hora
async function cargarVentasPorHora() {
    try {
        mostrarSpinner();
        const response = await fetch('api/analytics/manage_analytics.php?action=ventas_por_hora');
        const data = await response.json();
        ocultarSpinner();
        const ctx = document.getElementById('ventasPorHoraChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => `${item.hora}:00`),
                datasets: [{
                    label: 'Total de Ventas',
                    data: data.map(item => item.total_ingresos),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total de Ventas ($)'
                        }
                    }
                }
            }
        });
        mostrarConfirmacion('Datos de ventas por hora cargados');
    } catch (error) {
        ocultarSpinner();
        mostrarConfirmacion('Error al cargar ventas por hora', true);
    }
}

// Funciones para spinner y confirmación visual
function mostrarSpinner() {
    document.getElementById('spinnerGlobal').style.display = 'block';
}
function ocultarSpinner() {
    document.getElementById('spinnerGlobal').style.display = 'none';
}
function mostrarConfirmacion(mensaje, esError = false) {
    const confirmDiv = document.getElementById('confirmacionVisual');
    confirmDiv.textContent = mensaje;
    confirmDiv.style.display = 'block';
    confirmDiv.className = 'confirmacion-visual' + (esError ? ' error' : '');
    setTimeout(() => {
        confirmDiv.style.display = 'none';
    }, 2000);
}

// Cargar todas las gráficas cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    cargarVentasPorDia();
    cargarProductosMasVendidos();
    cargarVentasPorHora();
});
