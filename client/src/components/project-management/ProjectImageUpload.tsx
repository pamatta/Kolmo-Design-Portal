import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectImageUploadProps {
  projectId?: number;
  currentImageUrl?: string | null;
  onImageChange?: (imageUrl: string | null) => void;
  disabled?: boolean;
}

export function ProjectImageUpload({ 
  projectId, 
  currentImageUrl, 
  onImageChange,
  disabled = false 
}: ProjectImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const displayUrl = previewUrl || currentImageUrl;

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!projectId) {
        throw new Error('Project ID is required for image upload');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/projects/${projectId}/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Image Uploaded',
        description: 'Project image has been updated successfully.',
      });
      setPreviewUrl(null);
      setSelectedFile(null);
      onImageChange?.(data.imageUrl);
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) {
        throw new Error('Project ID is required for image deletion');
      }

      const response = await fetch(`/api/projects/${projectId}/image`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Image Removed',
        description: 'Project image has been removed.',
      });
      setPreviewUrl(null);
      setSelectedFile(null);
      onImageChange?.(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (JPEG, PNG, or GIF)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  }, [toast]);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  }, [selectedFile, uploadMutation]);

  const handleCancelPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleDelete = useCallback(() => {
    if (currentImageUrl && projectId) {
      deleteMutation.mutate();
    }
  }, [currentImageUrl, projectId, deleteMutation]);

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Project Image</label>
      
      {displayUrl ? (
        <div className="relative group">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
            <img
              src={displayUrl}
              alt="Project"
              className="w-full h-full object-cover"
              data-testid="img-project-preview"
            />
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          {!disabled && !isLoading && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {selectedFile ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpload}
                    disabled={isLoading}
                    data-testid="button-confirm-upload"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCancelPreview}
                    disabled={isLoading}
                    data-testid="button-cancel-upload"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    data-testid="button-change-image"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                  {currentImageUrl && projectId && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isLoading}
                      data-testid="button-delete-image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
          data-testid="dropzone-project-image"
        >
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            Click to upload project image
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, or GIF (max 10MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
        data-testid="input-project-image-file"
      />

      {!projectId && selectedFile && (
        <p className="text-xs text-amber-600">
          Image will be uploaded after the project is created.
        </p>
      )}
    </div>
  );
}