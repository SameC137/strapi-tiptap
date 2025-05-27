import React, { useRef, useState, useCallback } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Play, Pause, Edit, Upload } from "lucide-react";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";  
import { cn } from "../utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import uploadMedia from "../Audio/upload";


export interface BackgroundAudioOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    backgroundAudio: {
      setBackgroundAudio: (options: { src: string }) => ReturnType;
    };
  }
}

export const BackgroundAudio = Node.create<BackgroundAudioOptions>({
  name: "backgroundAudio",

  group: "block",

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="background-audio"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-type": "background-audio",
        class: "relative",
      }),
      ["audio", { src: HTMLAttributes.src || "", class: "hidden" }],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BackgroundAudioNode);
  },

  addCommands() {
    return {
      setBackgroundAudio:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export const BackgroundAudioNode: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  editor,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [audioSrc, setAudioSrc] = useState(node.attrs.src);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Playback error:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setIsUploading(true);
      try {
        const url = await uploadMedia(file);
        setAudioSrc(url);
        updateAttributes({ src: url });
        setShowDialog(false);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    }
  }, [updateAttributes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [],
    },
    multiple: false,
  });

  const handleSubmit = () => {
    updateAttributes({ src: audioSrc });
    setShowDialog(false);
  };

  // Show upload dropzone if no audio source is set
  if (!node.attrs.src && editor.isEditable) {
    return (
      <NodeViewWrapper className="not-prose">
        <div className="relative p-8 border-2 border-dashed rounded-lg bg-secondary/10">
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center gap-4 p-8 cursor-pointer",
              isDragActive ? "bg-primary/5" : ""
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">Uploading audio...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <p className="text-lg font-medium">Add Background Audio</p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop an audio file here, or click to select
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Determine if we're in edit mode or HTML mode
  const isEditMode = editor.isEditable;
  
  return (
    <NodeViewWrapper className="not-prose">
      <div className="relative">
        {node.attrs.src && (
          <audio
            ref={audioRef}
            src={node.attrs.src}
            loop
            // onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
        
        {isEditMode ? (
          // Edit mode layout - controls in the editor
          <div className="p-4 border rounded-lg bg-secondary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={togglePlay}
                  className="h-10 w-10 rounded-full bg-primary"
                  size="icon"
                  disabled={!node.attrs.src}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-1" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Background Audio
                </span>
              </div>
              <Button
                onClick={() => setShowDialog(true)}
                className="h-8 w-8 rounded-full bg-secondary"
                size="icon"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          // HTML mode layout - floating controls
          <div className="fixed top-[20vh] right-4 flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={togglePlay}
                    className="h-12 w-12 rounded-full bg-primary shadow-lg z-50"
                    size="icon"
                    disabled={!node.attrs.src}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-1" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ይህ መጣጥፍ የጀርባ ድምጽ አለው።</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Background Audio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
                  "flex flex-col items-center justify-center gap-2",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary"
                )}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-center">Uploading audio...</p>
                  </div>
                ) : (
                  <>
                    <Upload
                      className={cn(
                        "w-8 h-8 transition-colors",
                        isDragActive ? "text-primary" : "text-gray-400"
                      )}
                    />
                    <p className="text-sm text-center">
                      {audioSrc
                        ? "Replace audio file"
                        : "Drag & drop an audio file here, or click to select"}
                    </p>
                    {audioSrc && (
                      <p className="text-xs text-gray-500">
                        Current file: {audioSrc.slice(0, 20)}...
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  );
}; 