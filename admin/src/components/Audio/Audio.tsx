import { Node, mergeAttributes } from "@tiptap/core";
import React, { useState } from "react";
import {
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
  NodeViewProps,
} from "@tiptap/react";
import uploadMedia from "./upload";

interface AudioNodeAttributes {
  src: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audioNode: {
      setAudioUpload: () => ReturnType;
    };
  }
}

// Define the AudioNode extension
export const AudioNode = Node.create<{ src: string | null }>({
  name: "audioNode",

  group: "block",

  atom: true,

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
        tag: `audio[data-audio][data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "audio",
      mergeAttributes(
        HTMLAttributes,
        { controls: true, "data-audio": true },
        { "data-type": this.name },
      ),
    ];
  },

  addCommands() {
    return {
      setAudioUpload:
        () =>
        ({ commands }) =>
          commands.insertContent(
            `<audio src="" data-type="${this.name}" data-audio></audio></>`,
          ),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioComponent);
  },
});

const AudioComponent: React.FC<NodeViewProps> = (props) => {
  const [audioSrc, setAudioSrc] = useState<string>(props.node.attrs.src || "");

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      const url = await uploadMedia(file);
      setAudioSrc(url);
      props.updateAttributes({ src: url });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      const url = await uploadMedia(file);
      setAudioSrc(url);
      props.updateAttributes({ src: url });
    }
  };

  return (
    <NodeViewWrapper>
      {audioSrc ? (
        <audio controls src={audioSrc} style={{ width: "100%" }}></audio>
      ) : (
        <div
          style={{
            border: "2px dashed #ccc",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p>Drag and drop an audio file here, or click to upload</p>
          <input
            type="file"
            accept="audio/*"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </div>
      )}
    </NodeViewWrapper>
  );
};
