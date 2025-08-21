import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, Images, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Photo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: string;
  url: string;
  uploadedAt: Date;
}

interface PhotoUploaderProps {
  onOpenModal: () => void;
}

export default function PhotoUploader({ onOpenModal }: PhotoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Success!",
        description: "Photos uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const response = await apiRequest("DELETE", `/api/photos/${photoId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Photo Deleted",
        description: "Photo removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please select only image files.",
        variant: "destructive",
      });
      return;
    }

    const fileList = new DataTransfer();
    imageFiles.forEach(file => fileList.items.add(file));
    
    uploadPhotosMutation.mutate(fileList.files);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = (photoId: string) => {
    deletePhotoMutation.mutate(photoId);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 mb-12">
      <div className="glass-card rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <Images className="w-16 h-16 text-green-500 mb-4 animate-bounce-gentle mx-auto" />
          <h2 className="text-2xl md:text-3xl font-fredoka text-gray-800 mb-4">
            Build Your Memory Stack
          </h2>
          <p className="text-gray-600">Upload photos to create your personal collection</p>
        </div>
        
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          className={`upload-area bg-gray-50 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-100 transition-all duration-300 border-3 border-dashed ${
            isDragOver ? 'border-blue-500 bg-blue-50 scale-102' : 'border-gray-300'
          }`}
          data-testid="upload-area"
        >
          <div className="space-y-4">
            <CloudUpload className="w-24 h-24 text-blue-400 mx-auto" />
            <div>
              <p className="text-xl font-medium text-gray-700">
                {uploadPhotosMutation.isPending ? "Uploading..." : "Drop your photos here"}
              </p>
              <p className="text-gray-500">or click to browse</p>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file"
              disabled={uploadPhotosMutation.isPending}
            />
          </div>
        </div>
        
        {/* Photo Preview Grid */}
        {photos.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="photo-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img 
                  src={photo.url} 
                  alt={photo.originalName} 
                  className="w-full h-24 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                  data-testid={`img-photo-${photo.id}`}
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.id);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  data-testid={`button-delete-${photo.id}`}
                  disabled={deletePhotoMutation.isPending}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button 
            onClick={onOpenModal}
            disabled={photos.length === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            data-testid="button-open-stack"
          >
            <Layers className="mr-2 w-5 h-5" />
            Open Photo Stack
            <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-sm">
              {photos.length}
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}
