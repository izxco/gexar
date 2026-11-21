// Offline client stub (GEXAR FIT operates 100% locally via MMKV)
export const api = {
  api: {
    me: {
      $get: async () => ({ ok: true, json: async () => ({}) }),
    },
    signin: {
      $post: async () => ({ ok: true, json: async () => ({}) }),
    },
    templates: {
      $get: async () => ({ ok: true, json: async () => ({ items: [] }) }),
      $post: async () => ({ ok: true, json: async () => ({}) }),
      ":id": {
        $delete: async () => ({ ok: true, json: async () => ({}) }),
      },
    },
    workouts: {
      $get: async () => ({ ok: true, json: async () => ({ items: [] }) }),
      $post: async () => ({ ok: true, json: async () => ({}) }),
      ":id": {
        $delete: async () => ({ ok: true, json: async () => ({}) }),
      },
    },
    "food-entries": {
      $get: async () => ({ ok: true, json: async () => ({ items: [] }) }),
      $post: async () => ({ ok: true, json: async () => ({}) }),
      ":id": {
        $patch: async () => ({ ok: true, json: async () => ({}) }),
        $delete: async () => ({ ok: true, json: async () => ({}) }),
      },
    },
  },
} as any;
