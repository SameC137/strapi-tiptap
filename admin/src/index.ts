import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

export default {
  register(app: any) {
   

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    app.customFields.register({
      name: "tiptap-content",
      type:"json",
      pluginId: PLUGIN_ID, 
      intlLabel: {
        id: "custom-field.tiptap-content.label",
        defaultMessage: "TipTap Editor",
      },
      intlDescription: {
        id: "custom-field.tiptap-content.description",
        defaultMessage: "A rich text editor using TipTap",
      },
      components: {
          Input: async () => import(/* webpackChunkName: "input-component" */ "./Input"),
        },
      options: {
        // Add any options if needed
      },
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
