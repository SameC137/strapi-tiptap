import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "./components/input.css";
import { TooltipProvider } from "./components/ui/tooltip";
import Editor from "./components/editor";
interface InputProps {
  name: string;
  onChange: (e: { target: { name: string; value: any } }) => void;
  value: string;
  intlLabel: { id: string; defaultMessage: string };
  disabled?: boolean;
  error?: string;
  description?: { id: string; defaultMessage: string };
  required?: boolean;
}

const TipTapEditor: React.FC<InputProps> = ({
  name,
  onChange,
  value,
  intlLabel,
  disabled,
  error,
  description,
  required,
}) => {
  // const editor = useEditor({
  //   extensions: [StarterKit],
  //   immediatelyRender: true,
  //   content: value,
  //   onUpdate: ({ editor }) => {
  //     const html = editor.getJSON().text;
  //     onChange({ target: { name, value: html } });
  //   },
  // });

  return (
    <div>
      <label htmlFor={name}>{intlLabel?.defaultMessage}</label>
      {required && <span>*</span>}
      {/* <EditorContent editor={editor} disabled={disabled} /> */}
      <TooltipProvider>
        <Editor
          value={value}
          onChange={(e) => {
            onChange({ target: { name, value: e } });
          }}
          className="w-full"
          placeholder="Type your content here"
        />
        {error && <p>{error}</p>}
        {description && <p>{description?.defaultMessage}</p>}
      </TooltipProvider>
    </div>
  );
};

export default TipTapEditor;
