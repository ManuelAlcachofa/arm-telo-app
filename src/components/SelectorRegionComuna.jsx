import { REGIONES, comunasDeRegion } from '../data/chile.js';
import CampoFormulario from './CampoFormulario.jsx';

/** Par de listas dependientes: al elegir una región se cargan solo sus comunas. */
export default function SelectorRegionComuna({
  region,
  comuna,
  onCambiarRegion,
  onCambiarComuna,
  errorRegion = '',
  errorComuna = '',
  requerido = false,
}) {
  const comunas = comunasDeRegion(region);
  return (
    <div className="row">
      <div className="col-md-6">
        <CampoFormulario
          id="region"
          tipo="select"
          etiqueta="Región"
          requerido={requerido}
          valor={region}
          error={errorRegion}
          onChange={(e) => onCambiarRegion(e.target.value)}
          opciones={[{ valor: '', etiqueta: 'Selecciona una región' }, ...REGIONES.map((r) => ({ valor: r.nombre, etiqueta: r.nombre }))]}
        />
      </div>
      <div className="col-md-6">
        <CampoFormulario
          id="comuna"
          tipo="select"
          etiqueta="Comuna"
          requerido={requerido}
          valor={comuna}
          error={errorComuna}
          disabled={!region}
          onChange={(e) => onCambiarComuna(e.target.value)}
          opciones={[{ valor: '', etiqueta: 'Selecciona una comuna' }, ...comunas.map((c) => ({ valor: c, etiqueta: c }))]}
        />
      </div>
    </div>
  );
}
