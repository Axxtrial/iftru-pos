<?php
require_once '../../includes/db.php';

header('Content-Type: application/json');

// Función para obtener todos los productos
function getProducts() {
    global $conn;
    $sql = "SELECT * FROM products ORDER BY name ASC";
    $result = $conn->query($sql);
    $products = array();
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
    }
    return $products;
}

// Función para obtener un producto específico
function getProduct($id) {
    global $conn;
    $id = intval($id);
    $sql = "SELECT * FROM products WHERE id = $id";
    $result = $conn->query($sql);
    
    if (!$result) {
        error_log("Error en la consulta SQL: " . $conn->error);
        return null;
    }
    
    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    
    error_log("No se encontró el producto con ID: " . $id);
    return null;
}

// Función para agregar un producto
function addProduct($data) {
    global $conn;
    $name = $conn->real_escape_string($data['name']);
    $barcode = $conn->real_escape_string($data['barcode']);
    $price = floatval($data['price']);
    $stock = intval($data['stock']);
    
    $sql = "INSERT INTO products (name, barcode, price, stock) VALUES ('$name', '$barcode', $price, $stock)";
    
    if ($conn->query($sql)) {
        return array('success' => true, 'message' => 'Producto agregado exitosamente');
    }
    return array('success' => false, 'message' => 'Error al agregar el producto: ' . $conn->error);
}

// Función para actualizar un producto
function updateProduct($data) {
    global $conn;
    $id = intval($data['id']);
    $name = $conn->real_escape_string($data['name']);
    $barcode = $conn->real_escape_string($data['barcode']);
    $price = floatval($data['price']);
    $stock = intval($data['stock']);
    
    $sql = "UPDATE products SET name='$name', barcode='$barcode', price=$price, stock=$stock WHERE id=$id";
    
    if ($conn->query($sql)) {
        return array('success' => true, 'message' => 'Producto actualizado exitosamente');
    }
    return array('success' => false, 'message' => 'Error al actualizar el producto: ' . $conn->error);
}

// Función para eliminar un producto
function deleteProduct($id) {
    global $conn;
    $id = intval($id);
    
    // Primero verificar si el producto existe
    $check_sql = "SELECT id FROM products WHERE id = $id";
    $check_result = $conn->query($check_sql);
    
    if (!$check_result) {
        error_log("Error al verificar el producto: " . $conn->error);
        return array('success' => false, 'message' => 'Error al verificar el producto: ' . $conn->error);
    }
    
    if ($check_result->num_rows === 0) {
        return array('success' => false, 'message' => 'El producto no existe');
    }
    
    // Si el producto existe, proceder con la eliminación
    $sql = "DELETE FROM products WHERE id = $id";
    if ($conn->query($sql)) {
        if ($conn->affected_rows > 0) {
            return array('success' => true, 'message' => 'Producto eliminado exitosamente');
        } else {
            return array('success' => false, 'message' => 'No se pudo eliminar el producto');
        }
    }
    
    error_log("Error al eliminar el producto: " . $conn->error);
    return array('success' => false, 'message' => 'Error al eliminar el producto: ' . $conn->error);
}

// Manejar las peticiones
$action = $_GET['action'] ?? '';

switch($action) {
    case 'get':
        if (isset($_GET['id'])) {
            $product = getProduct($_GET['id']);
            if ($product) {
                echo json_encode($product);
            } else {
                echo json_encode(array('error' => 'Producto no encontrado'));
            }
        } else {
            echo json_encode(getProducts());
        }
        break;
    case 'add':
        echo json_encode(addProduct($_POST));
        break;
    case 'update':
        echo json_encode(updateProduct($_POST));
        break;
    case 'delete':
        if (!isset($_GET['id'])) {
            echo json_encode(array('success' => false, 'message' => 'ID de producto no proporcionado'));
            break;
        }
        echo json_encode(deleteProduct($_GET['id']));
        break;
    default:
        echo json_encode(array('error' => 'Acción no válida'));
}
?>