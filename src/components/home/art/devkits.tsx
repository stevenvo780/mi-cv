import type { CSSProperties } from 'react';

/* Los tres kits de Érgon con el glifo de su placa: CRM (contactos), Hours Tracker (reloj), VPN Manager (escudo con
   cerradura). */
const KITS = [
  { k: 'crm', d: 'M9 11.4a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2M3.5 19c0-3.2 2.4-5.4 5.5-5.4s5.5 2.2 5.5 5.4M15.4 5.4a3 3 0 0 1 0 5.8M17.4 14c1.9.6 3.1 2.5 3.1 5' },
  { k: 'hrs', d: 'M12 3.8a8.2 8.2 0 1 0 0 16.4 8.2 8.2 0 0 0 0-16.4M12 7.6V12l3 1.9' },
  { k: 'vpn', d: 'M12 3.2 18.8 6v5.3c0 4.2-2.9 7.5-6.8 9.3-3.9-1.8-6.8-5.1-6.8-9.3V6ZM10.3 10.8a1.7 1.7 0 1 1 3.4 0 1.7 1.7 0 0 1-3.4 0M12 12.5v2.8' },
];

/* Un prisma: tapa (pt) y las dos caras que dan al frente (fy, fx). */
const Caja = ({ c }: { c: string }) => (
  <i className={c}>
    <i className="pt" />
    <i className="fy" />
    <i className="fx" />
  </i>
);

/** Érgon: tres kits en isométrico, construidos al 80 %; la pieza a medida (el 20 %) espera encima y encaja al pasar. */
export default function Art() {
  return (
    <div className="art art-devkits" aria-hidden="true">
      <div className="ek">
        <i className="eg" />
        {KITS.map((k, i) => (
          <div key={k.k} className="ec" style={{ '--i': i } as CSSProperties}>
            <i className="fy k">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6fd3c4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={k.d} />
              </svg>
            </i>
            <i className="fx k" />
            <i className="pt et" />
            <Caja c="eo" />
            <i className="es" />
            <i className="ef" />
            <Caja c="ep" />
          </div>
        ))}
      </div>
      <i className="ed">
        <span>20%</span>
        <span>80%</span>
      </i>
    </div>
  );
}
