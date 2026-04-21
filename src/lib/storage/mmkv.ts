import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({ id: "ironforge" });

export function createMMKVStorage() {
  return {
    getItem: (name: string) => {
      const value = storage.getString(name);
      return value ?? null;
    },
    setItem: (name: string, value: string) => {
      storage.set(name, value);
    },
    removeItem: (name: string) => {
      storage.remove(name);
    },
  };
}
