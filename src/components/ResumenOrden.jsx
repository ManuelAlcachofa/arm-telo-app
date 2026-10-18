import { formatoCLP } from '../utils/formato.js';
import { OPCIONES_ENTREGA } from '../services/compras.js';
import TablaItems from './TablaItems.jsx';

/** Datos del cliente, entrega, productos y total de una orden ya creada (vista de solo lectura). */
export default function ResumenOrden({ orden, rotuloTotal = 'Total' }) {
  const { cliente, direccion } = orden;
  const entrega = OPCIONES_ENTREGA.find((o) => o.id === orden.entregaId)?.etiqueta ?? '';
  const filas = orden.items.map((i) => ({ id: i.productoId, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad }));

  return (
    <div className="resumen-orden">
      <h2 className="h6 mt-3">Información del cliente</h2>
      <dl className="row mb-2">
        <dt className="col-sm-3">Nombre</dt>
        <dd className="col-sm-9">
          {cliente.nombre} {cliente.apellidos}
        </dd>
        <dt className="col-sm-3">Correo</dt>
        <dd className="col-sm-9">{cliente.correo}</dd>
        <dt className="col-sm-3">Entrega</dt>
        <dd className="col-sm-9">{entrega}</dd>
        {orden.entregaId === 'despacho' && (
          <>
            <dt className="col-sm-3">Dirección</dt>
            <dd className="col-sm-9">
              {direccion.calle}
              {direccion.departamento && `, ${direccion.departamento}`}, {direccion.comuna}, {direccion.region}
              {direccion.indicaciones && <span className="d-block text-secondary">{direccion.indicaciones}</span>}
            </dd>
          </>
        )}
      </dl>
      <TablaItems filas={filas} />
      <dl className="row justify-content-end text-end mb-0">
        <dt className="col-6 col-md-3">Subtotal</dt>
        <dd className="col-6 col-md-2">{formatoCLP(orden.subtotal)}</dd>
        <dt className="col-6 col-md-3">Envío</dt>
        <dd className="col-6 col-md-2">{formatoCLP(orden.envio)}</dd>
        <dt className="col-6 col-md-3 fs-5">{rotuloTotal}</dt>
        <dd className="col-6 col-md-2 fs-5 text-ember">{formatoCLP(orden.total)}</dd>
      </dl>
    </div>
  );
}
