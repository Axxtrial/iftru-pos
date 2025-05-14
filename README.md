# Sistema de Punto de Venta (POS)

## Características

- Escaneo de productos mediante código de barras
- Gestión de inventario en tiempo real
- Generación de tickets de venta
- Registro de ventas para análisis

## Requisitos del Sistema

- PHP 7.4 o superior
- MySQL 5.7 o superior
- Servidor web (Apache/Nginx)
- Navegador web moderno

## Instalación

1. Clonar el repositorio en el directorio de tu servidor web:
```bash
git clone https://github.com/Axxtrial/iftru-pos
```

2. Importar la base de datos:
```bash
mysql -u [usuario] -p [nombre_base_datos] < database/schema.sql
```

3. Configurar la conexión a la base de datos:
   - Editar el archivo `includes/db.php`
   - Actualizar las credenciales de la base de datos

4. Asegurarse que el servidor web tenga permisos de escritura en:
   - Directorio de logs
   - Directorio de tickets (si se usa)

## Estructura del Proyecto

```
├── api/                    # Endpoints de la API
│   ├── cart/              # Gestión del carrito
│   ├── inventory/         # Gestión de inventario
│   └── analytics/         # Análisis de ventas
├── css/                   # Estilos CSS
├── js/                    # Scripts JavaScript
├── includes/              # Archivos de configuración
└── database/             # Scripts de base de datos
```

## Uso

1. Acceder al sistema a través del navegador:
```
http://localhost/[directorio_del_proyecto]
```
si usas xampp:
```
http://localhost
```
#
