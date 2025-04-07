# @samemichaeltadele/tiptap-editor

A Strapi v5 plugin that integrates a tiptap rich text editor using [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor) as its foundation.

## Features

- Rich text editing capabilities powered by TipTap
- Modern UI components from reactjs-tiptap-editor
- Full compatibility with Strapi v5
- Code block support with syntax highlighting
- Typography extensions
- Image zoom functionality
- Dark mode support

## Installation

```bash
npm install @samemichaeltadele/tiptap-editor
```

## Configuration

1. Enable the plugin in your Strapi configuration:

```js
// config/plugins.js
module.exports = {
  'tiptap-editor': {
    enabled: true,
  }
};
```

2. Add the field type to your content-type:

```js
// content-types/your-content-type/schema.json
{
  "kind": "collectionType",
  "collectionName": "your_collection",
  "info": {
    "singularName": "your-content-type",
    "pluralName": "your-content-types",
    "displayName": "Your Content Type"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "yourTtype": {
      "type": "customField",
      "customField": "plugin::tiptap-editor.tiptap-content"
    },
  }
}
```

You can also add the field from the content type builder under the custom tab on the field selection dialog

## Dependencies

This plugin uses the following key dependencies:

- [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor) - Base editor implementation
- [@tiptap/starter-kit](https://tiptap.dev/docs/editor/api/kit) - Core TipTap functionality
- [@tiptap/extension-code-block-lowlight](https://tiptap.dev/docs/editor/api/nodes/code-block-lowlight) - Code block support
- [@tiptap/extension-typography](https://tiptap.dev/docs/editor/api/extensions/typography) - Typography features

## Requirements

- Strapi v5.x
- Node.js 16.x or later
- React 18.x

## License

MIT

## Author

[@samemichaeltadele](https://github.com/samemichaeltadele)
