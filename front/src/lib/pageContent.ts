import { useEffect, useState } from 'react'
import { api, type PageContent } from '@/api'

export function usePageContents(page: string) {
  const [contents, setContents] = useState<PageContent[]>([])

  useEffect(() => {
    let active = true

    api.pageContents.getActive(page)
      .then((res) => {
        if (active) setContents(res.contents ?? [])
      })
      .catch(() => {
        if (active) setContents([])
      })

    return () => {
      active = false
    }
  }, [page])

  return contents
}

export function findSection(contents: PageContent[], section: string) {
  return contents.find((content) => content.section.toLowerCase() === section.toLowerCase())
}

export function splitParagraphs(value?: string) {
  return String(value ?? '')
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
}
