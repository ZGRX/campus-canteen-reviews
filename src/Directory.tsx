import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUpRight, ChevronDown, MapPin, Search, Star, Utensils, X } from 'lucide-react'
import { halls, photoUrl, stalls } from './catalogue'
import type { Stall } from './catalogue'
import type { RatingSummary } from './supabase'

export type SummaryMap = Record<string, RatingSummary>

const sorts = ['default', 'score', 'count'] as const
type Sort = (typeof sorts)[number]

export function Directory({ summaries, ratingsStatus }: {
  summaries: SummaryMap
  ratingsStatus: 'loading' | 'ready' | 'unavailable'
}) {
  const params = new URLSearchParams(location.search)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [hall, setHall] = useState(() => halls.find((item) => item.id === params.get('hall'))?.id ?? '')
  const [sort, setSort] = useState<Sort>(() => sorts.find((item) => item === params.get('sort')) ?? 'default')
  const [showAll, setShowAll] = useState(params.get('all') === '1')

  useEffect(() => {
    const url = new URL(location.href)
    for (const [key, value] of Object.entries({ q: query, hall, sort: sort === 'default' ? '' : sort, all: showAll ? '1' : '' })) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    if (url.href !== location.href) history.replaceState(history.state, '', url)
  }, [query, hall, sort, showAll])

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matching = stalls.filter((stall) => {
    const searchable = [stall.name, stall.hall.name, stall.category, stall.note].join(' ').toLowerCase()
    return (!hall || stall.hall.id === hall) && words.every((word) => searchable.includes(word))
  })
  if (sort !== 'default') {
    matching.sort((a, b) => {
      const aRating = summaries[a.id]
      const bRating = summaries[b.id]
      const byCount = (bRating?.count ?? 0) - (aRating?.count ?? 0)
      const byScore = (bRating?.average ?? 0) - (aRating?.average ?? 0)
      return sort === 'score' ? byScore || byCount : byCount || byScore
    })
  }
  const visible = showAll ? matching : matching.slice(0, 9)

  function reset() {
    setQuery('')
    setHall('')
    setSort('default')
    setShowAll(false)
  }

  function detailUrl(id: string) {
    const url = new URL(location.href)
    url.search = ''
    for (const [key, value] of Object.entries({ q: query, hall, sort: sort === 'default' ? '' : sort, all: showAll ? '1' : '' })) {
      if (value) url.searchParams.set(key, value)
    }
    url.searchParams.set('stall', id)
    url.hash = ''
    return url.pathname + url.search
  }

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-label"><Utensils size={15} /> 校园食堂点评</div>
          <h1 id="hero-title">今天食堂<br /><em>吃什么？</em></h1>
          <p>搜一搜校园里的食堂窗口，看看实拍和同学的评分。</p>
          <form className="search" role="search" onSubmit={(event) => {
            event.preventDefault()
            document.getElementById('stalls')?.scrollIntoView({ block: 'start' })
          }}>
            <Search size={19} aria-hidden="true" />
            <input aria-label="搜索窗口、食堂或菜品" placeholder="搜窗口、食堂或菜品…" value={query}
              onChange={(event) => { setQuery(event.target.value); setShowAll(false) }} />
            {query && <button type="button" className="icon-button" aria-label="清空搜索" onClick={() => setQuery('')}><X size={16} /></button>}
            <button className="search-submit" aria-label="查看搜索结果"><ArrowDown size={18} /></button>
          </form>
        </div>
        <a className="hero-image" href={detailUrl(stalls[0].id)} aria-label="查看巧心婆的酸辣猪肘面">
          <img src={photoUrl('pasted-20260624020852.jpg')} alt="凤凰厅巧心婆酸辣猪肘面实拍" fetchPriority="high" />
          <div className="image-credit"><MapPin size={14} /> 凤凰厅 · 巧心婆 <ArrowUpRight size={16} /></div>
        </a>
      </section>

      <section id="stalls" className="directory" aria-labelledby="directory-title">
        <div className="section-heading">
          <div><h2 id="directory-title">{query.trim() ? '搜索结果' : '食堂窗口'}</h2>
            <p aria-live="polite">{matching.length} 个窗口{hall ? ' · ' + halls.find((item) => item.id === hall)?.name : !query.trim() ? ' · ' + halls.length + ' 个食堂' : ''}</p></div>
          <label className="sort">
            <span className="sr-only">排序方式</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
              <option value="default">默认排序</option>
              <option value="score" disabled={ratingsStatus !== 'ready'}>评分最高</option>
              <option value="count" disabled={ratingsStatus !== 'ready'}>评分最多</option>
            </select><ChevronDown size={16} />
          </label>
        </div>
        <div className="filters" role="group" aria-label="按食堂筛选">
          <button type="button" aria-pressed={!hall} onClick={() => { setHall(''); setShowAll(false) }}>全部食堂</button>
          {halls.map((item) => (
            <button key={item.id} type="button" aria-pressed={hall === item.id}
              onClick={() => { setHall(item.id); setShowAll(false) }}>{item.name}</button>
          ))}
        </div>
        {visible.length ? (
          <div className="card-grid">
            {visible.map((stall, index) => <StallCard key={stall.id} stall={stall}
              summary={summaries[stall.id]} ratingsStatus={ratingsStatus} href={detailUrl(stall.id)} eager={index < 3} />)}
          </div>
        ) : (
          <div className="empty"><Search size={26} /><h3>没有找到窗口</h3><p>换个关键词，或查看全部食堂。</p>
            <button className="button secondary" onClick={reset}>清除筛选</button></div>
        )}
        {visible.length < matching.length && (
          <button className="button secondary more" onClick={() => setShowAll(true)}>
            查看其余 {matching.length - visible.length} 个窗口 <ChevronDown size={16} />
          </button>
        )}
      </section>
    </>
  )
}

function StallCard({ stall, summary, ratingsStatus, href, eager }: {
  stall: Stall
  summary?: RatingSummary
  ratingsStatus: 'loading' | 'ready' | 'unavailable'
  href: string
  eager: boolean
}) {
  return (
    <article className="stall-card">
      <a href={href}>
        <div className="card-photo">
          {stall.cover
            ? <img src={stall.cover} alt={stall.name + '实拍'} loading={eager ? 'eager' : 'lazy'} decoding="async" />
            : <div className="photo-placeholder"><Utensils size={30} aria-hidden="true" /><span>暂无窗口照片</span></div>}
          <span className="hall-tag"><MapPin size={13} />{stall.hall.name}</span>
        </div>
        <div className="card-body">
          <p className="category">{stall.category}</p>
          <h3>{stall.name}</h3>
          <div className="card-bottom">
            <span className="small-rating"><Star size={16} />
              {summary ? <><strong>{Number(summary.average).toFixed(1)}</strong><span>· {summary.count} 人评分</span></>
                : ratingsStatus === 'ready' ? '暂无评分' : ratingsStatus === 'loading' ? '载入评分…' : '评分暂不可用'}
            </span>
            <span className="card-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
          </div>
        </div>
      </a>
    </article>
  )
}
