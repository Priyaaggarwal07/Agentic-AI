import { useState, useRef, useEffect } from 'react'
import { FiSend, FiCpu, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi'
import { askAgent, createChatSession, deleteChatSession } from '../services/api'

/**
 * Floating "Ask AI" chat box. Sends the user's question (plus the currently
 * selected map coordinate) to the backend agent and shows the answer.
 *
 * @param {{lat:number,lng:number}|null} props.selected  clicked coordinate
 */
export default function AskAI({ selected }) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([]) // [{ role: 'user'|'ai', text }]
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const endRef = useRef(null)
  const sessionPromiseRef = useRef(null)

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!open || sessionId) return

    let cancelled = false
    ensureSession()
      .then((createdSessionId) => {
        if (!cancelled) setSessionId(createdSessionId)
      })
      .catch(() => {
        // Sending a message will try again and show the normal error state.
      })

    return () => {
      cancelled = true
    }
  }, [open, sessionId])

  const ensureSession = async () => {
    if (sessionId) return sessionId

    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = createChatSession()
    }

    const session = await sessionPromiseRef.current
    setSessionId(session.session_id)
    sessionPromiseRef.current = null
    return session.session_id
  }

  const endSession = async () => {
    const activeSessionId = sessionId
    sessionPromiseRef.current = null
    setSessionId(null)
    setMessages([])
    setQuestion('')

    if (activeSessionId) {
      try {
        await deleteChatSession(activeSessionId)
      } catch (err) {
        // The local chat is already cleared; the backend may have restarted.
      }
    }
  }

  const send = async (e) => {
    e.preventDefault()
    const q = question.trim()
    if (!q || loading) return

    setMessages((m) => [...m, { role: 'user', text: q }])
    setQuestion('')
    setLoading(true)
    try {
      const activeSessionId = await ensureSession()
      const answer = await askAgent(q, selected?.lat, selected?.lng, activeSessionId)
      setMessages((m) => [...m, { role: 'ai', text: answer }])
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: 'Sorry — the AI is unavailable. Make sure the backend is running and OPENAI_API_KEY is set.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card absolute bottom-3 right-3 z-[400] w-80 overflow-hidden shadow-glass">
      {/* Header (click to collapse/expand) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-white"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <FiCpu /> AI Assistant
        </span>
        <span className="flex items-center gap-2">
          {messages.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                endSession()
              }}
              className="grid h-6 w-6 place-items-center rounded-md bg-white/20 transition hover:bg-white/30"
              role="button"
              aria-label="End chat"
              title="End chat"
            >
              <FiX />
            </span>
          )}
          {open ? <FiChevronDown /> : <FiChevronUp />}
        </span>
      </button>

      {open && (
        <div className="flex flex-col">
          {/* Messages */}
          <div className="scroll-thin max-h-56 min-h-[80px] space-y-2 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ask about weather, soil, crops, forecast, or fertilizer.
                {selected
                  ? ' Using the location you clicked on the map.'
                  : ' Tip: click the map first, or include a place in your question.'}
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-emerald-500 text-white'
                    : 'bg-white/70 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100'
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="max-w-[85%] rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-500 dark:bg-slate-700/60 dark:text-slate-300">
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-white/40 p-2 dark:border-white/10">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What should I grow here?"
              className="flex-1 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-700/60 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:opacity-40"
              aria-label="Send"
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
