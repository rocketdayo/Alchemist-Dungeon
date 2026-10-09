class SoundEngine {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  playElementHarvest() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.15)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.3)

    const chime = ctx.createOscillator()
    const chimeGain = ctx.createGain()
    chime.type = 'sine'
    chime.frequency.setValueAtTime(1800, now + 0.05)
    chime.frequency.exponentialRampToValueAtTime(3200, now + 0.25)
    chimeGain.gain.setValueAtTime(0.15, now + 0.05)
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    chime.connect(chimeGain)
    chimeGain.connect(ctx.destination)
    chime.start(now + 0.05)
    chime.stop(now + 0.35)
  }

  playCraftSuccess() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime

    for (let i = 0; i < 4; i++) {
      const bubble = ctx.createOscillator()
      const bubbleGain = ctx.createGain()
      const startTime = now + i * 0.04
      const startFreq = 300 + Math.random() * 200
      const endFreq = startFreq + 400

      bubble.type = 'sine'
      bubble.frequency.setValueAtTime(startFreq, startTime)
      bubble.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.06)

      bubbleGain.gain.setValueAtTime(0.12, startTime)
      bubbleGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.07)

      bubble.connect(bubbleGain)
      bubbleGain.connect(ctx.destination)

      bubble.start(startTime)
      bubble.stop(startTime + 0.07)
    }

    const sparkle = ctx.createOscillator()
    const sparkleGain = ctx.createGain()
    sparkle.type = 'triangle'
    sparkle.frequency.setValueAtTime(987.77, now + 0.18)
    sparkle.frequency.exponentialRampToValueAtTime(1975.53, now + 0.4)

    sparkleGain.gain.setValueAtTime(0.2, now + 0.18)
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    sparkle.connect(sparkleGain)
    sparkleGain.connect(ctx.destination)

    sparkle.start(now + 0.18)
    sparkle.stop(now + 0.5)
  }

  playPotionThrow() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(650, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.18)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  playExplosion() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime

    const bufferSize = ctx.sampleRate * 0.35
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(600, now)
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.35)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.35, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    noise.start(now)

    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()

    sub.type = 'sine'
    sub.frequency.setValueAtTime(140, now)
    sub.frequency.exponentialRampToValueAtTime(35, now + 0.3)

    subGain.gain.setValueAtTime(0.4, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    sub.connect(subGain)
    subGain.connect(ctx.destination)

    sub.start(now)
    sub.stop(now + 0.35)
  }

  playHeal() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50]

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startTime = now + idx * 0.08

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.18, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.4)
    })
  }

  playHit() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  }

  playClick() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.04)
  }

  playFreeze() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(1600, now)
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.25)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
  }
}

export const soundEngine = new SoundEngine()
