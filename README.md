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
- QZ Tray 

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

## Tareas Pendientes para Completar el POS

1. **Autenticación y Seguridad**
   - Implementar el sistema de login y manejo de sesiones para proteger el acceso al POS.
   - Añadir control de acceso por roles (por ejemplo, solo admin puede gestionar empleados o inventario).

2. **Validaciones y Manejo de Errores**
   - Mejorar la validación de formularios tanto en frontend como en backend.
   - Asegurar mensajes de error claros y manejo de errores en todas las operaciones.

3. **Persistencia del Carrito**
   - Guardar el carrito en localStorage o en la base de datos para evitar que se pierda al recargar la página.

4. **Impresión de Ticket** (en camino QZ Tray)
   - Mejorar la impresión del ticket para soportar impresoras térmicas o exportar a PDF.

5. **Documentación de la API**
   - Documentar los endpoints de la API: parámetros, respuestas y ejemplos de uso.

7. **Mejoras en la Experiencia de Usuario** (Listo), FALTA CSS
   - Agregar indicadores de carga (spinners) y confirmaciones visuales.

8. **Respaldo y Recuperación**
   - Incluir instrucciones para respaldar y restaurar la base de datos.

## Mejoras Sugeridas

- Optimizar el diseño responsivo para dispositivos móviles.
- Permitir descuentos y promociones en el POS.
- Agregar reportes adicionales (por producto, por empleado, etc).
- Soporte para múltiples cajas o sucursales.
