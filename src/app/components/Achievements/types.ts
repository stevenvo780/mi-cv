
import { StaticImageData } from 'next/image';

export interface AchievementItem {
  name: string;
  description: string;
  link: string;
  image?: StaticImageData | string;
  tier: 'gold' | 'platinum' | 'silver';
  isCustom?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  backgroundColor?: string;
}
