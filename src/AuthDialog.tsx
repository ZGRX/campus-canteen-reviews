import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Mail, X } from 'lucide-react'
import { supabase } from './supabase'

export function AuthDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setError('')
    setBusy(true)
    try {
      if (sent) {
        const result = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' })
        if (result.error) throw result.error
        onClose()
      } else {
        const result = await supabase.auth.signInWithOtp({ email: email.trim() })
        if (result.error) throw result.error
        setSent(true)
      }
    } catch {
      setError(sent ? '验证码无效或已过期，请重试。' : '暂时无法发送验证码，请稍后再试。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog ref={dialog} className="auth-dialog" aria-labelledby="auth-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <button type="button" className="icon-button close-dialog" aria-label="关闭" onClick={onClose}><X size={20} /></button>
      <div className="mail-icon"><Mail size={22} /></div>
      <h2 id="auth-title">邮箱登录</h2>
      <p>{sent ? '请输入发送到 ' + email + ' 的验证码。' : '登录后就能给吃过的窗口评分。'}</p>
      <form onSubmit={submit}>
        {sent ? (
          <label>验证码<input key="otp" required inputMode="numeric" autoComplete="one-time-code"
            value={token} onChange={(event) => setToken(event.target.value)} placeholder="邮箱验证码" /></label>
        ) : (
          <label>邮箱地址<input key="email" type="email" required autoComplete="email"
            value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button primary" disabled={busy}>{busy ? '请稍候…' : sent ? '登录' : '发送验证码'}</button>
        {sent && <button type="button" className="button subtle" disabled={busy}
          onClick={() => { setSent(false); setToken(''); setError('') }}>返回或重新发送</button>}
      </form>
    </dialog>
  )
}
