import React, { useRef, useState, useCallback } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Play, Pause, Edit, Upload, Loader2 } from "lucide-react";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import uploadMedia from "../Audio/upload";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { cn } from "../utils";
import { Textarea } from "../ui/textarea";
import { useDropzone } from "react-dropzone";

export interface AudioQuoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audioQuote: {
      setAudioQuote: (options: {
        src: string;
        quote: string;
        author: string;
      }) => ReturnType;
    };
  }
}

export const AudioQuote = Node.create<AudioQuoteOptions>({
  name: "audioQuote",

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
      quote: {
        default: "",
      },
      author: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="audio-quote"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, quote, author } = HTMLAttributes;
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-type": "audio-quote",
        class:
          "bg-secondary/20 p-8 rounded-lg flex items-center gap-6 relative",
      }),
      [
        "button",
        {
          class:
            "play-button h-16 w-16 rounded-full bg-primary hover:bg-secondary flex-shrink-0 absolute -top-8 -left-8",
        },
        [
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            class: "h-6 w-6 ml-1",
          },
          ["polygon", { points: "5 3 19 12 5 21 5 3" }],
        ],
      ],
      ["audio", { src: src || "", class: "hidden" }],
      [
        "div",
        { class: "flex-1 space-y-4" },
        [
          "blockquote",
          { class: "text-2xl leading-relaxed" },
          ["span", { class: "mr-1" }, '"'],
          quote || "No quote added yet",
          ["span", { class: "ml-1" }, '"'],
        ],
        ["cite", { class: "block text-right" }, `— ${author || "Unknown"}`],
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioQuoteNode as any);
  },

  addCommands() {
    return {
      setAudioQuote:
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

export const AudioQuoteNode: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  editor,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDialog, setShowDialog] = useState(!node.attrs.src);
  const [quote, setQuote] = useState(node.attrs.quote);
  const [author, setAuthor] = useState(node.attrs.author);
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
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [],
    },
    multiple: false,
  });

  const handleSubmit = () => {
    updateAttributes({ src: audioSrc || null, quote, author });
    setShowDialog(false);
  };

  const openDialog = () => {
    setQuote(node.attrs.quote);
    setAuthor(node.attrs.author);
    setAudioSrc(node.attrs.src);
    setShowDialog(true);
  };

  return (
    <NodeViewWrapper className="not-prose">
      <div className="relative bg-secondary/20 p-8 rounded-lg flex items-center gap-6">
        {node.attrs.src && (
          <audio
            ref={audioRef}
            src={node.attrs.src}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
        <Button
          onClick={togglePlay}
          className="h-16 w-16 rounded-full bg-primary flex-shrink-0 absolute -top-8 -left-8"
          size="icon"
          disabled={!node.attrs.src}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>
        <div className="flex-1 space-y-4">
          <blockquote className=" text-2xl leading-relaxed">
            <span className="mr-1">&quot;</span>
            {node.attrs.quote || "No quote added yet"}
            <span className="ml-1">&quot;</span>
          </blockquote>
          <cite className="block text-right ">
            — {node.attrs.author || "Unknown"}
          </cite>
        </div>
        {editor.isEditable && (
          <Button
            onClick={openDialog}
            className="absolute top-2 right-2 text-primary"
            variant="ghost"
            size="icon"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Audio Quote</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quote">Quote</Label>
              <Textarea
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Enter the quote text"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter the author's name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Audio File</Label>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
                  "flex flex-col items-center justify-center gap-2",
                  isDragActive
                    ? "border-[#EEAF2A] bg-[#EEAF2A]/5"
                    : "border-gray-3,00 hover:bor,der-,[#EEA,F2A]",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input {...getInputProps()} disabled={isUploading} />
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-[#EEAF2A]" />
                ) : (
                  <Upload
                    className={cn(
                      "w-8 h-8 transition-colors",
                      isDragActive ? "text-[#,EEAF2A]" : ",text,-gray,-400"
                    )}
                  />
                )}
                <p className="text-sm text-center">
                  {isUploading
                    ? "Uploading..."
                    : audioSrc
                    ? "Replace audio file"
                    : "Drag & drop an audio file here, or click to select"}
                </p>
                {audioSrc && !isUploading && (
                  <p className="text-xs text-gray-500">
                    Current file: {audioSrc.slice(0, 20)}...
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  );
};
