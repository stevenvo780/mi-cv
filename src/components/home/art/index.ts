// Arte de la home: una escena por catálogo y un emblema por tarjeta, cada uno en <id>.tsx + <id>.css.
// El contrato de cada pieza está en _shared.css. Este índice solo las reúne por id de producto (data/frentes.ts).
import type { ComponentType } from 'react';
import agora from './agora';
import clavis from './clavis';
import koinoniaUdea from './koinonia-udea';
import gobiernoUniversitarioUdea from './gobierno-universitario-udea';
import debatesuite from './debatesuite';
import complexlab from './complexlab';
import umbralAtlas from './umbral-atlas';
import phusis from './phusis';
import noesisLab from './noesis-lab';
import estructurasPreontologicas from './estructuras-preontologicas';
import nlpToLogic from './nlp-to-logic';
import stevenai from './stevenai';
import stevendevbox from './stevendevbox';
import communityos from './communityos';
import devkits from './devkits';
import devkitsHours from './devkits-hours';
import devkitsCrm from './devkits-crm';
import scrapekit from './scrapekit';
import warehouse from './warehouse';
import aporia from './aporia';
import cauceV3 from './cauce-v3';
import eikon from './eikon';
import humanizar from './humanizar';
import prizma from './prizma';
import graf from './graf';
import demeter from './demeter';
import type { ArtProps } from './types';

export type { ArtProps };

export const ART: Record<string, ComponentType<ArtProps>> = {
  'agora': agora,
  'clavis': clavis,
  'koinonia-udea': koinoniaUdea,
  'gobierno-universitario-udea': gobiernoUniversitarioUdea,
  'debatesuite': debatesuite,
  'complexlab': complexlab,
  'umbral-atlas': umbralAtlas,
  'phusis': phusis,
  'noesis-lab': noesisLab,
  'estructuras-preontologicas': estructurasPreontologicas,
  'nlp-to-logic': nlpToLogic,
  'stevenai': stevenai,
  'stevendevbox': stevendevbox,
  'communityos': communityos,
  'devkits': devkits,
  'devkits-hours': devkitsHours,
  'devkits-crm': devkitsCrm,
  'scrapekit': scrapekit,
  'warehouse': warehouse,
  'aporia': aporia,
  'cauce-v3': cauceV3,
  'eikon': eikon,
  'humanizar': humanizar,
  'prizma': prizma,
  'graf': graf,
  'demeter': demeter,
};
