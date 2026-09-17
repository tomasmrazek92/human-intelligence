/* Pattern artwork, split out of the main bundle.
 *
 * SVG_PATTERNS is ~6.8 MB of inline SVG — every visitor used to download it on
 * every page because pattern.js imported it statically. It is now its own entry
 * point, injected by pattern.js only on pages that actually have [data-pattern].
 */
import { SVG_PATTERNS } from './svgs';

window.HI_SVG_PATTERNS = SVG_PATTERNS;
