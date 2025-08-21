import { useState, useEffect } from "react";
import CursorTrail from "@/components/cursor-trail";
import WishGenerator from "@/components/wish-generator";
import PhotoUploader from "@/components/photo-uploader";
import PhotoStackModal from "@/components/photo-stack-modal";
import { Heart, Star, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Photo } from "@shared/schema";

export default function Home() {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [generatedShare, setGeneratedShare] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  // Fetch photos for shared link generation
  const { data: photos = [] } = useQuery<Photo[]>({ 
    queryKey: ['/api/photos'] 
  });

  // Create shared link mutation
  const createShareMutation = useMutation({
    mutationFn: async (data: { name: string; customMessage?: string; photoIds: string[] }) => {
      return apiRequest('/api/shared-links', 'POST', data);
    },
    onSuccess: (data) => {
      setGeneratedShare(data);
      toast({
        title: "Shared link created!",
        description: "Your festive wishes are ready to share.",
      });
    },
    onError: (error) => {
      console.error('Share creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create shared link.",
        variant: "destructive",
      });
    }
  });

  const handleCreateShare = () => {
    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create a shared link.",
        variant: "destructive",
      });
      return;
    }

    const photoIds = photos.map(photo => photo.id);
    
    createShareMutation.mutate({
      name: userName.trim(),
      customMessage: customMessage.trim() || undefined,
      photoIds
    });
  };

  const handleCopyLink = async () => {
    if (!generatedShare) return;
    
    const fullUrl = `${window.location.origin}${generatedShare.shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      });
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen glass-bg relative overflow-x-hidden">
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

        {/* Share Link Generation */}
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">Create Shareable Link</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-gray-700">Your Name</Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name..."
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="custom-message" className="text-gray-700">Personal Message (Optional)</Label>
                  <Textarea
                    id="custom-message"
                    data-testid="textarea-custom-message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message for your friends..."
                    className="mt-2 min-h-20"
                  />
                </div>
                
                <Button
                  onClick={handleCreateShare}
                  disabled={createShareMutation.isPending || !userName.trim()}
                  data-testid="button-create-share"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {createShareMutation.isPending ? "Creating..." : "Create Shared Link"}
                </Button>
                
                {generatedShare && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Your shared link is ready! 🎉</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}${generatedShare.shareUrl}`}
                        className="bg-white text-sm"
                        data-testid="input-shared-link"
                      />
                      <Button
                        onClick={handleCopyLink}
                        size="sm"
                        variant="outline"
                        data-testid="button-copy-link"
                        className="shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Share this link with your friends to show them your festive wishes and photos!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
