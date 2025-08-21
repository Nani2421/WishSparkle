import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Wand2, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: Date;
}

export default function WishGenerator() {
  const [name, setName] = useState("");
  const [generatedWish, setGeneratedWish] = useState<Wish | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copiedWish, setCopiedWish] = useState(false);
  const { toast } = useToast();

  const generateWishMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/wishes", { name });
      return response.json();
    },
    onSuccess: (wish) => {
      setGeneratedWish(wish);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 3000);
      
      // Scroll to wish display
      setTimeout(() => {
        document.getElementById('wish-display')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate wish. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateWish = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: "Name Required",
        description: "Please enter a name to generate a wish.",
        variant: "destructive",
      });
      return;
    }

    generateWishMutation.mutate(trimmedName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerateWish();
    }
  };

  const handleCopyWish = async () => {
    if (!generatedWish) return;
    
    try {
      await navigator.clipboard.writeText(generatedWish.message);
      setCopiedWish(true);
      toast({
        title: "Wish copied!",
        description: "The magical wish has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedWish(false), 3000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the wish manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 mb-12">
      <div className="glass-card rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <Wand2 className="w-16 h-16 text-purple-500 mb-4 animate-pulse-slow mx-auto" />
          <h2 className="text-2xl md:text-3xl font-fredoka text-gray-800 mb-4">
            Create Your Magic Wish
          </h2>
        </div>
        
        <div className="space-y-6">
          <div className="relative">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name here..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white/90 pr-12"
              data-testid="input-name"
              disabled={generateWishMutation.isPending}
            />
            <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          <Button
            onClick={handleGenerateWish}
            disabled={generateWishMutation.isPending}
            className="w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white font-bold py-4 px-8 rounded-xl text-lg hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
            data-testid="button-generate-wish"
          >
            <Wand2 className="mr-2 w-5 h-5" />
            {generateWishMutation.isPending ? "Generating Magic..." : "Generate Magical Wish"}
          </Button>
          
          {generatedWish && (
            <div 
              id="wish-display"
              className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-l-4 border-purple-500"
              data-testid="wish-display"
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl text-purple-500 mt-1">"</div>
                <div className="flex-1">
                  <p 
                    className={`text-lg text-gray-800 ${isAnimating ? 'typewriter' : ''}`}
                    data-testid="text-wish-message"
                  >
                    {generatedWish.message}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-purple-600 font-medium">✨ Specially crafted for you!</span>
                    <Button
                      onClick={handleCopyWish}
                      size="sm"
                      variant="outline"
                      className="bg-white/80 hover:bg-purple-50 border-purple-200 text-purple-600 hover:text-purple-700"
                      data-testid="button-copy-wish"
                    >
                      {copiedWish ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Wish
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
