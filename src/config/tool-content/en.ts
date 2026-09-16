import type { ToolContent } from '@/types/tool';

const fallbackContent: ToolContent = {
  title: 'PDF Tool',
  metaDescription: 'Process PDF documents locally in your browser.',
  keywords: ['PDF tool', 'PDF documents'],
  description: '<p>Process PDF documents locally in your browser without uploading files to a server.</p>',
  howToUse: [{ step: 1, title: 'Upload a file', description: 'Choose the PDF file you want to process.' }],
  useCases: [{ title: 'Document processing', description: 'Use this tool for internal PDF document tasks.', icon: 'file-text' }],
  faq: [{ question: 'Are my files uploaded?', answer: 'No. Processing happens locally in your browser.' }],
};

export const toolContentEn: Record<string, ToolContent> = new Proxy({}, {
  get: () => fallbackContent,
});
