// Objeto para mantener el conteo de productos en el carrito
const cartItems = {};
const LOW_STOCK_THRESHOLD = 5; // Umbral para alerta de stock bajo

// Función para mostrar notificación de stock bajo
function showLowStockNotification(productName, stockLevel) {
    let notification = document.getElementById('lowStockNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'lowStockNotification';
        notification.className = 'low-stock-notification'; // Estilos definidos en css/pos.css
        document.body.appendChild(notification);
    }

    notification.innerHTML = `<strong>¡Stock Bajo!</strong><br>Producto: ${productName}<br>Quedan solo: ${stockLevel} unidades`;
    notification.style.display = 'block';

    // Ocultar la notificación después de 5 segundos
    setTimeout(() => {
        if (notification) { // Verificar si el elemento aún existe
            notification.style.display = 'none';
        }
    }, 5000);
}

// Función para limpiar el carrito
function limpiarCarrito() {
    // Limpiar el objeto de items
    Object.keys(cartItems).forEach(key => delete cartItems[key]);
    
    // Limpiar el contenedor de productos
    const productContainer = document.querySelector('.product-container');
    productContainer.innerHTML = '';
    
    // Resetear el total
    document.getElementById('totalAmount').textContent = '0.00';
    
    // Limpiar solo el contenido del textarea sin resetear el formulario
    document.getElementById('text_product_name').value = '';
}

// Función para calcular el total del carrito
function calculateTotal() {
    let total = 0;
    for (const barcode in cartItems) {
        total += parseFloat(cartItems[barcode].price) * cartItems[barcode].quantity;
    }
    document.getElementById('totalAmount').textContent = total.toFixed(2);
    return total;
}

// Función para generar el ticket
function generateTicket() {
    const date = new Date();
    let ticketHTML = `
        <div id="ticketPrintArea" style="width: 80mm; font-family: 'Courier New', monospace; color: #000; font-size: 13px; margin: 0; padding: 0;">
            <div style="text-align: center; margin-bottom: 8px;">
                <div style="font-size: 18px; font-weight: bold;">MI TIENDA</div>
                <div>Ticket de Venta</div>
                <div>${date.toLocaleString()}</div>
            </div>
            <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>
    `;
    let subtotal = 0;
    for (const barcode in cartItems) {
        const item = cartItems[barcode];
        const price = parseFloat(item.price);
        const itemSubtotal = price * item.quantity;
        subtotal += itemSubtotal;
        ticketHTML += `
            <div style="display: flex; justify-content: space-between;">
                <span>${item.name}</span>
                <span>x${item.quantity}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span> $${price.toFixed(2)}</span>
                <span> $${itemSubtotal.toFixed(2)}</span>
            </div>
        `;
    }
    ticketHTML += `
        <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px;">
            <span>Total:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div style="text-align: center; margin-top: 12px;">¡Gracias por su compra!</div>
        </div>
    `;
    return ticketHTML;
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

// Función para completar el pedido
function completarPedido() {
    if (Object.keys(cartItems).length === 0) {
        mostrarConfirmacion('El carrito está vacío', true);
        return;
    }
    mostrarSpinner();
    fetch('api/cart/manage_cart.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            ocultarSpinner();
            mostrarConfirmacion(data.error, true);
            return Promise.reject(data.error);
        }
        return fetch('api/analytics/manage_analytics.php?action=registrar_venta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cartItems,
                total: calculateTotal()
            })
        });
    })
    .then(response => response.json())
    .then(data => {
        ocultarSpinner();
        if (data.error) {
            mostrarConfirmacion(data.error, true);
            return Promise.reject(data.error);
        }
        mostrarConfirmacion('¡Venta completada!');
        // Preguntar si se desea imprimir con QZ Tray o impresión normal
        const ticketContainer = document.getElementById('ticketContainer');
        ticketContainer.innerHTML = generateTicket();
        ticketContainer.style.display = 'block';
        if (window.qz && confirm('¿Imprimir ticket directamente en la impresora térmica? (Requiere QZ Tray)')) {
            imprimirConQZTray();
        } else if (confirm('¿Desea imprimir el ticket?')) {
            window.print();
        }
        ticketContainer.style.display = 'none';
        limpiarCarrito();
    })
    .catch(error => {
        ocultarSpinner();
        if (typeof error !== 'string' || (!error.startsWith("Stock insuficiente") && !error.includes("Producto no encontrado"))) {
            mostrarConfirmacion('Error al procesar la venta', true);
        }
    });
}

// Función para agregar producto al carrito
function addProductToCart(barcode) {
    if (!barcode) {
        mostrarConfirmacion('El campo código es obligatorio', true);
        return;
    }
    const form = document.getElementById('productForm');
    const formData = new FormData(form);
    mostrarSpinner();
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        ocultarSpinner();
        if (data.error) {
            mostrarConfirmacion(data.error, true);
            return;
        }
        if (data.stock <= LOW_STOCK_THRESHOLD) {
            let effectiveStockForNotification = data.stock;
            showLowStockNotification(data.name, effectiveStockForNotification);
        }
        const productContainer = document.querySelector('.product-container');
        if (!cartItems[barcode]) {
            cartItems[barcode] = {
                barcode: barcode,
                name: data.name,
                price: parseFloat(data.price),
                quantity: 1
            };
        } else {
            cartItems[barcode].quantity++;
        }
        let productItem = document.querySelector(`[data-barcode="${barcode}"]`);
        if (!productItem) {
            productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.setAttribute('data-barcode', barcode);
            productContainer.appendChild(productItem);
        }
        const price = parseFloat(cartItems[barcode].price);
        const subtotal = price * cartItems[barcode].quantity;
        productItem.innerHTML = `
            <p>Producto: ${data.name}</p>
            <p>Precio C/U: $${price.toFixed(2)}</p>
            <p>Cantidad en carrito: ${cartItems[barcode].quantity}</p>
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
        `;
        calculateTotal();
        mostrarConfirmacion('Producto agregado');
        document.getElementById('text_product_name').value = '';
    })
    .catch(error => {
        ocultarSpinner();
        mostrarConfirmacion('Error al procesar la solicitud', true);
    });
}

// Evento para detectar cuando se pega un código
document.getElementById('text_product_name').addEventListener('paste', function(event) {
    // Pequeño retraso para asegurar que el valor se haya pegado
    setTimeout(() => {
        const barcode = this.value.trim();
        if (barcode) {
            addProductToCart(barcode);
        }
    }, 50);
});

// Evento para cuando se presiona Enter (solo para escritura manual)
document.getElementById('text_product_name').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const barcode = this.value.trim();
        if (barcode) {
            addProductToCart(barcode);
        }
    }
});

// Agrego función para imprimir con QZ Tray
function imprimirConQZTray() {
    if (!window.qz) {
        mostrarConfirmacion('QZ Tray no está disponible', true);
        return;
    }
    const ticketContainer = document.getElementById('ticketContainer');
    const html = ticketContainer.innerHTML;
    // Convertir HTML a texto plano (simple)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    let text = tempDiv.innerText;
    // Configuración básica para QZ Tray
    qz.websocket.connect().then(() => {
        return qz.printers.find(); // Usar impresora predeterminada
    }).then(printer => {
        const config = qz.configs.create(printer, { encoding: 'UTF-8' });
        return qz.print(config, [{ type: 'raw', format: 'plain', data: text }]);
    }).then(() => {
        mostrarConfirmacion('Ticket enviado a la impresora');
        qz.websocket.disconnect();
    }).catch(err => {
        mostrarConfirmacion('Error al imprimir con QZ Tray: ' + err, true);
        qz.websocket.disconnect();
    });
}


