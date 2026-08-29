import imgPkgAdrenaline from '../assets/images/regenerated_image_1787966281339.png';
import imgPkgFamily from '../assets/images/regenerated_image_1787966291211.jpg';
import imgRouteCanyon from '../assets/images/regenerated_image_1787966294428.png';
import imgGal02 from '../assets/images/regenerated_image_1787966301965.jpg';
import imgGal03 from '../assets/images/regenerated_image_1787966302462.jpg';
import imgGal04 from '../assets/images/regenerated_image_1787966314946.webp';
import imgGal05 from '../assets/images/regenerated_image_1787966314676.png';
import imgGal06 from '../assets/images/regenerated_image_1787966303965.png';

export const ASSET_IMAGES = {
  pkgAdrenaline: imgPkgAdrenaline,
  pkgFamily: imgPkgFamily,
  routeCanyon: imgRouteCanyon,
  gal02: imgGal02,
  gal03: imgGal03,
  gal04: imgGal04,
  gal05: imgGal05,
  gal06: imgGal06,
};

const ASSET_LOOKUP: Record<string, string> = {
  'regenerated_image_1787966281339.png': imgPkgAdrenaline,
  'regenerated_image_1787966291211.jpg': imgPkgFamily,
  'regenerated_image_1787966294428.png': imgRouteCanyon,
  'regenerated_image_1787966301965.jpg': imgGal02,
  'regenerated_image_1787966302462.jpg': imgGal03,
  'regenerated_image_1787966314946.webp': imgGal04,
  'regenerated_image_1787966314676.png': imgGal05,
  'regenerated_image_1787966303965.png': imgGal06,
  'pkg-neretva-adrenaline': imgPkgAdrenaline,
  'neretva-extreme-adrenaline-safari': imgPkgAdrenaline,
  'pkg-neretva-family-chill': imgPkgFamily,
  'family-nature-rafting-tour': imgPkgFamily,
  'gal-02': imgGal02,
  'gal-03': imgGal03,
  'gal-04': imgGal04,
  'gal-05': imgGal05,
  'gal-06': imgGal06,
};

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  for (const [key, asset] of Object.entries(ASSET_LOOKUP)) {
    if (url.includes(key)) {
      return asset;
    }
  }
  return url;
}
