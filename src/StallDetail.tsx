import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, MapPin, Star, Utensils } from 'lucide-react'
import { photoUrl } from './catalogue'
import type { Stall } from './catalogue'
import { getStallReviews, supabase } from './supabase'
import type { PublicReview, RatingSummary } from './supabase'

export function StallDetail({ stall, summary, summaryStatus, userId, onSignIn, refreshSummaries }: {
  stall: Stall
  summary?: RatingSummary
  summaryStatus: 'loading' | 'ready' | 'unavailable'
  userId?: string
  onSignIn: () => void
  refreshSummaries: () => void
}) {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [ownReview, setOwnReview] = useState<PublicReview | null>(null)
  const [score, setScore] = useState(0)
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(supabase ? 'loading' : 'ready')
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return
    let active = true
    setStatus('loading')
    getStallReviews(stall.id, Boolean(userId)).then(({ reviews: nextReviews, own }) => {
      if (!active) return
      setReviews(nextReviews)
      setOwnReview(own)
      setScore(own?.score ?? 0)
      setBody(own?.body ?? '')
      setStatus('ready')
    }).catch(() => {
      if (active) setStatus('error')
    })
    return () => { active = false }
  }, [stall.id, userId, revision])

  async function writeReview(remove = false) {
    if (!supabase || !userId || busy || status !== 'ready') return
    if (remove && !window.confirm('删除你的评分和点评？')) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { error: writeError } = remove
        ? await supabase.rpc('canteen_delete_review', { target_stall: stall.id })
        : await supabase.rpc('canteen_save_review', {
            target_stall: stall.id, rating: score, review_body: body.trim(),
          })
      if (writeError) throw writeError
      setMessage(remove ? '评价已删除。' : '评价已发布。')
      setStatus('loading')
      setRevision((value) => value + 1)
      refreshSummaries()
    } catch {
      setError('未能更新评价，请稍后重试。')
    } finally {
      setBusy(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!score || !supabase) return
    void writeReview()
  }

  const backUrl = new URL(location.href)
  backUrl.searchParams.delete('stall')

  return (
    <div className="detail">
      <a className="back" href={backUrl.pathname + backUrl.search + '#stalls'}><ArrowLeft size={18} /> 返回窗口列表</a>
      <header className="detail-header">
        <div className="detail-heading">
          <p className="detail-meta"><MapPin size={16} /> {stall.hall.name}<span>·</span>{stall.category}</p>
          <h1>{stall.name}</h1>
          {stall.location && <p className="location">窗口位置 · {stall.location}</p>}
          <div className="large-rating">
            <Star size={25} />
            {summary ? <><strong>{Number(summary.average).toFixed(1)}</strong><span> / 5 · {summary.count} 人评分</span></>
              : <span>{summaryStatus === 'ready' ? '暂无同学评分' : summaryStatus === 'loading' ? '载入评分…' : '评分暂不可用'}</span>}
          </div>
        </div>
        {stall.cover
          ? <img className="detail-cover" src={stall.cover} alt={stall.name + '实拍'} />
          : <div className="photo-placeholder detail-cover"><Utensils size={35} /><span>暂无窗口照片</span></div>}
      </header>
      <div className="detail-grid">
        <section className="panel original-note" aria-labelledby="note-title">
          <h2 id="note-title">原作者探店笔记</h2>
          <ReactMarkdown components={{
            img: ({ src, alt }) => {
              const image = photoUrl(typeof src === 'string' ? src : undefined)
              return image ? <img src={image} alt={alt?.startsWith('Pasted image') ? stall.name + '实拍' : alt || stall.name + '实拍'} loading="lazy" decoding="async" /> : null
            },
          }}>{stall.note}</ReactMarkdown>
        </section>
        <div className="detail-side">
          <section className="panel" aria-labelledby="rating-title">
            <h2 id="rating-title">{ownReview ? '编辑我的评价' : '给这个窗口打分'}</h2>
            {supabase && !userId ? (
              <div className="rating-form">
                <p className="muted">登录后可以打 1–5 星，也可以留一条文字点评。</p>
                <div className="review-actions"><button className="button primary" onClick={onSignIn}>登录后评分</button></div>
              </div>
            ) : <form onSubmit={submit} className="rating-form">
              <fieldset disabled={busy || status === 'loading' || status === 'error'}>
                <legend className="sr-only">选择 1 至 5 星</legend>
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value} className={value <= score ? 'selected' : ''}>
                      <input className="sr-only" type="radio" name="rating" required checked={score === value}
                        aria-label={value + ' 星'} onChange={() => setScore(value)} />
                      <Star size={29} aria-hidden="true" />
                    </label>
                  ))}
                  <span>{score ? score + ' / 5' : '选个分数'}</span>
                </div>
                <label className="review-label">点评（选填）
                  <textarea value={body} onChange={(event) => setBody(event.target.value)}
                    rows={3} maxLength={500} placeholder="有什么推荐？口味、分量或出餐速度都可以聊聊。" />
                </label>
              </fieldset>
              {!supabase && <p className="muted">评分服务尚未配置，当前可以预览打分界面。</p>}
              {error && <p role="alert" className="error">{error}</p>}
              {message && <p role="status" className="success">{message}</p>}
              <div className="review-actions">
                <button className="button primary" disabled={!supabase || busy || status !== 'ready'}>
                  {busy ? '处理中…' : '保存评价'}
                </button>
                {userId && ownReview && <button type="button" className="button subtle"
                  disabled={busy || status !== 'ready'} onClick={() => void writeReview(true)}>删除评价</button>}
              </div>
            </form>}
          </section>
          <section className="panel" aria-labelledby="reviews-title">
            <h2 id="reviews-title">同学点评</h2>
            {status === 'loading' ? <p role="status" className="muted">正在加载点评…</p>
              : status === 'error' ? <p className="error" role="alert">暂时无法加载点评。 <button className="text-button" onClick={() => setRevision((value) => value + 1)}>重试</button></p>
              : !supabase ? <p className="muted">评分服务上线后可查看同学的点评。</p>
              : !reviews.length ? <p className="muted">还没有文字点评。</p>
              : <ul className="reviews">{reviews.map((review, index) => (
                  <li key={review.updated_at + '-' + index}>
                    <div><span className="review-score"><Star size={15} /> {review.score} / 5</span>
                      <time dateTime={review.updated_at}>{new Date(review.updated_at).toLocaleDateString('zh-CN')}</time></div>
                    <p>{review.body}</p>
                  </li>
                ))}</ul>}
          </section>
        </div>
      </div>
    </div>
  )
}
