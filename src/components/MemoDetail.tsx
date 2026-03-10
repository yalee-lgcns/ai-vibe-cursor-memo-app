'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownRenderer from './MarkdownRenderer'

interface RelatedUrl {
  title: string
  url: string
}

interface MemoDetailProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoDetail({
  memo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [relatedUrls, setRelatedUrls] = useState<RelatedUrl[]>([])
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const lastSummarizedId = useRef<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const fetchSummary = useCallback(async (targetMemo: Memo) => {
    setSummaryLoading(true)
    setSummaryError(null)

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetMemo.title,
          content: targetMemo.content,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '요약 요청에 실패했습니다.')
      }

      setSummary(data.summary)
      setRelatedUrls(data.relatedUrls || [])
      lastSummarizedId.current = targetMemo.id
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '요약 중 오류가 발생했습니다.'
      setSummaryError(message)
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && memo && memo.id !== lastSummarizedId.current) {
      setSummary(null)
      setRelatedUrls([])
      setSummaryError(null)
      fetchSummary(memo)
    }
  }, [isOpen, memo, fetchSummary])

  useEffect(() => {
    if (!isOpen) {
      lastSummarizedId.current = null
      setSummary(null)
      setRelatedUrls([])
      setSummaryError(null)
    }
  }, [isOpen])

  if (!isOpen || !memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleEdit = () => {
    onClose()
    onEdit(memo)
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onClose()
      onDelete(memo.id)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      data-testid="memo-detail-backdrop"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-detail-title"
        data-testid="memo-detail-modal"
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
              <h2
                id="memo-detail-title"
                className="text-xl font-semibold text-gray-900 mb-2"
              >
                {memo.title}
              </h2>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
                >
                  {MEMO_CATEGORIES[
                    memo.category as keyof typeof MEMO_CATEGORIES
                  ] || memo.category}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="닫기"
              data-testid="memo-detail-close-btn"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 날짜 정보 */}
          <div className="flex gap-4 mb-6 text-xs text-gray-500">
            <span>작성: {formatDate(memo.createdAt)}</span>
            {memo.createdAt !== memo.updatedAt && (
              <span>수정: {formatDate(memo.updatedAt)}</span>
            )}
          </div>

          {/* 구분선 */}
          <hr className="border-gray-200 mb-6" />

          {/* AI 요약 섹션 */}
          <div className="mb-6">
            {summaryLoading && (
              <div className="flex items-center justify-center gap-3 px-4 py-4 bg-violet-50 border border-violet-200 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-300 border-t-violet-600" />
                <span className="text-sm text-violet-700">
                  AI가 메모를 분석하고 있습니다...
                </span>
              </div>
            )}

            {summaryError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-red-700">{summaryError}</p>
                    <button
                      onClick={() => fetchSummary(memo)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              </div>
            )}

            {summary && (
              <div className="bg-violet-50 border border-violet-200 rounded-lg overflow-hidden">
                <div className="flex items-center px-4 py-2 bg-violet-100 border-b border-violet-200">
                  <svg
                    className="w-4 h-4 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="ml-2 text-xs font-medium text-violet-700">
                    AI 요약
                  </span>
                </div>
                <div className="px-4 py-3" data-testid="memo-summary-content">
                  <MarkdownRenderer content={summary} />
                </div>

                {relatedUrls.length > 0 && (
                  <div className="px-4 py-3 border-t border-violet-200 bg-violet-50/50">
                    <p className="text-xs font-medium text-violet-700 mb-2 flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      관련 참고 사이트
                    </p>
                    <ul className="space-y-1.5" data-testid="related-urls">
                      {relatedUrls.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-violet-400 text-xs mt-0.5">
                            •
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-600 hover:text-violet-800 hover:underline break-all leading-snug"
                          >
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 내용 (마크다운 렌더링) */}
          <div className="mb-6">
            <MarkdownRenderer content={memo.content} />
          </div>

          {/* 태그 */}
          {memo.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {memo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 구분선 */}
          <hr className="border-gray-200 mb-4" />

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              data-testid="memo-detail-edit-btn"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              편집
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              data-testid="memo-detail-delete-btn"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
