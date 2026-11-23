import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUpRight, ChevronDown, MapPin, Search, Utensils, X } from 'lucide-react'
import { halls, photoUrl, stalls, taiAnCampus } from './catalogue'
import type { Stall } from './catalogue'
import { MealWheel } from './MealWheel'



export function Directory() {
  const params = new URLSearchParams(location.search)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [hall, setHall] = useState(() => halls.find((item) => item.id === params.get('hall'))?.id ?? '')
  const [showAll, setShowAll] = useState(params.get('all') === '1')

  useEffect(() => {
    const url = new URL(location.href)
    for (const [key, value] of Object.entries({ q: query, hall, all: showAll ? '1' : '' })) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    if (url.href !== location.href) history.replaceState(history.state, '', url)
  }, [query, hall, showAll])

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matching = stalls.filter((stall) => {
    const searchable = [stall.name, stall.hall.name, stall.hall.campus.name, stall.category, stall.note].join(' ').toLowerCase()
    return (!hall || stall.hall.id === hall) && words.every((word) => searchable.includes(word))
  })
  const visible = showAll ? matching : matching.slice(0, 9)

  function reset() {
    setQuery('')
    setHall('')
    setShowAll(false)
  }

  function detailUrl(id: string) {
    const url = new URL(location.href)
    url.search = ''
    for (const [key, value] of Object.entries({ q: query, hall, all: showAll ? '1' : '' })) {
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
          <div className="hero-label"><MapPin size={15} aria-hidden="true" /> {taiAnCampus.name}</div>
          <h1 id="hero-title">今天食堂<br /><em>吃什么？</em></h1>
          <p>搜食堂窗口、看实拍和探店笔记，或者转一下选餐。</p>
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
          <a className="hero-wheel-link" href="#meal-wheel">试试随机选餐 <ArrowDown size={15} aria-hidden="true" /></a>
        </div>
        <a className="hero-image" href={detailUrl(stalls[0].id)} aria-label="查看巧心婆的酸辣猪肘面">
          <img src={photoUrl('pasted-20260624020852.jpg')} alt="凤凰厅巧心婆酸辣猪肘面实拍" fetchPriority="high" />
          <div className="image-credit"><MapPin size={14} /> 凤凰厅 · 巧心婆 <ArrowUpRight size={16} /></div>
        </a>
      </section>

      <MealWheel detailUrl={detailUrl} />

      <section id="stalls" className="directory" aria-labelledby="directory-title">
        <div className="section-heading">
          <div><h2 id="directory-title">{query.trim() ? '搜索结果' : '食堂窗口'}</h2>
            <p aria-live="polite">{matching.length} 个窗口{hall ? ' · ' + halls.find((item) => item.id === hall)?.name : !query.trim() ? ' · ' + halls.length + ' 个食堂' : ''}</p></div>

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
              href={detailUrl(stall.id)} eager={index < 3} />)}
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

function StallCard({ stall, href, eager }: {
  stall: Stall
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
          <span className="hall-tag"><MapPin size={13} aria-hidden="true" />{stall.hall.campus.name} · {stall.hall.name}</span>
        </div>
        <div className="card-body">
          <p className="category">{stall.category}</p>
          <h3>{stall.name}</h3>
          <div className="card-bottom">
            {stall.recommendation
              ? <span className="author-recommendation"><small>站长推荐指数</small><span>{stall.recommendation}</span></span>
              : <span className="muted">查看用餐笔记</span>}
            <span className="card-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
          </div>
        </div>
      </a>
    </article>
  )
}
