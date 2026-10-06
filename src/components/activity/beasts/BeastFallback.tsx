'use client';

import { useId, type CSSProperties } from 'react';
import type { BeastKind } from '@/activity/projects/model';

const COLORS: Record<BeastKind, string> = { hydra: '#70d8c3', sentinel: '#e5bd78', moth: '#bca0e4', nautilus: '#e5ab87', golem: '#d89564', sprout: '#a7cf87' };

/** Six original anatomical silhouettes. Their shapes are illustrative, never a fabricated activity record. */
export default function BeastFallback({ kind, identity = '', energy = 0, className = '' }: { kind: BeastKind; identity?: string; energy?: number; className?: string }) {
  const unique = useId().replace(/:/g, '');
  const material = `${unique}-material`;
  const light = `${unique}-light`;
  const headPositions = [[105, 204], [148, 136], [220, 97], [300, 87], [380, 104], [458, 156], [496, 232]];
  return (
    <svg className={`pb-beast-svg ${className}`} viewBox="0 0 600 600" aria-hidden="true" data-kind={kind} data-identity={identity} style={{ color: COLORS[kind], '--beast-energy': energy } as CSSProperties}>
      <defs>
        <linearGradient id={material} x1="0" y1="0" x2="1" y2="1"><stop stopColor="currentColor" stopOpacity=".62" /><stop offset=".45" stopColor="#0c2426" /><stop offset="1" stopColor="currentColor" stopOpacity=".3" /></linearGradient>
        <radialGradient id={light}><stop stopColor="currentColor" stopOpacity=".18" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="300" cy="525" rx="165" ry="21" fill={`url(#${light})`} />
      <circle className="pb-specimen-aura" cx="300" cy="300" r="230" fill={`url(#${light})`} />
      <g className="pb-creature-body" stroke="currentColor" strokeWidth="1.4" fill={`url(#${material})`} strokeLinejoin="round" strokeLinecap="round">
        {kind === 'hydra' && <>
          <path d="M211 385C182 405 195 458 228 466L211 502L245 490L260 455L344 457L356 491L390 503L373 462C408 420 375 371 334 365Z" />
          <path d="M371 426C433 490 507 419 505 393C512 456 449 511 359 469" />
          <path d="M236 394L250 413L268 399L287 420L309 402L329 419L345 393" fill="none" opacity=".7" />
          {headPositions.map(([x, y], index) => {
            const base = 300 + (index - 3) * 16;
            const neck = `M${base} 399C${base} 290 ${x + (index < 3 ? 30 : -30)} ${y + 100} ${x} ${y + 22}`;
            return <g key={index} className="pb-hydra-neck">
              <path d={neck} fill="none" strokeWidth="15" opacity=".45" /><path d={neck} fill="none" strokeWidth="2" />
              <path d={`M${x - 20} ${y + 5}L${x - 29} ${y - 12}L${x - 7} ${y - 7}L${x} ${y - 22}L${x + 14} ${y - 6}L${x + 25} ${y - 12}L${x + 21} ${y + 17}L${x + 3} ${y + 30}L${x - 13} ${y + 20}Z`} />
              <path d={`M${x - 11} ${y + 16}L${x + 12} ${y + 18}`} fill="none" />
              <g className="pb-creature-eyes" fill="#f4ddb0" stroke="none"><circle cx={x - 8} cy={y + 3} r="3" /><circle cx={x + 10} cy={y + 3} r="3" /></g>
            </g>;
          })}
        </>}
        {kind === 'sentinel' && <>
          <path d="M241 167L270 141L331 141L359 167L340 219L260 219Z" /><path d="M245 164L300 102L354 164L330 182L270 182Z" />
          <path d="M282 152V181M317 152V181" fill="none" opacity=".5" />
          <path d="M225 222L269 213L299 245L332 213L376 230L354 327L302 359L245 326Z" />
          <path d="M278 232L300 251L324 231L318 294L300 312L282 294Z" fill="#142c2a" />
          <path d="M229 231L188 220L155 265L178 311L220 279ZM375 239L414 222L441 268L416 294L379 279Z" />
          <path d="M165 300L217 292L226 377L188 433L143 388L139 327Z" /><path d="M152 320L183 335L207 314M183 335L188 414" fill="none" />
          <path d="M419 286L452 308L433 345L401 320Z" /><path d="M441 115L458 137L438 301L428 330L426 295Z" />
          <path d="M441 115L451 82L466 108L458 137Z" /><path d="M414 299L458 303" strokeWidth="4" />
          <path d="M252 337L293 354L289 432L266 468L235 450ZM309 354L346 336L363 447L334 468L310 432Z" />
          <path d="M243 447L279 458L270 507L219 508L219 486ZM327 458L354 449L377 484L376 507L325 507Z" />
          <g className="pb-creature-eyes" fill="#f4ddb0" stroke="none"><path d="M265 185L288 181L285 190L268 193ZM312 181L335 185L332 193L314 190Z" /></g>
        </>}
        {kind === 'moth' && <>
          <g className="pb-moth-wings">
            <path d="M287 282C245 148 148 78 77 124C29 203 128 287 284 340C211 358 155 396 122 472C212 495 267 433 298 353Z" />
            <path d="M313 282C355 148 452 78 523 124C571 203 472 287 316 340C389 358 445 396 478 472C388 495 333 433 302 353Z" />
            <g fill="none" opacity=".6"><path d="M284 325L101 154M263 302L118 213M260 321L161 265M280 375L157 452M315 325L499 154M337 302L482 213M340 321L439 265M320 375L443 452" />
              <path d="M276 269C219 237 147 191 126 166M324 269C381 237 453 191 474 166" /></g>
            <ellipse cx="151" cy="213" rx="29" ry="42" transform="rotate(-34 151 213)" fill="#0a141a" /><ellipse cx="449" cy="213" rx="29" ry="42" transform="rotate(34 449 213)" fill="#0a141a" />
            <g className="pb-creature-eyes" fill="#dfc393" stroke="none"><circle cx="151" cy="213" r="11" /><circle cx="449" cy="213" r="11" /></g>
            <path d="M147 411L179 429M453 411L421 429" stroke="#dfc393" strokeWidth="4" />
          </g>
          <path d="M300 210C264 256 276 388 301 421C326 388 336 256 300 210Z" /><ellipse cx="300" cy="206" rx="19" ry="21" />
          <path d="M289 192C268 137 243 143 248 112M311 192C332 137 357 143 352 112M282 322L258 349M318 322L342 349M290 370L270 408M310 370L330 408" fill="none" />
        </>}
        {kind === 'nautilus' && <>
          <path d="M179 310C110 297 94 342 120 377C145 408 205 399 225 365L237 315Z" />
          <path d="M189 337C223 316 238 311 242 279C227 184 293 98 393 123C490 147 502 278 445 355C389 430 282 413 236 350Z" />
          <path d="M226 316C254 253 269 155 355 150C443 145 475 233 437 303C405 362 321 367 290 319C265 280 289 214 332 211C377 208 398 246 381 280C366 311 325 303 324 277C323 257 348 247 358 264" fill="none" strokeWidth="3" />
          <g fill="none" opacity=".5"><path d="M258 271L238 230M278 214L263 177M315 162L313 130M359 150L370 122M411 169L437 146M444 218L472 211M439 277L475 285M406 320L429 355M354 347L351 393M298 331L270 364M291 287L269 297" /></g>
          <g className="pb-nautilus-tentacles" fill="none"><path d="M152 357C38 375 66 450 149 454C242 459 174 514 135 499M169 379C112 417 185 443 200 453C235 474 226 517 188 526M130 344C48 328 40 387 69 409M188 378C149 432 243 426 250 476M142 371C78 439 51 462 80 485" strokeWidth="3" /></g>
          <g className="pb-creature-eyes" fill="#f4ddb0" stroke="none"><circle cx="133" cy="344" r="6" /></g>
        </>}
        {kind === 'golem' && <>
          <path d="M255 132L284 109L325 116L352 141L345 204L311 224L264 208L245 168Z" /><path d="M266 139L307 131L340 151L329 188L298 201L269 186Z" fill="#183032" />
          <path d="M210 211L266 202L299 232L334 211L390 231L375 328L321 366L238 341L198 289Z" />
          <path d="M211 215L181 199L121 245L125 308L191 303L229 274ZM387 236L420 203L475 244L472 309L408 306L375 279Z" />
          <path d="M129 312L185 310L173 399L124 434L102 400L106 352ZM408 314L468 315L493 387L473 428L426 402Z" />
          <path d="M117 422L142 405L169 425L171 462L139 480L105 461ZM436 420L465 411L491 437L487 468L456 483L428 458Z" />
          <path d="M238 345L286 367L277 441L242 463L206 439ZM314 367L363 345L391 438L355 461L318 440Z" />
          <path d="M212 442L260 460L257 502L189 512L177 487ZM333 459L381 439L413 482L404 510L335 501Z" />
          <path d="M299 248L286 269L309 288L286 311L301 341M229 231L248 269L231 304M369 237L354 273L369 309" fill="none" stroke="#e8c788" strokeWidth="2" />
          <g className="pb-creature-eyes" fill="#f4ddb0" stroke="none"><path d="M273 158L293 160L289 168L274 167ZM310 160L331 158L328 167L313 168Z" /></g>
        </>}
        {kind === 'sprout' && <>
          <path d="M248 447C235 389 269 357 309 355C356 353 380 386 365 441C350 482 289 493 248 447Z" />
          <path d="M280 362C301 300 293 265 307 216C317 181 345 162 350 128" fill="none" strokeWidth="7" />
          <path d="M302 282C211 285 171 223 185 175C267 173 308 215 302 282Z" />
          <path d="M315 235C308 148 353 89 404 105C418 185 377 226 315 235Z" />
          <path d="M301 320C351 249 418 246 448 282C407 348 351 350 301 320Z" />
          <g fill="none" opacity=".65"><path d="M301 278L193 184M314 231L399 111M307 319L437 286M271 447L295 387L328 446M288 457L313 380L348 429" />
            <path d="M240 245L236 196M344 192L385 175M366 310L388 274" /></g>
          <g className="pb-sprout-roots" fill="none" strokeWidth="2"><path d="M274 470C264 500 229 487 215 520M297 478L289 526L275 540M320 475C338 489 351 509 374 514M344 463C386 477 373 495 403 505" /></g>
          <g className="pb-creature-eyes" fill="#f4ddb0" stroke="none"><ellipse cx="276" cy="413" rx="4" ry="6" /><ellipse cx="326" cy="413" rx="4" ry="6" /></g>
          <path d="M289 430Q302 440 315 430" fill="none" />
        </>}
      </g>
      <g className="pb-creature-sparks" fill="currentColor" opacity=".7"><circle cx="118" cy="108" r="1.5" /><circle cx="458" cy="91" r="2" /><circle cx="515" cy="381" r="1.8" /><circle cx="93" cy="435" r="1.2" /><path d="M449 459v10m-5-5h10M156 82v8m-4-4h8" fill="none" stroke="currentColor" strokeWidth=".7" /></g>
    </svg>
  );
}
