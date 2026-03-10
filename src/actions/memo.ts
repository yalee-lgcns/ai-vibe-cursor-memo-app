'use server'

import { supabase } from '@/utils/supabase'
import { Memo, MemoFormData } from '@/types/memo'

interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

function toMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchMemos(): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as MemoRow[]).map(toMemo)
}

export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toMemo(data as MemoRow)
}

export async function updateMemo(
  id: string,
  formData: MemoFormData,
): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toMemo(data as MemoRow)
}

export async function deleteMemo(id: string): Promise<void> {
  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
