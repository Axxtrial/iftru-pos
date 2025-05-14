// Función para cargar los datos de ventas por día
async function cargarVentasPorDia() {
    try {
        const response = await fetch('api/analytics/manage_analytics.php?action=ventas_por_dia');
        const data = await response.json();
        
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
    } catch (error) {
        console.error('Error al cargar ventas por día:', error);
    }
}

// Función para cargar los productos más vendidos
async function cargarProductosMasVendidos() {
    try {
        const response = await fetch('api/analytics/manage_analytics.php?action=productos_mas_vendidos');
        const data = await response.json();
        
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
    } catch (error) {
        console.error('Error al cargar productos más vendidos:', error);
    }
}

// Función para cargar las ventas por hora
async function cargarVentasPorHora() {
    try {
        const response = await fetch('api/analytics/manage_analytics.php?action=ventas_por_hora');
        const data = await response.json();
        
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
    } catch (error) {
        console.error('Error al cargar ventas por hora:', error);
    }
}

// Cargar todas las gráficas cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    cargarVentasPorDia();
    cargarProductosMasVendidos();
    cargarVentasPorHora();
});
