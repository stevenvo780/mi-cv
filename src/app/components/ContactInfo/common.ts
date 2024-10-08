
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import {
  faEnvelope,
  faLink,
} from '@fortawesome/free-solid-svg-icons';

export type Contact = {
  type: 'email' | 'linkedin' | 'portfolio';
  value: string;
  icon: IconDefinition;
  url: string;
};

export const contacts: Contact[] = [
  {
    type: 'email',
    value: 'stevenvallejo780@gmail.com',
    icon: faEnvelope,
    url: 'mailto:stevenvallejo780@gmail.com'
  },
  {
    type: 'linkedin',
    value: 'LinkedIn',
    icon: faLinkedin,
    url: 'https://www.linkedin.com/in/steven-vallejo/'
  },
  {
    type: 'portfolio',
    value: 'CodeRank',
    icon: faLink,
    url: 'https://profile.codersrank.io/user/stevenvo780'
  },
];
