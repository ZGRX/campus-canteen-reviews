import ReactMarkdown from 'react-markdown'
import { ArrowLeft, MapPin, Star, Utensils } from 'lucide-react'
import { photoUrl } from './catalogue'
import type { Stall } from './catalogue'

export function StallDetail({ stall }: { stall: Stall }) {
  const backUrl = new URL(location.href)
  backUrl.searchParams.delete('stall')

  return (
    <div className="detail">
      <a className="back" href={backUrl.pathname + backUrl.search + '#stalls'}><ArrowLeft size={18} /> 返回窗口列表</a>
      <header className="detail-header">
        <div className="detail-heading">
          <p className="detail-meta"><MapPin size={16} aria-hidden="true" /> {stall.hall.campus.name}<span>·</span>{stall.hall.name}<span>·</span>{stall.category}</p>
          <h1>{stall.name}</h1>
          {stall.location && <p className="location">窗口位置 · {stall.location}</p>}
          {stall.recommendation && (
            <p className="author-recommendation detail-recommendation"><small>站长推荐指数</small><span>{stall.recommendation}</span></p>
          )}
        </div>

      </header>
      <div className="detail-media">
        {stall.cover
          ? <img className="detail-cover" src={stall.cover} alt={stall.name + '实拍'} />
          : <div className="photo-placeholder detail-cover"><Utensils size={35} /><span>暂无窗口照片</span></div>}
        <section className="panel mail-summary" aria-labelledby="mail-summary-title">
          <h2 id="mail-summary-title">评论区</h2>
          <p className="muted">（根据大家发往邮箱的总结）</p>
          <div className="mail-summary-stars" aria-label="星级暂未汇总">
            <span className="mail-summary-star-icons" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={23} />)}
            </span>
            <span>暂无星级汇总</span>
          </div>
          <p className="muted">暂无评论汇总，待站长整理后更新。</p>
        </section>
      </div>
      <div className="detail-grid">
        <section className="panel original-note" aria-labelledby="note-title">
          <h2 id="note-title">站长用餐点评</h2>
          <ReactMarkdown components={{
            img: ({ src, alt }) => {
              const image = photoUrl(typeof src === 'string' ? src : undefined)
              return image ? <img src={image} alt={alt?.startsWith('Pasted image') ? stall.name + '实拍' : alt || stall.name + '实拍'} loading="lazy" decoding="async" /> : null
            },
          }}>{stall.note}</ReactMarkdown>
        </section>


      </div>
    </div>
  )
}
