import React, { useState, useRef } from 'react';
import { Upload, X, Image, File, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { storage } from '../../services/api';

interface FileUploadProps {
  onUpload: (url: string, path: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  bucket?: string;
  folder?: string;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface UploadedFile {
  file: File;
  url: string;
  path: string;
  uploading: boolean;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  onError,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  bucket = 'uploads',
  folder,
  multiple = false,
  className = '',
  children
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // Validate file
      const validation = storage.validateFile(file, maxSize, allowedTypes);
      if (!validation.valid) {
        onError?.(validation.error || 'Invalid file');
        continue;
      }

      // Add file to state with uploading status
      const uploadedFile: UploadedFile = {
        file,
        url: '',
        path: '',
        uploading: true
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        // Upload file
        let uploadResult: any;
        if (bucket === 'profiles') {
          uploadResult = await storage.uploadProfileImage(file);
        } else if (bucket === 'posts') {
          uploadResult = await storage.uploadPostMedia(file);
        } else if (bucket === 'messages') {
          uploadResult = await storage.uploadMessageFile(file);
        } else {
          uploadResult = await storage.uploadFile(file, bucket, folder);
        }

        if (uploadResult.success && uploadResult.data) {
          // Update file state with success
          setUploadedFiles(prev => prev.map(f => 
            f.file === file 
              ? { ...f, url: uploadResult.data!.url, path: uploadResult.data!.path, uploading: false }
              : f
          ));
          
          onUpload(uploadResult.data.url, uploadResult.data.path);
        } else {
          throw new Error(uploadResult.error || 'Upload failed');
        }
      } catch (error: any) {
        // Update file state with error
        setUploadedFiles(prev => prev.map(f => 
          f.file === file 
            ? { ...f, uploading: false, error: error.message }
            : f
        ));
        
        onError?.(error.message);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileToRemove: UploadedFile) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove.file));
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  if (children) {
    return (
      <div className={className} onClick={openFileExplorer}>
        {children}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-[#FF6B00] bg-[#FF6B00]/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileExplorer}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-300 mb-2">
          <span className="font-medium text-[#FF6B00] cursor-pointer">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          {allowedTypes.includes('image/jpeg') ? 'Images' : 'Files'} up to {maxSize / 1024 / 1024}MB
        </p>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((uploadedFile, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {uploadedFile.file.type.startsWith('image/') ? (
                  <Image className="h-5 w-5 text-[#FF6B00]" />
                ) : (
                  <File className="h-5 w-5 text-[#FF6B00]" />
                )}
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-48">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {uploadedFile.uploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF6B00]"></div>
                )}
                
                {uploadedFile.error && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                
                {!uploadedFile.uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadedFile);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
