import { ArrowLeft } from 'lucide-react'

export function About() {
  return (
    <div className="about-page">
      <a className="back" href={location.pathname}><ArrowLeft size={18} /> 返回首页</a>
      <section className="panel site-notice" aria-labelledby="site-notice-title">
        <h1 id="site-notice-title">关于与联系</h1>
        <h3>为什么没有评论区？</h3>
        <p>觅食指南是站长个人制作和维护的食堂指南。个人备案网站不允许交互评论出现，因此暂不开放访客评论、打分和点赞。</p>
        <h3>如何参与进来？</h3>
        <p>虽然禁止访客评论、打分和点赞，但是感兴趣的同学可以把你喜欢的窗口以及食物的评论和照片发到设立的专门邮箱！^_^</p>
        <h3>想一起让这份指南更好用？</h3>
        <p>如果你发现窗口名称、位置等信息有误，有想让站长实地探访的窗口线索，或对网站功能有建议，欢迎发邮件联系。站长会将这些建议作为后续核实和更新的参考。</p>
        <a className="contact-email" href="mailto:whattoeatat311@163.com">whattoeatat311@163.com</a>
      </section>
    </div>
  )
}
