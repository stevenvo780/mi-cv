import { IconDefinition } from '@fortawesome/fontawesome-svg-core'; // Importa el tipo correcto para los íconos

export interface ToolItem {
  name: string;
  icon?: IconDefinition; // Usa IconDefinition para los íconos
  level: number;
}

export interface ToolCategory {
  category: string;
  items: ToolItem[];
  links?: { url: string; icon: IconDefinition }[]; // Usa IconDefinition también para los íconos de enlaces
}
