// Variables globales
let modal;
let productForm;
let inventoryTableBody;
const LOW_STOCK_THRESHOLD = 5; // Umbral para alerta de stock bajo, igual que en PHP

// Función para cargar y mostrar alerta de stock bajo
function loadAndDisplayLowStockAlert() {
    fetch('api/inventory/manage_inventory.php?action=getLowStock')
        .then(response => response.json())
        .then(lowStockProducts => {
            const alertContainer = document.getElementById('lowStockAlertContainer');
            if (lowStockProducts && lowStockProducts.length > 0) {
                let productNames = lowStockProducts.map(p => `${p.name} (Stock: ${p.stock})`).join(', ');
                alertContainer.innerHTML = `<strong>¡Alerta de Stock Bajo!</strong> Los siguientes productos tienen 5 o menos unidades: ${productNames}.`;
                alertContainer.style.display = 'block';
            } else {
                alertContainer.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error cargando alerta de stock bajo:', error);
            // Opcional: mostrar un error en el contenedor de alerta si falla la carga
            // const alertContainer = document.getElementById('lowStockAlertContainer');
            // alertContainer.innerHTML = 'Error al cargar la información de stock bajo.';
            // alertContainer.style.display = 'block';
            // alertContainer.style.backgroundColor = 'red'; // O un color de error
            // alertContainer.style.color = 'white';
        });
}

// Función para cargar productos
function loadProducts() {
    fetch('api/inventory/manage_inventory.php?action=get')
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar los productos');
        });
}

// Función para mostrar productos en la tabla
function displayProducts(products) {
    inventoryTableBody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        // Aplicar clase si el stock es bajo
        if (product.stock <= LOW_STOCK_THRESHOLD) {
            row.classList.add('product-low-stock');
        }
        row.innerHTML = `
            <td>${product.barcode}</td>
            <td>${product.name}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button onclick="editProduct(${product.id})">Editar</button>
                <button onclick="deleteProduct(${product.id})">Eliminar</button>
            </td>
        `;
        inventoryTableBody.appendChild(row);
    });
}

// Función para abrir el modal
function openModal(product = null) {
    document.getElementById('modalTitle').textContent = product ? 'Editar Producto' : 'Agregar Producto';
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productBarcode').value = product.barcode;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
    } else {
        productForm.reset();
        document.getElementById('productId').value = '';
    }
    modal.style.display = 'block';
}

// Función para cerrar el modal
function closeModal() {
    modal.style.display = 'none';
    productForm.reset();
}

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    modal = document.getElementById('productModal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeBtn = document.querySelector('.close');
    productForm = document.getElementById('productForm');
    const searchInput = document.getElementById('searchInput');
    inventoryTableBody = document.getElementById('inventoryTableBody');

    // Cargar productos al iniciar
    loadProducts();
    loadAndDisplayLowStockAlert(); // Cargar y mostrar alerta de stock bajo

    // Event Listeners
    addProductBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    searchInput.addEventListener('input', handleSearch);
    productForm.addEventListener('submit', handleFormSubmit);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Función para manejar la búsqueda
    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = inventoryTableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    // Función para manejar el envío del formulario
    function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        const productId = document.getElementById('productId').value;
        
        formData.append('name', document.getElementById('productName').value);
        formData.append('barcode', document.getElementById('productBarcode').value);
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('stock', document.getElementById('productStock').value);

        const action = productId ? 'update' : 'add';
        if (productId) {
            formData.append('id', productId);
        }

        fetch(`api/inventory/manage_inventory.php?action=${action}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                closeModal();
                loadProducts();
                loadAndDisplayLowStockAlert(); // Recargar alerta después de modificar un producto
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        });
    }
});

// Funciones globales para los botones de acción
function editProduct(id) {
    console.log('Intentando editar producto con ID:', id);
    fetch(`api/inventory/manage_inventory.php?action=get&id=${id}`)
        .then(response => {
            console.log('Respuesta del servidor:', response);
            return response.json();
        })
        .then(product => {
            console.log('Datos del producto:', product);
            if (product.error) {
                throw new Error(product.error);
            }
            openModal(product);
        })
        .catch(error => {
            console.error('Error detallado:', error);
            alert('Error al cargar el producto: ' + error.message);
        });
}

function deleteProduct(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        console.log('Intentando eliminar producto con ID:', id);
        fetch(`api/inventory/manage_inventory.php?action=delete&id=${id}`)
            .then(response => {
                console.log('Respuesta del servidor:', response);
                return response.json();
            })
            .then(data => {
                console.log('Datos de respuesta:', data);
                if (data.success) {
                    alert(data.message);
                    loadProducts();
                    loadAndDisplayLowStockAlert(); // Recargar alerta después de eliminar un producto
                } else {
                    throw new Error(data.message || 'Error al eliminar el producto');
                }
            })
            .catch(error => {
                console.error('Error detallado:', error);
                alert('Error al eliminar el producto: ' + error.message);
            });
    }
}
