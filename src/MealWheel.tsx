import { useRef, useState } from 'react'
import { ArrowUpRight, Utensils } from 'lucide-react'
import { halls, stalls, taiAnCampus } from './catalogue'
import type { Stall } from './catalogue'

const campusStalls = stalls.filter((stall) => stall.hall.campus.id === taiAnCampus.id)
const campusHalls = halls.filter((hall) => hall.campus.id === taiAnCampus.id)

export function MealWheel({ detailUrl }: { detailUrl: (id: string) => string }) {
  const disc = useRef<HTMLDivElement>(null)
  const [hall, setHall] = useState('')
  const [winner, setWinner] = useState<Stall>()
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const pool = campusStalls.filter((stall) => !hall || stall.hall.id === hall)
  const segment = 360 / pool.length
  const colors = pool.map((_, index) => {
    const color = index === pool.length - 1 && index % 2 === 0 ? '#ecd99d' : index % 2 === 0 ? '#d9efad' : '#478263'
    return `${color} ${index * segment}deg ${(index + 1) * segment}deg`
  })

  async function spin() {
    if (!disc.current || spinning || !pool.length) return
    const candidates = pool.length > 1 ? pool.filter((stall) => stall.id !== winner?.id) : pool
    const next = candidates[Math.floor(Math.random() * candidates.length)]
    const target = 360 - (pool.indexOf(next) + 0.5) * segment
    const nextRotation = target + (Math.ceil(rotation / 360) + 3) * 360

    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSpinning(true)
      const animation = disc.current.animate(
        [{ transform: `rotate(${rotation}deg)` }, { transform: `rotate(${nextRotation}deg)` }],
        { duration: 2200, easing: 'cubic-bezier(.15,.65,.16,1)' },
      )
      await animation.finished
      setSpinning(false)
    }
    setRotation(target)
    setWinner(next)
  }

  return (
    <section id="meal-wheel" className="meal-wheel panel" aria-labelledby="meal-wheel-title">
      <div className="wheel-graphic" aria-hidden="true">
        <span className="wheel-pointer" />
        <div ref={disc} className="wheel-disc"
          style={{ backgroundImage: `conic-gradient(${colors.join(', ')})`, transform: `rotate(${rotation}deg)` }} />
        <span className="wheel-hub"><Utensils size={26} /></span>
      </div>
      <div className="wheel-content">
        <h2 id="meal-wheel-title">随机选餐</h2>
        <p className="muted">{taiAnCampus.name} · {pool.length} 个窗口</p>
        <div className="wheel-controls">
          <label>
            <span>抽取范围</span>
            <select value={hall} disabled={spinning} onChange={(event) => {
              setHall(event.target.value)
              setWinner(undefined)
              setRotation(0)
            }}>
              <option value="">全部食堂</option>
              {campusHalls.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <button type="button" className="button primary" disabled={spinning || !pool.length} onClick={() => void spin()}>
            {spinning ? '转盘转动中…' : winner ? '再转一次' : '转一下'}
          </button>
        </div>
        <div className="wheel-result" aria-live="polite">
          {!spinning && winner && (
            <a className="wheel-pick" href={detailUrl(winner.id)} aria-label="查看窗口详情">
              {winner.cover && <img src={winner.cover} alt="" />}
              <span><strong>{winner.name}</strong><small>{winner.hall.name} · {winner.category}</small></span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
