# Armátelo

Se hace un revamp completo a la idea principal y se cambia solo para que sea una tienda de componentes. Ademas que se implementa todo lo relacionado a la Prueba Parcial 2 (:


Una tienda online de componentes de PC hecha con React, Bootstrap y React Router.

Se puede navegar la tienda, agregar productos al carrito, comprar (con un pago simulado) y, si entras como administrador, manejar productos, categorías, usuarios y órdenes.

## Cómo abrirlo

**Lo más fácil:** abre la carpeta `dist` y haz doble clic en `index.html`. No necesitas instalar nada.

**Para editar el código:**

1. Instala [Node.js](https://nodejs.org) (una sola vez).
2. Abre la carpeta del proyecto en VS Code y, en la terminal, escribe:
   ```
   npm install
   npm run dev
   ```
3. Entra a la dirección que aparece (normalmente http://localhost:5173).

Si estás en Windows y PowerShell te bloquea `npm`, ejecuta esto una vez y vuelve a intentar:
```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Otros comandos útiles:

- `npm run build` vuelve a crear la carpeta `dist` con la versión final.
- `npm test` corre las pruebas (necesita Google Chrome instalado).

## Entrar como administrador

- Correo: `admin@armatelo.cl`
- Contraseña: `Admin1234`

Inicia sesión, haz clic en tu nombre arriba a la derecha y elige **Panel de administración**.

## Agregar tus productos

La tienda parte sin productos. Para sumarlos:

1. Entra al panel de administración.
2. Ve a **Productos > Nuevo producto** y llena el formulario.

Si dejas el stock vacío, el producto se muestra como "Stock por definir" y no se puede comprar hasta que le pongas uno.

Para las imágenes pega la URL de la foto. Se ven mejor las cuadradas, de 600×600 px o más.

## Cosas que conviene saber

- No hay servidor: todo se guarda en el navegador (`localStorage`), incluidas las contraseñas. Sirve para el ramo, no para una tienda real.
- El pago es de mentira: en el checkout tú eliges si queda aprobado o rechazado.
- Si quieres empezar de cero, abre la consola del navegador (F12), escribe `localStorage.clear()` y recarga la página.

## Dónde está cada cosa

```
src/
  components/   piezas reutilizables (botones, tarjetas, barra de navegación…)
  pages/        una página por vista; pages/admin/ es el panel de administración
  context/      el carrito y la sesión del usuario
  data/         la "base de datos" (db.js) y los datos iniciales (seed.js)
  services/     la lógica de compras y del pago simulado
  utils/        validaciones, formato de precios y reglas de productos
```
