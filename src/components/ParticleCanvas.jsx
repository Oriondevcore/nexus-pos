// src/components/ParticleCanvas.jsx
// Animated gold particle background — runs on a canvas for performance

import { useEffect, useRef } from 'react'

const ParticleCanvas = ({ count = 50, opacity = 1 }) => {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const particles = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width, height

    // ─── Resize handler ──────────────────────────────────────────────
    const resize = () => {
      width         = canvas.width  = canvas.offsetWidth
      height        = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ─── Create a particle ───────────────────────────────────────────
    const createParticle = (randomY = false) => ({
      x:          Math.random() * width,
      y:          randomY ? Math.random() * height : height + 10,
      size:       Math.random() * 1.5 + 0.4,
      speedY:     Math.random() * 0.5 + 0.2,
      speedX:     (Math.random() - 0.5) * 0.3,
      opacity:    0,
      maxOpacity: Math.random() * 0.5 + 0.1,
      life:       0,
      maxLife:    Math.random() * 300 + 150,
    })

    // Seed initial particles
    particles.current = Array.from({ length: count }, () => createParticle(true))

    // ─── Animation loop ──────────────────────────────────────────────
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      particles.current.forEach((p, i) => {
        p.y    -= p.speedY
        p.x    += p.speedX
        p.life += 1

        // Fade in
        if (p.life < 40) p.opacity = Math.min(p.maxOpacity, p.opacity + p.maxOpacity / 40)
        // Fade out near end
        if (p.life > p.maxLife - 40) p.opacity = Math.max(0, p.opacity - p.maxOpacity / 40)

        // Reset when off screen or life over
        if (p.y < -10 || p.life >= p.maxLife) {
          particles.current[i] = createParticle(false)
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity * opacity})`
        ctx.fill()

        // Occasionally draw a slightly larger glowing dot
        if (p.size > 1.2) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity * opacity * 0.15})`
          ctx.fill()
        }
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    // ─── Cleanup ─────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [count, opacity])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:  'absolute',
        inset:     0,
        width:     '100%',
        height:    '100%',
        pointerEvents: 'none',
        zIndex:    0,
      }}
    />
  )
}

export default ParticleCanvas
