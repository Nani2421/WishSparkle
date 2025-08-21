import { useState } from "react";
import CursorTrail from "@/components/cursor-trail";
import WishGenerator from "@/components/wish-generator";
import PhotoUploader from "@/components/photo-uploader";
import PhotoStackModal from "@/components/photo-stack-modal";
import { Heart, Star } from "lucide-react";

export default function Home() {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      <CursorTrail />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="text-center py-8 px-4">
          <h1 className="text-5xl md:text-7xl font-fredoka gradient-text mb-4 animate-float">
            🎉 Festive Wishes 🎉
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Create magical personalized wishes and build your memory stack!
          </p>
        </header>

        {/* Wish Generator */}
        <WishGenerator />

        {/* Photo Uploader */}
        <PhotoUploader onOpenModal={() => setIsPhotoModalOpen(true)} />

        {/* Floating Action Elements */}
        <div className="fixed bottom-8 right-8 space-y-4 z-20">
          <button 
            data-testid="floating-heart"
            className="bg-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transform transition-all duration-300 animate-pulse-slow"
          >
            <Heart className="w-6 h-6" />
          </button>
          <button 
            data-testid="floating-star"
            className="bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transform transition-all duration-300"
          >
            <Star className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Photo Stack Modal */}
      <PhotoStackModal 
        isOpen={isPhotoModalOpen} 
        onClose={() => setIsPhotoModalOpen(false)} 
      />
    </div>
  );
}
