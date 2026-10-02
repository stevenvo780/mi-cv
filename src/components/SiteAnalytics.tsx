'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import GoogleAnalytics from './Analytics';

export default function SiteAnalytics() {
  return <><GoogleAnalytics /><VercelAnalytics /></>;
}
