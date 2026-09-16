import { describe, expect, it } from 'vitest';
import { getAllTools } from '@/config/tools';
import { getToolContent, toolContentId } from '@/config/tool-content';

describe('tool content integrity', () => {
  it('provides fallback content for every configured tool to avoid 404 pages', () => {
    const missingTools = getAllTools()
      .map((tool) => tool.id)
      .filter((toolId) => !getToolContent('id', toolId));

    expect(missingTools).toEqual([]);
  });

  it('provides complete Indonesian tool content', () => {
    const indonesianToolIds = Object.keys(toolContentId);
    const configuredToolIds = getAllTools().map((tool) => tool.id);
    const missingTools = indonesianToolIds.filter((toolId) => !toolContentId[toolId]);
    const missingConfiguredTools = configuredToolIds.filter((toolId) => !toolContentId[toolId]);

    expect(missingTools).toEqual([]);
    expect(missingConfiguredTools).toEqual([]);
    expect(getToolContent('id', 'merge-pdf')?.title).toBe(toolContentId['merge-pdf']?.title);
    expect(getToolContent('en', 'merge-pdf')?.title).toBe('PDF Tool');
  });
});
