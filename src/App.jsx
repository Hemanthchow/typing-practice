import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const KEYS = 'asdfjkl;'.split('')
const WORDS = ['ask', 'fall', 'dad', 'flask', 'salad', 'lass', 'all', 'adds', 'salsa', 'falls', 'sad', 'fad', 'lad']
const MODES = ['Guided', 'Words', 'Random']
const makeText = (mode, count = 42) => {
  if (mode === 'Random') return Array.from({ length: count }, () => KEYS[Math.floor(Math.random() * KEYS.length)]).join('')
  const pool = (mode === 'Guided' ? ['asdf', 'jkl;', 'ask', 'fall', 'sad', 'all', 'dad', 'flask', 'lass', 'adds'] : WORDS)
    .filter((item) => [...item].every((key) => KEYS.includes(key)))
  return Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]).join('')
}
const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'spark') return <svg {...common}><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  if (name === 'target') return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
  if (name === 'bolt') return <svg {...common}><path d="m13 2-9 12h7l-1 8 10-13h-7l.5-7Z"/></svg>
  if (name === 'refresh') return <svg {...common}><path d="M20 7v5h-5"/><path d="M4.8 9A8 8 0 0 1 19 6l1 1M4 17v-5h5"/><path d="M19.2 15A8 8 0 0 1 5 18l-1-1"/></svg>
  return null
}

export default function App() {
  const [mode, setMode] = useState('Guided')
  const [text, setText] = useState(() => makeText('Guided'))
  const [typed, setTyped] = useState('')
  const [seconds, setSeconds] = useState(300)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [pressedKey, setPressedKey] = useState('')
  const inputRef = useRef(null)
  const startedAt = useRef(null)

  const correct = useMemo(() => [...typed].reduce((sum, char, i) => sum + (char === text[i] ? 1 : 0), 0), [typed, text])
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100
  const target = text[typed.length] || ''
  const elapsed = 300 - seconds
  const cpm = elapsed > 0 ? Math.round((correct / elapsed) * 60) : 0
  const progress = (elapsed / 300) * 100

  const reset = useCallback((nextMode = mode) => {
    setMode(nextMode); setText(makeText(nextMode)); setTyped(''); setSeconds(300); setRunning(false); setFinished(false); setPressedKey(''); startedAt.current = null
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [mode])

  const finish = useCallback(() => {
    setRunning(false); setFinished(true)
  }, [])

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => setSeconds((remaining) => {
      if (remaining <= 1) { window.clearInterval(timer); setSeconds(0); return 0 }
      return remaining - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  useEffect(() => { if (running && seconds === 0 && !finished) finish() }, [seconds, running, finished, finish])

  const handleInput = (event) => {
    const value = event.target.value
    if (!value) return
    const char = value.slice(-1).toLowerCase()
    if (!KEYS.includes(char)) { event.target.value = ''; return }
    if (finished) { event.target.value = ''; return }
    if (!running) { setRunning(true); startedAt.current = Date.now() }
    setPressedKey(char); window.setTimeout(() => setPressedKey(''), 140)
    const nextLength = typed.length + 1
    setTyped((current) => current + char)
    if (nextLength >= text.length) setText((old) => old + makeText(mode, 24))
    event.target.value = ''
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (KEYS.includes(event.key.toLowerCase())) {
        if (event.target !== inputRef.current) inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Home Row home"><span className="brand-mark"><Icon name="spark" size={19}/></span><span>home<span className="brand-light">row</span></span></a>
      <nav className="top-nav" aria-label="Main navigation"><a className="nav-active" href="#practice">Practice</a><a href="#practice">Progress</a><a href="#about">About</a></nav>
    </header>

    <main id="home">
      <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR DAILY PRACTICE</div><h1>Find your <span>flow.</span></h1><p className="welcome-copy">A little practice goes a long way. Keep your eyes up<br className="desktop-break"/> and let your fingers find their way home.</p></div></section>

      <section className="practice-card" id="practice">
        <div className="practice-top"><div><div className="section-label"><span className="label-icon"><Icon name="spark" size={14}/></span> PRACTICE SESSION</div><h2>Home row fundamentals</h2></div><button className="reset-button" onClick={() => reset()}><Icon name="refresh" size={15}/> Start over</button></div>
        <div className="session-toolbar"><div className="mode-switch" role="tablist" aria-label="Practice mode">{MODES.map((item) => <button key={item} role="tab" aria-selected={mode === item} className={mode === item ? 'selected' : ''} onClick={() => reset(item)}>{item}</button>)}</div><div className="toolbar-note"><span className="tiny-dot"/> Only the home row <span className="key-pill">A S D F J K L ;</span></div></div>

        <div className="typing-area" onClick={() => inputRef.current?.focus()}>
          <div className="typing-meta"><span>TYPE THE LETTERS BELOW</span><span className="typing-hint">Your next key is highlighted <span className="hint-dot"/></span></div>
          <div className="prompt" aria-label="Typing prompt" aria-live="polite">{text.split('').map((char, index) => {
            const typedChar = typed[index]
            const state = index < typed.length ? (typedChar === char ? 'correct-char' : 'wrong-char') : index === typed.length ? 'current-char' : ''
            return <span key={index} className={`${state} ${char === ' ' ? 'space-char' : ''}`}>{char === ' ' ? '\u00a0' : char}</span>
          })}</div>
          <input ref={inputRef} className="typing-input" aria-label="Type the displayed home row keys" autoComplete="off" autoCapitalize="off" spellCheck="false" onChange={handleInput} onPaste={(e) => e.preventDefault()} />
          {!running && !finished && <div className="start-overlay" onClick={() => inputRef.current?.focus()}><span className="start-orb"><Icon name="bolt" size={15}/></span><span>Click here and start typing</span><span className="enter-key">A S D F</span></div>}
          {finished && <div className="finished-overlay"><strong>Lovely work. Session complete.</strong><button onClick={(e) => { e.stopPropagation(); reset() }}>Practice again <span>↗</span></button></div>}
          <div className="typing-footer"><span><span className="live-dot"/> {running ? 'SESSION IN PROGRESS' : finished ? 'SESSION COMPLETE' : 'READY WHEN YOU ARE'}</span><span>{typed.length} <i>/</i> {text.length} characters</span></div>
        </div>

        <div className="keyboard-wrap"><div className="keyboard-caption"><span>HOME ROW</span><span>REST YOUR FINGERS HERE</span></div><div className="keyboard" aria-label="Home row keyboard visual">{KEYS.map((key, index) => <div className={`key ${key === target ? 'key-next' : ''} ${pressedKey === key ? 'key-pressed' : ''} ${index < 4 ? 'left-hand' : 'right-hand'}`} key={key}><span>{key}</span>{key === target && <i className="key-indicator"/>}</div>)}</div><div className="finger-guide"><span className="left-guide">← LEFT HAND</span><span className="home-bumps"><i/><i/></span><span className="right-guide">RIGHT HAND →</span></div></div>
        <div className="practice-bottom"><div className="timer-block"><div className="metric-icon timer-icon"><Icon name="clock" size={17}/></div><div><div className="metric-label">TIME LEFT</div><div className={`metric-value ${seconds <= 30 && running ? 'urgent' : ''}`}>{formatTime(seconds)}<small> / 5:00</small></div></div></div><div className="progress-block"><div className="progress-top"><span>SESSION PROGRESS</span><span>{Math.round(progress)}%</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}/></div><div className="progress-caption">{running ? 'Keep going, you’re doing great!' : finished ? 'You showed up for yourself today.' : 'Your 5 minute practice starts with your first key.'}</div></div><div className="stat-block"><div className="metric-icon accuracy-icon"><Icon name="target" size={17}/></div><div><div className="metric-label">ACCURACY</div><div className="metric-value">{accuracy}<small>%</small></div></div></div><div className="stat-block final-stat"><div className="metric-icon speed-icon"><Icon name="bolt" size={17}/></div><div><div className="metric-label">CORRECT KEYS</div><div className="metric-value">{correct}<small> keys</small></div></div></div></div>
        <div className="sr-only" role="status">Next key: {target || 'none'}. Accuracy: {accuracy} percent. {seconds} seconds remaining.</div>
      </section>

      <footer id="about"><span>MADE FOR THE LONG GAME <i>✳</i></span><span>ONE KEY AT A TIME.</span></footer>
    </main>
  </div>
}
