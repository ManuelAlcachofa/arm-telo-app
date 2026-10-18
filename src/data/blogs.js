// Artículos del blog (contenido estático).
export const BLOGS = [
  {
    id: 1,
    titulo: 'Cómo elegir una fuente de poder sin equivocarte',
    resumen: 'La fuente es la pieza que más se subestima. Te contamos qué mirar antes de comprarla.',
    fecha: '2026-09-12',
    autor: 'Equipo Armatelo',
    icono: 'bi-lightning-charge',
    contenido: [
      'Cuando se arma o se mejora un computador, casi toda la atención se la llevan el procesador y la tarjeta de video. La fuente de poder queda para el final, pero es la encargada de entregar energía estable a todo lo demás. Una fuente mala puede provocar reinicios, apagones e incluso dañar otros componentes.',
      'Lo primero es calcular el consumo. Suma la potencia de tu procesador y de tu tarjeta de video, agrega un margen para el resto de los componentes y deja un 20 % o 30 % de holgura. Así la fuente no trabaja al límite y dura más. Los fabricantes de tarjetas de video indican la potencia mínima recomendada en su ficha técnica.',
      'Lo segundo es la calidad. La certificación 80 Plus (Bronze, Gold, Platinum) indica la eficiencia, es decir, cuánta energía se pierde en forma de calor. Una fuente Gold cuesta algo más, pero consume menos y suele traer mejores componentes internos. También revisa que tenga los conectores que necesitas, en especial los de alimentación de la tarjeta de video.',
    ],
  },
  {
    id: 2,
    titulo: 'SSD NVMe o SATA: ¿cuál te conviene?',
    resumen: 'Ambos son mucho más rápidos que un disco duro, pero no son lo mismo. Revisa las diferencias.',
    fecha: '2026-09-26',
    autor: 'Equipo Armatelo',
    icono: 'bi-device-ssd',
    contenido: [
      'Un SSD SATA llega a velocidades de lectura cercanas a los 550 MB/s, que ya es varias veces más rápido que un disco duro tradicional. Un SSD NVMe se conecta directo al bus PCIe de la placa madre y, según la generación, puede superar los 3.500 MB/s (PCIe 3.0) o los 7.000 MB/s (PCIe 4.0).',
      'En el uso diario, como navegar, trabajar con documentos o jugar, la diferencia se nota menos de lo que sugieren los números, porque el salto grande ocurre al pasar de disco duro a SSD. Donde el NVMe sí marca diferencia es al mover archivos pesados, editar video o trabajar con proyectos grandes.',
      'Antes de comprar, revisa que tu placa madre tenga ranura M.2 compatible con NVMe. Si solo tiene puertos SATA, un SSD SATA es una excelente opción y suele ser más económico. Si tienes la ranura, un NVMe es una buena inversión para tener un equipo más rápido por más tiempo.',
    ],
  },
];
