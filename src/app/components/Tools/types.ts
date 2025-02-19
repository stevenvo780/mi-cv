import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ToolItem {
  name: string;
  icon?: IconDefinition;
  level: number;
  startedAt: string;
}

export interface ToolCategory {
  category: string;
  items: ToolItem[];
  links?: { url: string; icon: IconDefinition }[];
}
