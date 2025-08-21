import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: string;
  url: string;
  uploadedAt: Date;
}

interface PhotoStackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhotoStackModal({ isOpen, onClose }: PhotoStackModalProps) {
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { data: photos = [] } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleBodyScroll = () => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('keydown', handleEscape);
    handleBodyScroll();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const getPhotoTransform = (index: number, total: number) => {
    const baseRotation = (index - Math.floor(total / 2)) * 2;
    const baseX = (index - Math.floor(total / 2)) * 8;
    const baseY = index * 2;
    
    return {
      rotate: baseRotation,
      x: baseX,
      y: baseY,
      zIndex: total - index
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="photo-stack-modal"
        >
          <motion.div
            className="relative w-full max-w-4xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-black/50 backdrop-blur-sm rounded-t-2xl p-6">
              <div className="flex justify-between items-center">
                <div className="text-white">
                  <h3 className="text-2xl font-fredoka">Your Photo Stack</h3>
                  <p className="text-gray-300">Drag to rearrange your memories</p>
                </div>
                <button 
                  onClick={onClose}
                  className="text-white hover:text-gray-300 transition-colors bg-white/10 hover:bg-white/20 rounded-full p-3"
                  data-testid="button-close-modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Photo Stack Container */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 pt-24 min-h-[500px] relative overflow-hidden">
              {photos.length === 0 ? (
                <div className="text-center text-white/80 py-20">
                  <p className="text-xl">No photos uploaded yet</p>
                  <p className="text-gray-300 mt-2">Upload some photos to see them in your stack!</p>
                </div>
              ) : (
                <div className="relative h-96 mx-auto flex items-center justify-center" style={{ maxWidth: '400px' }}>
                  {photos.map((photo, index) => {
                    const transform = getPhotoTransform(index, photos.length);
                    const isDragged = draggedPhoto === photo.id;
                    
                    return (
                      <motion.div
                        key={photo.id}
                        className="absolute bg-white rounded-lg shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                        style={{
                          width: '240px',
                          height: '320px',
                        }}
                        initial={{
                          rotate: transform.rotate,
                          x: transform.x,
                          y: transform.y,
                          zIndex: transform.zIndex,
                        }}
                        animate={{
                          rotate: isDragged ? 0 : transform.rotate,
                          scale: isDragged ? 1.05 : 1,
                          zIndex: isDragged ? 1000 : transform.zIndex,
                        }}
                        drag
                        dragConstraints={{
                          left: -200,
                          right: 200,
                          top: -150,
                          bottom: 150,
                        }}
                        dragElastic={0.2}
                        onDragStart={() => setDraggedPhoto(photo.id)}
                        onDragEnd={() => setDraggedPhoto(null)}
                        whileHover={{ 
                          scale: isDragged ? 1.05 : 1.02,
                          zIndex: isDragged ? 1000 : 10 
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }}
                        data-testid={`photo-stack-item-${photo.id}`}
                      >
                        <img 
                          src={photo.url} 
                          alt={photo.originalName} 
                          className="w-full h-5/6 object-cover pointer-events-none select-none"
                          draggable={false}
                        />
                        <div className="p-2 bg-white text-center">
                          <p className="text-xs text-gray-600 truncate">
                            {photo.originalName}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="text-center mt-8">
                <p className="text-white/80 text-sm flex items-center justify-center">
                  <Hand className="w-4 h-4 mr-2" />
                  Drag photos to rearrange • Tap to view full size
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
