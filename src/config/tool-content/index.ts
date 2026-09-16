/**
 * Indonesian tool content exports.
 */
export { toolContentId } from './id';
export { toolContentEn } from './en';

import { toolContentId } from './id';
import { toolContentEn } from './en';
import { ToolContent } from '@/types/tool';
import type { Locale } from '@/lib/i18n/config';

export type { Locale } from '@/lib/i18n/config';


/**
 * Get tool content for the selected locale.
 */
export function getToolContent(locale: Locale, toolId: string): ToolContent | undefined {
  return locale === 'en' ? toolContentEn[toolId] : toolContentId[toolId];
}

