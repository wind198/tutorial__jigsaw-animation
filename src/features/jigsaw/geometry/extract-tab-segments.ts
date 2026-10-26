import type { EdgeSegment } from './types';

/** Drop leading/trailing straight lines; keep tab cubic chain only. */
export function extractTabCurveSegments(segments: EdgeSegment[]): EdgeSegment[] {
  let start = 0;
  let end = segments.length;
  while (start < end && segments[start]?.kind === 'line') start++;
  while (end > start && segments[end - 1]?.kind === 'line') end--;
  return segments.slice(start, end);
}
