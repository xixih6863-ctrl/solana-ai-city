import { useEffect, useRef, useCallback } from 'react';

// ============================================
// Particle System for Visual Effects
// ============================================

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: ParticleType;
}

export type ParticleType = 
  | 'confetti' 
  | 'sparkle' 
  | 'fire' 
  | 'smoke' 
  | 'stars' 
  |' 
  | 'coins 'energy' 
  | 'hearts';

class ParticleSystem {
  private particles: Map<string, Particle> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private callbacks: Map<string, () => void> = new Map();

  constructor() {
    this.update = this.update.bind(this);
  }

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  createParticle(
    x: number,
    y: number,
    type: ParticleType,
    options?: Partial<Particle>
  ): Particle {
    const id = Math.random().toString(36).substr(2, 9);
    const colors: Record<ParticleType, string[]> = {
      confetti: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
      sparkle: ['#FFD700', '#FFA500', '#FFFFFF', '#87CEEB'],
      fire: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'],
      smoke: ['#808080', '#A9A9A9', '#696969'],
      stars: ['#FFD700', '#FFFACD', '#FFE4B5'],
      coins: ['#FFD700', '#FFA500', '#DAA520'],
      energy: ['#00FFFF', '#7FFFD4', '#40E0D0'],
      hearts: ['#FF69B4', '#FF1493', '#FFB6C1'],
    };

    const particle: Particle = {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * (type === 'fire' ? 2 : 5),
      vy: (Math.random() - 0.5) * (type === 'fire' ? 2 : 5) - (type === 'confetti' ? 2 : 0),
      life: 0,
      maxLife: options?.maxLife || 60 + Math.random() * 60,
      color: options?.color || colors[type][Math.floor(Math.random() * colors[type].length)],
      size: options?.size || (type === 'confetti' ? 8 : 4 + Math.random() * 4),
      type,
      ...options,
    };

    this.particles.set(id, particle);
    return particle;
  }

  burst(
    x: number,
    y: number,
    type: ParticleType,
    count: number = 20,
    options?: Partial<Particle>
  ) {
    for (let i = 0; i < count; i++) {
      this.createParticle(x, y, type, options);
    }
  }

  update(): boolean {
    if (!this.ctx || !this.canvas) return false;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    let hasParticles = false;

    this.particles.forEach((particle, id) => {
      hasParticles = true;
      particle.life++;
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Add gravity for confetti
      if (particle.type === 'confetti' || particle.type === 'coins') {
        particle.vy += 0.1;
      }

      // Fade out
      const opacity = 1 - particle.life / particle.maxLife;
      
      // Draw
      this.ctx!.save();
      this.ctx!.globalAlpha = opacity;
      this.ctx!.fillStyle = particle.color;

      if (particle.type === 'confetti') {
        this.ctx!.fillRect(particle.x, particle.y, particle.size, particle.size);
      } else if (particle.type === 'sparkle' || particle.type === 'stars') {
        this.ctx!.beginPath();
        this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx!.fill();
      } else if (particle.type === 'coins') {
        this.ctx!.beginPath();
        this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx!.fillStyle = '#FFD700';
        this.ctx!.fill();
        this.ctx!.strokeStyle = '#FFA500';
        this.ctx!.lineWidth = 2;
        this.ctx!.stroke();
      } else if (particle.type === 'fire') {
        this.ctx!.beginPath();
        this.ctx!.arc(particle.x, particle.y, particle.size * (1 - particle.life / particle.maxLife * 0.5), 0, Math.PI * 2);
        this.ctx!.fillStyle = particle.color;
        this.ctx!.fill();
      } else {
        this.ctx!.beginPath();
        this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx!.fill();
      }

      this.ctx!.restore();

      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        this.particles.delete(id);
        if (this.callbacks.has(id)) {
          this.callbacks.get(id)?.();
          this.callbacks.delete(id);
        }
      }
    });

    return hasParticles;
  }

  start() {
    if (this.animationId) return;
    
    const animate = () => {
      const hasParticles = this.update();
      if (hasParticles || this.particles.size > 0) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = null;
      }
    };
    
    animate();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  clear() {
    this.particles.clear();
    this.callbacks.clear();
  }

  onParticleEnd(id: string, callback: () => void) {
    this.callbacks.set(id, callback);
  }
}

// Singleton instance
export const particleSystem = new ParticleSystem();

// ============================================
// React Hook for Particle Effects
// ============================================

export function useParticleEffects(containerRef: React.RefObject<HTMLElement>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const systemRef = useRef<ParticleSystem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';

    containerRef.current.appendChild(canvas);
    canvasRef.current = canvas;
    systemRef.current = new ParticleSystem();
    systemRef.current.init(canvas);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      systemRef.current?.clear();
      canvas.remove();
    };
  }, [containerRef]);

  const burst = useCallback((x: number, y: number, type: ParticleType, count: number = 20) => {
    systemRef.current?.burst(x, y, type, count);
    systemRef.current?.start();
  }, []);

  const celebrate = useCallback((x: number, y: number) => {
    systemRef.current?.burst(x, y, 'confetti', 50);
    systemRef.current?.burst(x + 20, y, 'sparkle', 30);
    systemRef.current?.burst(x - 20, y, 'stars', 20);
    systemRef.current?.start();
  }, []);

  const coinEffect = useCallback((x: number, y: number) => {
    systemRef.current?.burst(x, y, 'coins', 10);
    systemRef.current?.start();
  }, []);

  const levelUp = useCallback((x: number, y: number) => {
    systemRef.current?.burst(x, y, 'energy', 30);
    systemRef.current?.burst(x, y, 'sparkle', 25);
    systemRef.current?.start();
  }, []);

  const damage = useCallback((x: number, y: number) => {
    systemRef.current?.burst(x, y, 'smoke', 15);
    systemRef.current?.start();
  }, []);

  const heal = useCallback((x: number, y: number) => {
    systemRef.current?.burst(x, y, 'hearts', 20);
    systemRef.current?.burst(x, y, 'sparkle', 15);
    systemRef.current?.start();
  }, []);

  return {
    burst,
    celebrate,
    coinEffect,
    levelUp,
    damage,
    heal,
  };
}

// ============================================
// Animation Presets
// ============================================

export const animations = {
  // Button hover effects
  buttonHover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  
  buttonTap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },

  // Card animations
  cardAppear: {
    opacity: [0, 1],
    y: [20, 0],
    scale: [0.95, 1],
    transition: { duration: 0.3 },
  },

  cardHover: {
    y: -5,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    transition: { duration: 0.3 },
  },

  // Achievement unlock
  achievementUnlock: {
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: { duration: 0.6 },
  },

  // Progress bar fill
  progressFill: {
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Fade in
  fadeIn: {
    opacity: [0, 1],
    transition: { duration: 0.3 },
  },

  // Slide in from left
  slideInLeft: {
    x: [-100, 0],
    opacity: [0, 1],
    transition: { duration: 0.3 },
  },

  // Slide in from right
  slideInRight: {
    x: [100, 0],
    opacity: [0, 1],
    transition: { duration: 0.3 },
  },

  // Slide in from top
  slideInTop: {
    y: [-50, 0],
    opacity: [0, 1],
    transition: { duration: 0.3 },
  },

  // Pulse
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.6, repeat: Infinity },
  },

  // Bounce
  bounce: {
    y: [0, -20, 0],
    transition: { duration: 0.4, repeat: Infinity },
  },

  // Shake
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.3 },
  },

  // Glow
  glow: {
    boxShadow: [
      '0 0 0 rgba(99, 102, 241, 0)',
      '0 0 20px rgba(99, 102, 241, 0.5)',
      '0 0 0 rgba(99, 102, 241, 0)',
    ],
    transition: { duration: 1, repeat: Infinity },
  },

  // Spin
  spin: {
    rotate: [0, 360],
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },

  // Flip
  flip: {
    rotateY: [0, 180],
    transition: { duration: 0.5 },
  },

  // Pop
  pop: {
    scale: [0, 1.2, 1],
    transition: { duration: 0.4 },
  },

  // Floating
  float: {
    y: [0, -10, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },

  // Wave
  wave: {
    y: [0, -5, 0],
    transition: { duration: 1, repeat: Infinity, delay: Math.random() * 0.5 },
  },
};

// ============================================
// Animation Variants for Framer Motion
// ============================================

export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const modalVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};

export const tooltipVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 5 },
};

export const notificationVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

// ============================================
// Utility Functions
// ============================================

export const ease = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 0.75) * c4);
  },
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

export const random = {
  range: (min: number, max: number) => Math.random() * (max - min) + min,
  int: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min),
  pick: <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)],
  color: () => `hsl(${Math.random() * 360}, 70%, 50%)`,
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================
// Sound Effects Manager
// ============================================

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private volume: number = 0.5;
  private muted: boolean = false;

  load(name: string, url: string) {
    const audio = new Audio(url);
    this.sounds.set(name, audio);
  }

  play(name: string) {
    if (this.muted) return;
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = this.volume;
      sound.play().catch(console.error);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.muted = !this.muted;
  }

  isMuted() {
    return this.muted;
  }

  preload() {
    this.sounds.forEach((audio) => {
      audio.load();
    });
  }
}

export const soundManager = new SoundManager();

// Preload sounds
// soundManager.load('click', '/sounds/click.mp3');
// soundManager.load('hover', '/sounds/hover.mp3');
// soundManager.load('success', '/sounds/success.mp3');
// soundManager.load('error', '/sounds/error.mp3');
// soundManager.load('coin', '/sounds/coin.mp3');
// soundManager.load('achievement', '/sounds/achievement.mp3');

export default {
  particleSystem,
  useParticleEffects,
  animations,
  pageVariants,
  staggerContainer,
  staggerItem,
  modalVariants,
  tooltipVariants,
  notificationVariants,
  ease,
  random,
  debounce,
  throttle,
  soundManager,
};
