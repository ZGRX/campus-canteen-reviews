import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowUpRight, Mail, Utensils } from 'lucide-react'
import { About } from './About'
import { Directory } from './Directory'
import { StallDetail } from './StallDetail'
import { stalls } from './catalogue'
import './style.css'

function App() {
  const params = new URLSearchParams(location.search)
  const isAbout = params.get('page') === 'about'
  const stallId = params.get('stall')
  const stall = stalls.find((item) => item.id === stallId)

  useEffect(() => {
    document.title = isAbout ? '关于与联系 · 觅食指南' : stall ? stall.name + ' · 觅食指南' : '觅食指南 · 泰安校区食堂指南'
  }, [isAbout, stall])

  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href={location.pathname}><span className="brand-mark"><Utensils size={21} strokeWidth={2.3} /></span>觅食指南</a>
          <nav aria-label="主导航">
            <a className="nav-link" href={location.pathname + '#stalls'}>食堂窗口</a>

          </nav>
        </div>
      </header>
      <div className="shell notice-entry-wrap">
        <a className="notice-entry" href={location.pathname + '?page=about'} aria-current={isAbout ? 'page' : undefined}>
          <span className="notice-entry-icon"><Mail size={22} aria-hidden="true" /></span>
          <span className="notice-entry-copy"><strong>为什么没有评论区？如何参与</strong><span>了解本站的个人记录方式，联系站长纠错、提建议</span></span>
          <ArrowUpRight className="notice-entry-arrow" size={23} aria-hidden="true" />
        </a>
      </div>
      <main className="shell">
        {isAbout ? <About /> : stall ? <StallDetail stall={stall} />
          : stallId ? <div className="empty"><h1>找不到这个窗口</h1><a className="button secondary" href={location.pathname}><ArrowLeft size={17} /> 返回首页</a></div>
          : <Directory />}
      </main>
      <footer className="shell footer">
        <a className="brand" href={location.pathname}><Utensils size={17} /> 觅食指南</a>
        <a href="https://github.com/ZGRX/campus-canteen-reviews">项目源码 <span aria-hidden="true">↗</span></a>
      </footer>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
