<?php
require_once '../../includes/db.php';

header('Content-Type: application/json');

// Función para registrar una venta
function registrarVenta($conn, $items, $total) {
    try {
        $conn->begin_transaction();
        
        // Insertar la venta
        $sql = "INSERT INTO sales (total_amount, sale_date) VALUES (?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("d", $total);
        $stmt->execute();
        $sale_id = $conn->insert_id;
        
        // Insertar los detalles de la venta
        $sql = "INSERT INTO sale_items (sale_id, product_barcode, quantity, price) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        foreach ($items as $barcode => $item) {
            $stmt->bind_param("isid", $sale_id, $barcode, $item['quantity'], $item['price']);
            $stmt->execute();
        }
        
        $conn->commit();
        return ['success' => true, 'sale_id' => $sale_id];
    } catch(Exception $e) {
        $conn->rollback();
        return ['error' => $e->getMessage()];
    }
}

// Función para obtener ventas por día
function getVentasPorDia($conn, $dias = 7) {
    $sql = "SELECT DATE(sale_date) as fecha, SUM(total_amount) as total 
            FROM sales 
            WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(sale_date)
            ORDER BY fecha";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $dias);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $ventas = [];
    while($row = $result->fetch_assoc()) {
        $ventas[] = $row;
    }
    
    return $ventas;
}

// Función para obtener productos más vendidos
function getProductosMasVendidos($conn, $limite = 5) {
    $sql = "SELECT p.name, SUM(si.quantity) as total_vendido, SUM(si.quantity * si.price) as total_ingresos
            FROM sale_items si
            JOIN products p ON p.barcode = si.product_barcode
            GROUP BY p.barcode, p.name
            ORDER BY total_vendido DESC
            LIMIT ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $limite);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $productos = [];
    while($row = $result->fetch_assoc()) {
        $productos[] = $row;
    }
    
    return $productos;
}

// Función para obtener ventas por hora
function getVentasPorHora($conn) {
    $sql = "SELECT HOUR(sale_date) as hora, COUNT(*) as total_ventas, SUM(total_amount) as total_ingresos
            FROM sales
            WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY HOUR(sale_date)
            ORDER BY hora";
    
    $result = $conn->query($sql);
    $ventas = [];
    while($row = $result->fetch_assoc()) {
        $ventas[] = $row;
    }
    
    return $ventas;
}

// Manejar las peticiones
$action = $_GET['action'] ?? '';

switch($action) {
    case 'registrar_venta':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode(registrarVenta($conn, $data['items'], $data['total']));
        break;
        
    case 'ventas_por_dia':
        $dias = isset($_GET['dias']) ? intval($_GET['dias']) : 7;
        echo json_encode(getVentasPorDia($conn, $dias));
        break;
        
    case 'productos_mas_vendidos':
        $limite = isset($_GET['limite']) ? intval($_GET['limite']) : 5;
        echo json_encode(getProductosMasVendidos($conn, $limite));
        break;
        
    case 'ventas_por_hora':
        echo json_encode(getVentasPorHora($conn));
        break;
        
    default:
        echo json_encode(['error' => 'Acción no válida']);
}
?>