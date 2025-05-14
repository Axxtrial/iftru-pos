// Objeto para mantener el conteo de productos en el carrito
const cartItems = {};

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
        <!DOCTYPE html>
        <html>
        <head>
            <title style="color: #000;">Ticket de Venta</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    width: 80mm;
                    margin: 0;
                    padding: 5mm;
                }
                .header {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .items {
                    margin: 10px 0;
                    color: #000;
                }
                .item {
                    margin: 5px 0;
                    border-top: 1px dashed #000;
                    color: #000;
                }
                .total {
                    text-align: right;
                    margin-top: 10px;
                    border-top: 1px dashed #000;
                    padding-top: 5px;
                    color: #000;
                }
                .footer {
                    text-align: center;
                    margin-top: 10px;
                    border-top: 1px dashed #000;
                    padding-top: 5px;
                    color: #000;
                }
                @media print {
                    body {
                        width: 80mm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header" style="color: #000;">
                <h2>MI TIENDA</h2>
                <p>Ticket de Venta</p>
                <p>${date.toLocaleString()}</p>
            </div>
    `;

    let subtotal = 0;
    for (const barcode in cartItems) {
        const item = cartItems[barcode];
        const price = parseFloat(item.price);
        const itemSubtotal = price * item.quantity;
        subtotal += itemSubtotal;
        
        ticketHTML += `
            <div class="item">
                <p>${item.name}</p>
                <p>${item.quantity} x $${price.toFixed(2)} = $${itemSubtotal.toFixed(2)}</p>
            </div>
        `;
    }
    
    ticketHTML += `
        <div class="total">
            <p>Total: $${subtotal.toFixed(2)}</p>
        </div>
        <div class="footer">
            <p>¡Gracias por su compra!</p>
        </div>
    </body>
    </html>
    `;

    return ticketHTML;
}

// Función para completar el pedido
function completarPedido() {
    if (Object.keys(cartItems).length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    // Actualizar el stock
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
            alert(data.error);
            return;
        }
        
        // Registrar la venta
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
        if (data.error) {
            alert(data.error);
            return;
        }
        
        // Obtener el contenedor del ticket
        const ticketContainer = document.getElementById('ticketContainer');
        ticketContainer.innerHTML = generateTicket();
        ticketContainer.style.display = 'block';
        
        // Imprimir directamente
        window.print();
        
        // Limpiar el carrito después de imprimir
        limpiarCarrito();
        
        // Ocultar el contenedor del ticket después de imprimir
        ticketContainer.style.display = 'none';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al procesar la venta');
    });
}

// Función para agregar producto al carrito
function addProductToCart(barcode) {
    const form = document.getElementById('productForm');
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        const productContainer = document.querySelector('.product-container');
        
        // Incrementar el contador para este producto
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

        // Actualizar o crear el elemento del producto
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
        
        // Actualizar el total del carrito
        calculateTotal();
        
        // Limpiar solo el contenido del textarea
        document.getElementById('text_product_name').value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al procesar la solicitud');
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


