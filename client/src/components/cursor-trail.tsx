import { useEffect, useRef } from "react";

interface Trail {
  x: number;
  y: number;
  life: number;
  color: string;
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
      trailsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        life: 1,
        color: `hsl(${Date.now() * 0.1 % 360}, 70%, 60%)`
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = trailsRef.current.length - 1; i >= 0; i--) {
        const trail = trailsRef.current[i];

        ctx.globalAlpha = trail.life;
        ctx.fillStyle = trail.color;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, 3 * trail.life, 0, Math.PI * 2);
        ctx.fill();

        trail.life -= 0.05;

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
