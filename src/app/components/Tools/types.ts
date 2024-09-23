import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ToolItem {
  name: string;
  icon?: IconDefinition;
  level: number;
}

export interface ToolCategory {
  category: string;
  items: ToolItem[];
  links?: { url: string; icon: IconDefinition }[];
}
