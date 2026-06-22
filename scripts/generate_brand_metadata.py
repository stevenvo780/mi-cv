#!/usr/bin/env python3
import glob
import json
import os
from pathlib import Path

slug_mapping = {
  'clavis':                             'pinakotheke-paideia',
  'debatesuite':                        'pinakotheke-agon',
  'estructuras-preontologicas':       'pinakotheke-estructuras-preontologicas',
  'complexlab':                         'pinakotheke-kosmos',
  'aporia':                             'pinakotheke-aporia',
  'nlp-to-logic':                     'pinakotheke-organon',
  'stevenai':                           'pinakotheke-daimon',
  'stevendevbox':                       'pinakotheke-techne',
  'communityos':                        'pinakotheke-koinonia',
  'agora':                              'agora',
  'devkits':                            'pinakotheke-ergon',
  'devkits-hours':                    'pinakotheke-chronos',
  'devkits-crm':                      'pinakotheke-xenia',
  'scrapekit':                          'pinakotheke-nomos',
  'warehouse':                          'pinakotheke-apotheke',
  'eikon':                              'pinakotheke-eikon',
  'prizma':                             'prizma',
}

metadata = {}

for prod_id, brand_slug in slug_mapping.items():
    found = False
    for path in glob.glob('/workspace/Pinakotheke/eikon/marcas/*.json'):
        with open(path) as f:
            data = json.load(f)
            if data.get('slug') == brand_slug:
                og_product = data.get('textos', {}).get('og_product', {})
                paleta = data.get('paleta', {})
                
                logo_slug = brand_slug.replace('pinakotheke-', '')
                logo_lockup_path = f'/workspace/Stev/mi-cv/public/brand/{logo_slug}/logo_lockup_color.png'
                has_logo = os.path.exists(logo_lockup_path)
                
                # Check for alternative paths if not found
                if not has_logo:
                    logo_lockup_path_alt = f'/workspace/Stev/mi-cv/public/brand/{prod_id}/logo_lockup_color.png'
                    if os.path.exists(logo_lockup_path_alt):
                        has_logo = True
                        logo_slug = prod_id
                
                metadata[prod_id] = {
                    'nombre_producto': data.get('nombre_producto'),
                    'nombre_corporativo': data.get('nombre_corporativo', 'Pinakothḗke'),
                    'simbolo': data.get('simbolo'),
                    'frente': data.get('frente'),
                    'paleta': {
                        'bg': paleta.get('bg', '#0b1417'),
                        'primario': paleta.get('primario', '#0b1417'),
                        'acento': paleta.get('acento', '#43b5a6'),
                        'acento_2': paleta.get('acento_2', '#8d7cc0'),
                        'acento_3': paleta.get('acento_3', '#A3E4D7'),
                        'texto': paleta.get('texto', '#e8e0d4'),
                        'texto_muted': paleta.get('texto_muted', '#8fa3a8'),
                        'surface': paleta.get('surface', '#131e22'),
                    },
                    'gradiente_hero': data.get('gradiente_hero', 'linear-gradient(135deg, #e0a85e 0%, #c0522a 40%, #43b5a6 100%)'),
                    'gradiente_bg': data.get('gradiente_bg', 'radial-gradient(ellipse at 50% 18%, #1a2830 0%, #0b1417 62%)'),
                    'tagline': data.get('tagline', ''),
                    'titulo': og_product.get('titulo', data.get('nombre_producto')),
                    'subtitulo': og_product.get('subtitulo', data.get('tagline')),
                    'copy': og_product.get('copy', ''),
                    'has_logo': has_logo,
                    'logo_path': f'/brand/{logo_slug}/logo_lockup_color.png' if has_logo else None
                }
                found = True
                break
    if not found:
        # Fallback details if not found in marcas
        metadata[prod_id] = {
            'nombre_producto': prod_id.capitalize(),
            'nombre_corporativo': 'Pinakothḗke',
            'simbolo': '◈',
            'frente': 'informatica',
            'paleta': {
                'bg': '#0b1417',
                'primario': '#0b1417',
                'acento': '#43b5a6',
                'acento_2': '#8d7cc0',
                'acento_3': '#A3E4D7',
                'texto': '#e8e0d4',
                'texto_muted': '#8fa3a8',
                'surface': '#131e22',
            },
            'gradiente_hero': 'linear-gradient(135deg, #e0a85e 0%, #c0522a 40%, #43b5a6 100%)',
            'gradiente_bg': 'radial-gradient(ellipse at 50% 18%, #1a2830 0%, #0b1417 62%)',
            'tagline': '',
            'titulo': prod_id.capitalize(),
            'subtitulo': '',
            'copy': '',
            'has_logo': False,
            'logo_path': None
        }

ts_content = f"""// Generated brand metadata from Pinakotheke Eikon config
export interface BrandPalette {{
  bg: string;
  primario: string;
  acento: string;
  acento_2: string;
  acento_3: string;
  texto: string;
  texto_muted: string;
  surface: string;
}}

export interface BrandMetadata {{
  nombre_producto: string;
  nombre_corporativo: string;
  simbolo: string;
  frente: string | null;
  paleta: BrandPalette;
  gradiente_hero: string;
  gradiente_bg: string;
  tagline: string;
  titulo: string;
  subtitulo: string;
  copy: string;
  has_logo: boolean;
  logo_path: string | null;
}}

export const BRAND_METADATA: Record<string, BrandMetadata> = {json.dumps(metadata, indent=2, ensure_ascii=False)};
"""

output_file = Path('/workspace/Stev/mi-cv/src/data/brandMetadata.ts')
output_file.parent.mkdir(parents=True, exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Generated brand metadata to {output_file}")
