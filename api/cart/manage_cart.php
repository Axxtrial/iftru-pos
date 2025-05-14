<?php
require_once '../../includes/db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener el código del producto del formulario
    $codigo_producto = $_POST['product_name'];
    
    // Ejecutar la función y obtener el resultado
    $resultado = obtenerProducto($conn, $codigo_producto);
    
    // Devolver el resultado como respuesta JSON
    header('Content-Type: application/json');
    echo json_encode($resultado);
    exit;
}

// Nueva función para actualizar el stock
function actualizarStock($conn, $items) {
    try {
        $conn->begin_transaction();
        
        foreach ($items as $barcode => $item) {
            $sql = "UPDATE products SET stock = stock - ? WHERE barcode = ? AND stock >= ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("isi", $item['quantity'], $barcode, $item['quantity']);
            $stmt->execute();
            
            if ($stmt->affected_rows === 0) {
                throw new Exception("Stock insuficiente para el producto con código: " . $barcode);
            }
        }
        
        $conn->commit();
        return ['success' => true];
    } catch(Exception $e) {
        $conn->rollback();
        return ['error' => $e->getMessage()];
    }
}

function obtenerProducto($conn, $codigo) {
    try {
        // Preparar la consulta SQL
        $sql = "SELECT name, price, stock FROM products WHERE barcode = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $codigo);
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Obtener los resultados
        $producto = $result->fetch_assoc();
        
        if ($producto) {
            return [
                'name' => $producto['name'],
                'price' => $producto['price'],
                'stock' => $producto['stock']
            ];
        } else {
            return [
                'error' => 'Producto no encontrado'
            ];
        }
    } catch(Exception $e) {
        return [
            'error' => 'Error en la consulta: ' . $e->getMessage()
        ];
    }
}

// Endpoint para actualizar el stock
if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    $data = json_decode(file_get_contents('php://input'), true);
    header('Content-Type: application/json');
    echo json_encode(actualizarStock($conn, $data));
    exit;
}
?>