# Armátelo

Se hace un revamp completo a la idea principal y se cambia solo para que sea una tienda de componentes. Ademas que se implementa todo lo relacionado a la Prueba Parcial 2 (:


Una tienda online de componentes de PC hecha con React, Bootstrap y React Router.

Se puede navegar la tienda, agregar productos al carrito, comprar (con un pago simulado) y, si entras como administrador, manejar productos, categorías, usuarios y órdenes.

## Cómo abrirlo

La tienda obtiene sus datos del **backend** (microservicios Spring Boot con MySQL), así que primero hay que levantarlo.

1. **Backend:** con Docker Desktop abierto, en la carpeta del backend ejecuta:
   ```
   docker compose up -d --build
   ```
   Queda disponible en `http://localhost:9090/api/v1` (API Gateway). Más detalles en el README del backend.
2. **Frontend:** instala [Node.js](https://nodejs.org) (una sola vez) y, en la carpeta de este proyecto, ejecuta:
   ```
   npm install
   npm run dev
   ```
3. Entra a http://localhost:5173.

Si el backend no está levantado, la tienda muestra el mensaje *"No se pudo conectar con el servidor"* con un botón para reintentar.

Para probar la versión compilada usa `npm run build` y luego `npm run preview` (http://localhost:4173).
Abrir `dist/index.html` con doble clic ya no funciona, porque el navegador bloquea las llamadas al backend desde `file://` (CORS).

Si estás en Windows y PowerShell te bloquea `npm`, ejecuta esto una vez y vuelve a intentar:
```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Otros comandos útiles:

- `npm run build` vuelve a crear la carpeta `dist` con la versión final.
- `npm test` corre las pruebas con Karma (necesita Google Chrome instalado).
- `npm run test:vitest` corre las mismas pruebas con Vitest.

- `npm run test:integracion` prueba el frontend **contra el backend real** (debe estar levantado): catálogo, login, permisos 401/403, CRUD de productos, checkout de invitado y de cliente, pago rechazado y aprobado, descuento de stock, contacto y reportes. Crea datos de prueba en la base.

Las pruebas de `npm test` y `npm run test:vitest` no necesitan el backend: usan un backend falso en memoria (`src/test/servidorFalso.js`) con las mismas rutas y reglas.

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@armatelo.cl` | `Admin1234` |
| Cliente | `cliente@armatelo.cl` | `Cliente1234` |

Inicia sesión como administrador, haz clic en tu nombre arriba a la derecha y elige **Panel de administración**.

## Agregar tus productos

El backend trae 9 productos de ejemplo. Para sumar más:

1. Entra al panel de administración.
2. Ve a **Productos > Nuevo producto** y llena el formulario.

Si dejas el stock vacío, el producto se muestra como "Stock por definir" y no se puede comprar hasta que le pongas uno.

Para las imágenes pega la URL de la foto. Se ven mejor las cuadradas, de 600×600 px o más.

## Cosas que conviene saber

- Los datos (productos, categorías, usuarios, órdenes y mensajes) se guardan en **MySQL** a través del backend. Las contraseñas se guardan cifradas (BCrypt).
- La sesión usa un **token JWT**: al iniciar sesión se guarda en el navegador (`localStorage`, clave `armatelo:sesion`) y se envía en cada petición. Si vence, la tienda cierra la sesión.
- El carrito sigue guardándose en el navegador hasta que se compra.
- El pago es de mentira: en el checkout tú eliges si queda aprobado o rechazado. El backend vuelve a calcular los totales, valida el stock y lo descuenta al aprobar.
- La URL del backend está en `src/services/api.js` (`http://localhost:9090/api/v1`).

## Dónde está cada cosa

```
src/
  components/   piezas reutilizables (botones, tarjetas, barra de navegación…)
  pages/        una página por vista; pages/admin/ es el panel de administración
  context/      el carrito y la sesión del usuario (login con JWT)
  data/         db.js: caché de datos conectada al backend · adaptadores.js: formato API ↔ frontend
  services/     api.js: cliente HTTP (axios) · compras.js: órdenes y pago
  utils/        validaciones, formato de precios y reglas de productos
  test/         ayudas de pruebas y backend falso en memoria
```
