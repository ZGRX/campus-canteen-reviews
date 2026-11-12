import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, LogIn, Utensils } from 'lucide-react'
import { AuthDialog } from './AuthDialog'
import { Directory } from './Directory'
import type { SummaryMap } from './Directory'
import { StallDetail } from './StallDetail'
import { stalls } from './catalogue'
import { getSummaries, supabase } from './supabase'
import './style.css'

function App() {
  const [userId, setUserId] = useState<string>()
  const [showLogin, setShowLogin] = useState(false)
  const [authError, setAuthError] = useState('')
  const [summaries, setSummaries] = useState<SummaryMap>({})
  const [ratingsStatus, setRatingsStatus] = useState<'loading' | 'ready' | 'unavailable'>(supabase ? 'loading' : 'unavailable')
  const [revision, setRevision] = useState(0)
  const stallId = new URLSearchParams(location.search).get('stall')
  const stall = stalls.find((item) => item.id === stallId)

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase) return
    let active = true
    getSummaries().then((rows) => {
      if (!active) return
      setSummaries(Object.fromEntries(rows.map((row) => [row.stall_id, row])))
      setRatingsStatus('ready')
    }).catch(() => {
      if (active) setRatingsStatus('unavailable')
    })
    return () => { active = false }
  }, [revision])

  useEffect(() => {
    document.title = stall ? stall.name + ' · 觅食指南' : '觅食指南 · 校园食堂点评'
  }, [stall])

  async function signOut() {
    const result = await supabase?.auth.signOut({ scope: 'local' })
    setAuthError(result?.error ? '退出失败，请稍后重试。' : '')
  }

  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href={location.pathname}><span className="brand-mark"><Utensils size={21} strokeWidth={2.3} /></span>觅食指南</a>
          <nav aria-label="主导航">
            <a className="nav-link" href={location.pathname + '#stalls'}>食堂窗口</a>
            {supabase && <button className="button secondary sign-in" onClick={userId ? signOut : () => setShowLogin(true)}>
              {userId ? '退出登录' : <><LogIn size={16} /> 登录</>}
            </button>}
          </nav>
        </div>
      </header>
      <main className="shell">
        {authError && <p className="error" role="alert">{authError}</p>}
        {stall ? <StallDetail key={stall.id + ':' + (userId ?? 'guest')} stall={stall}
          summary={summaries[stall.id]} summaryStatus={ratingsStatus}
          userId={userId} onSignIn={() => setShowLogin(true)} refreshSummaries={() => setRevision((value) => value + 1)} />
          : stallId ? <div className="empty"><h1>找不到这个窗口</h1><a className="button secondary" href={location.pathname}><ArrowLeft size={17} /> 返回首页</a></div>
          : <Directory summaries={summaries} ratingsStatus={ratingsStatus} />}
      </main>
      <footer className="shell footer">
        <a className="brand" href={location.pathname}><Utensils size={17} /> 觅食指南</a>
        <a href="https://github.com/ZGRX/campus-canteen-reviews">项目源码 <span aria-hidden="true">↗</span></a>
      </footer>
      {showLogin && <AuthDialog onClose={() => setShowLogin(false)} />}
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
