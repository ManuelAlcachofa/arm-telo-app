/**
 * Campo de formulario controlado (input, select o textarea) con etiqueta y mensaje de error.
 * El mensaje de error solo se muestra cuando la prop `error` trae texto.
 */
export default function CampoFormulario({
  id,
  etiqueta,
  tipo = 'text',
  valor,
  onChange,
  onBlur,
  error = '',
  requerido = false,
  opciones = [],
  ayuda,
  className = '',
  ...resto
}) {
  const idError = `${id}-error`;
  const comunes = {
    id,
    name: id,
    value: valor,
    onChange,
    onBlur,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? idError : undefined,
    className: `${tipo === 'select' ? 'form-select' : 'form-control'} ${error ? 'is-invalid' : ''}`,
    ...resto,
  };

  let control;
  if (tipo === 'select') {
    control = (
      <select {...comunes}>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    );
  } else if (tipo === 'textarea') {
    control = <textarea rows={3} {...comunes} />;
  } else {
    control = <input type={tipo} {...comunes} />;
  }

  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label">
        {etiqueta}
        {requerido && <span className="text-danger"> *</span>}
      </label>
      {control}
      {ayuda && !error && <div className="form-text">{ayuda}</div>}
      {error && (
        <div id={idError} className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
