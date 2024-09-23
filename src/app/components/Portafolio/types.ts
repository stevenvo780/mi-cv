import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
interface PortfolioProject {
  name: string;
  link: string;
  description: string;
  icon?: IconDefinition;
  important: boolean;
}

export interface PortfolioCategory {
  name: string;
  icon?: IconDefinition;
  projects: PortfolioProject[];
}
