'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-gray-900 mt-3 mb-1 first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 text-sm leading-relaxed mb-3 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-700 text-sm mb-3 space-y-1 pl-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-gray-700 text-sm mb-3 space-y-1 pl-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-300 bg-blue-50 pl-4 py-2 my-3 text-sm text-gray-700 italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code className="block bg-gray-900 text-gray-100 rounded-lg p-4 my-3 text-xs leading-relaxed overflow-x-auto whitespace-pre">
          {children}
        </code>
      )
    }
    return (
      <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    )
  },
  pre: ({ children }) => <pre className="my-3">{children}</pre>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="border-gray-200 my-4" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-gray-200 text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-200 px-3 py-2 text-gray-700">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      className="max-w-full h-auto rounded-lg my-3"
    />
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="line-through text-gray-500">{children}</del>
  ),
  input: ({ checked, disabled }) => (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      readOnly
      className="mr-2 rounded border-gray-300 text-blue-600"
    />
  ),
}

export default function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  return (
    <div className={className} data-testid="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
