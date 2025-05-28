import React, { useCallback, useState } from "react";

import RcTiptapEditor, {
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Color,
  ColumnActionButton,
  Emoji,
  FontFamily,
  FontSize,
  FormatPainter,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Iframe,
  Image,
  ImportWord,
  Indent,
  Italic,
  LineHeight,
  Link,
  MoreMark,
  OrderedList,
  SearchAndReplace,
  SlashCommand,
  Strike,
  Table,
  TaskList,
  TextAlign,
  Underline,
  Video,
  TableOfContents,
  TextDirection,
  Mention,
  Twitter,
} from "reactjs-tiptap-editor";
import { AudioNode } from "./Audio/Audio";
import { AudioQuote } from "./AudioQuote/AudioQuote";
import { BackgroundAudio } from "./BackgroundAudio/BackgroundAudio";

import "reactjs-tiptap-editor/style.css";
import ImageBlock from "./ImageBlock/ImageBlock";

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const extensions = [
  BaseKit.configure({
    multiColumn: true,
    placeholder: {
      showOnlyCurrent: true,
    },
    characterCount: {
      limit: 50_000,
    },
  }),
  History,
  SearchAndReplace,
  TextDirection,
  TableOfContents,
  FormatPainter.configure({ spacer: true }),
  Clear,
  FontFamily,
  Heading.configure({ spacer: true }),
  FontSize,
  Bold,
  Italic,
  Underline,
  Strike,
  MoreMark,
  Emoji,
  Color.configure({ spacer: true }),
  Highlight,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ["heading", "paragraph"], spacer: true }),
  Indent,
  LineHeight,
  TaskList.configure({
    spacer: true,
    taskItem: {
      nested: true,
    },
  }),
  Link,
  Image.configure({
    upload: (files: File) => {
      const formData = new FormData();
      formData.append(`files`, files, files.name);
      return fetch('/api/upload', {
        method: 'post',
        body: formData

      }).then((response) => response.json()).then((response) => `${location.hostname}${response.data[0].url}`);
    },
  }),
  Video.configure({
    upload: (files: File) => {
      const formData = new FormData();
      formData.append(`files`, files, files.name);
      return fetch('/api/upload', {
        method: 'post',
        body: formData

      }).then((response) => response.json()).then((response) => `${location.hostname}${response.data[0].url}`);
    },
  }),
  Blockquote.configure({ spacer: true }),
  SlashCommand,
  HorizontalRule,
  ColumnActionButton,
  Table,
  Iframe,
  ImportWord.configure({
    upload: (files: File[]) => {
      const f = files.map((file) => ({
        src: URL.createObjectURL(file),
        alt: file.name,
      }));
      return Promise.resolve(f);
    },
  }),
  Mention,
  Twitter,
  AudioNode.configure(),
  AudioQuote.configure(),
  BackgroundAudio.configure(),
  ImageBlock
];

const DEFAULT = "";

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function Editor({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: any) => void;
  placeholder?: string;
  className: string;
}) {
  const [content, setContent] = useState(DEFAULT);
  const refEditor = React.useRef<any>(null);

  const [theme, setTheme] = useState("light");
  const [disable, setDisable] = useState(false);

  const onValueChange = useCallback(
    debounce((value: any) => {
      setContent(value);
      onChange(value);
    }, 300),
    []
  );

  return (
    <main
      style={{
        padding: "0 20px",
      }}
      className={className}
    >
      <div
        style={{
          maxWidth: 1024,
          margin: "88px auto 120px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: 10,
          }}
          className="buttonWrap"
        >
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button onClick={() => setDisable(!disable)}>
            {disable ? "Editable" : "Readonly"}
          </button>
        </div>
        <RcTiptapEditor
          ref={refEditor}
          output="json"
          content={value}
          onChangeContent={onValueChange}
          extensions={extensions}
          dark={theme === "dark"}
          disabled={disable}
        />
      </div>
    </main>
  );
}

export default Editor;
