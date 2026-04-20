import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'custom_categories';

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // load on mount
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(data => setCustomCategories(data ? JSON.parse(data) : []));
  }, []);

  // add a new category
  const addCustomCategory = async (name: string) => {
    const updated = [...customCategories, name];
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    setCustomCategories(updated);
  };

  return { customCategories, addCustomCategory };
}