import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart, Sparkles } from "lucide-react";
import CursorTrail from "@/components/cursor-trail";
import type { Photo, SharedLink } from "@shared/schema";

interface DraggablePhotoProps {
  photo: Photo & { url: string };
  index: number;
}

function DraggablePhoto({ photo, index }: DraggablePhotoProps) {
  const [position, setPosition] = useState({
    x: Math.random() * (window.innerWidth - 200),
    y: Math.random() * (window.innerHeight - 200) + 200,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      className={`fixed z-20 cursor-move transform transition-transform duration-200 ${
        isDragging ? 'scale-105' : 'hover:scale-102'
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${(index * 7 - 10)}deg)`,
        zIndex: 20 + index,
      }}
      onMouseDown={handleMouseDown}
      data-testid={`draggable-photo-${index}`}
    >
      <div className="glass-card p-2 bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl">
        <img
          src={photo.url}
          alt={photo.originalName}
          className="w-48 h-48 object-cover rounded-xl"
          draggable={false}
        />
        <div className="mt-2 text-center">
          <p className="text-white text-sm font-medium truncate">{photo.originalName}</p>
        </div>
      </div>
    </div>
  );
}

export default function SharedPage() {
  const [location] = useLocation();
  const shareToken = location.split('/shared/')[1];

  const { data: sharedData, isLoading, error } = useQuery({
    queryKey: ['/api/shared-links', shareToken],
    queryFn: async () => {
      const response = await fetch(`/api/shared-links/${shareToken}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shared link');
      }
      return response.json() as Promise<SharedLink & { photos: (Photo & { url: string })[] }>;
    },
    enabled: !!shareToken,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen night-sky-bg flex items-center justify-center">
        <CursorTrail />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading magical wishes...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen night-sky-bg flex items-center justify-center">
        <CursorTrail />
        <Card className="glass-card max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">✨ Oops! ✨</h1>
            <p className="text-white/80 mb-4">
              This magical link seems to have disappeared into the night sky.
            </p>
            <p className="text-white/60 text-sm">
              The shared wishes you're looking for might have expired or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen night-sky-bg relative overflow-hidden">
      <CursorTrail />
      
      {/* Magical Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <Star className="w-4 h-4 text-white/30" />
          </div>
        ))}
      </div>

      {/* Custom Message */}
      {sharedData.customMessage && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-30 max-w-2xl px-4">
          <Card className="glass-card bg-white/15 backdrop-blur-lg border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-pink-400" />
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <p className="text-white text-center text-lg leading-relaxed">
                {sharedData.customMessage}
              </p>
              <p className="text-white/60 text-center text-sm mt-3">
                - {sharedData.senderName}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generated Wish Message */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 max-w-2xl px-4">
        <Card className="glass-card bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border-white/30">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4 animate-pulse-slow">
                ✨ Festive Wishes ✨
              </h2>
              <p className="text-white text-lg leading-relaxed mb-4">
                {sharedData.generatedMessage}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <p className="text-white/80 text-sm">
                  Shared with love by {sharedData.senderName}
                </p>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Draggable Photo Stack */}
      <div className="absolute inset-0">
        {sharedData.photos.map((photo, index) => (
          <DraggablePhoto
            key={photo.id}
            photo={photo}
            index={index}
          />
        ))}
      </div>

      {/* Instructions */}
      {sharedData.photos.length > 0 && (
        <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-10">
          <Card className="glass-card bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <p className="text-white/80 text-sm text-center">
                Drag the photos around! <br />
                Create your own magical arrangement
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}