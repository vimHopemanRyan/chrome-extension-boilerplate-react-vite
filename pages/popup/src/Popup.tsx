import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect, useRef, useState } from 'react';

const keysToRemove = ['vimAccessToken', 'vimRefreshToken'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const Popup = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!isAnimating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#f9ca24',
      '#f0932b',
      '#eb4d4b',
      '#6c5ce7',
      '#a29bfe',
      '#fd79a8',
      '#fdcb6e',
    ];

    const createFirework = (x: number, y: number) => {
      const particleCount = 50;
      const newParticles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 4;
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
        });
      }

      particlesRef.current.push(...newParticles);
    };

    const createBurst = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const angle = (Math.PI * 2 * i) / 8;
          const distance = 30 + Math.random() * 40;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          createFirework(x, y);
        }, i * 50);
      }
    };

    createBurst();

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1;
        particle.life -= 0.02;
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        if (particle.life > 0) {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return true;
        }
        return false;
      });

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating]);

  const onClick = async () => {
    setIsAnimating(true);

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab.id || !tab.url) {
      console.error('No tab id found');
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: ({ keys }: { keys: string[] }) => {
        const allKeys = Object.keys(localStorage);

        allKeys.forEach(key => {
          console.log(key);
          if (key.includes('auth0') || keys.includes(key)) {
            localStorage.removeItem(key);
          }
        });
      },
      args: [{ keys: keysToRemove }],
    });

    chrome.cookies.getAll({ domain: 'getvim.us.auth0.com' }, async function (cookies) {
      console.log(cookies);
      for (let i = 0; i < cookies.length; i++) {
        await chrome.cookies.remove({ url: 'https://getvim.us.auth0.com' + cookies[i].path, name: cookies[i].name });
      }
    });
    setTimeout(() => {
      chrome.tabs.reload(tab.id!);
    }, 1000);
  };

  return (
    <div className="App">
      <canvas ref={canvasRef} className="fireworks-canvas" />
      <button className={`logout-button ${isAnimating ? 'animating' : ''}`} onClick={onClick} disabled={isAnimating}>
        <span className="liquid-blob liquid-blob-1"></span>
        <span className="liquid-blob liquid-blob-2"></span>
        <span className="liquid-blob liquid-blob-3"></span>
        <span className="button-content">
          <span className="button-text">Logout Console</span>
          <span className="button-icon">🚀</span>
        </span>
        <span className="button-shine"></span>
        <span className="glass-reflection"></span>
      </button>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
