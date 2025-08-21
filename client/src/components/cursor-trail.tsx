import { useEffect, useRef } from "react";

interface Trail {
  x: number;
  y: number;
  life: number;
  color: string;
  size: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<Trail[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Create multiple trail particles for smooth comet effect
      for (let i = 0; i < 3; i++) {
        trailsRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 2,
          y: e.clientY + (Math.random() - 0.5) * 2,
          life: 1,
          color: `hsl(${(Date.now() * 0.1 + i * 30) % 360}, 80%, 65%)`,
          size: Math.random() * 4 + 2
        });
      }
    };

    const animate = () => {
      // Create trailing effect by not clearing completely
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'lighter';

      for (let i = trailsRef.current.length - 1; i >= 0; i--) {
        const trail = trailsRef.current[i];

        // Create gradient for comet tail effect
        const gradient = ctx.createRadialGradient(
          trail.x, trail.y, 0,
          trail.x, trail.y, trail.size * trail.life
        );
        gradient.addColorStop(0, trail.color.replace(')', `, ${trail.life})`).replace('hsl', 'hsla'));
        gradient.addColorStop(0.5, trail.color.replace(')', `, ${trail.life * 0.5})`).replace('hsl', 'hsla'));
        gradient.addColorStop(1, trail.color.replace(')', ', 0)').replace('hsl', 'hsla'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.size * trail.life, 0, Math.PI * 2);
        ctx.fill();

        trail.life -= 0.02; // Slower fade for longer tail

        if (trail.life <= 0) {
          trailsRef.current.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-1"
      style={{ zIndex: 1 }}
    />
  );
}
