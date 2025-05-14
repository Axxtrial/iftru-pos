<?php
$host = "localhost";
$usuario = "root";
$contrasena = "";
$base_datos = "pos_system";

// Crear conexión
$conn = new mysqli($host, $usuario, $contrasena, $base_datos);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>