import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The key we use to store names in AsyncStorage (phone's local storage)
const KEY = 'split_contacts';

export function useSplitContacts() {
  // This state holds the list of saved names, e.g. ["Rahul", "Priya", "Sam"]
  const [contacts, setContacts] = useState<string[]>([]);

  // Load saved contacts from phone storage when the hook is first used
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(data => setContacts(data ? JSON.parse(data) : []));
  }, []);

  // Save a new contact name — only if it doesn't already exist (case-insensitive)
  // IMPORTANT: reads fresh from AsyncStorage each time, NOT from state.
  // Why: if called in a loop (saving 2+ names), React state updates are async/batched.
  // Both calls would see the same OLD state and the second name's duplicate check
  // would run against a list that doesn't yet include the first name.
  // Reading from AsyncStorage gives us the actual current data every time.
  const addContact = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Always read fresh from storage — avoids stale closure in loops
    const raw = await AsyncStorage.getItem(KEY);
    const current: string[] = raw ? JSON.parse(raw) : [];

    // Case-insensitive duplicate check
    const alreadyExists = current.some(
      c => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (!alreadyExists) {
      const updated = [...current, trimmed];
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      setContacts(updated); // keep React state in sync for the UI
    }
  };

  // Utility: given what the user has typed so far, return matching saved names
  // e.g. typed "ra" → returns ["Rahul", "Ramesh"]
  const getSuggestions = (query: string): string[] => {
    if (!query.trim()) return contacts; // show all if nothing typed
    return contacts.filter(c =>
      c.toLowerCase().startsWith(query.toLowerCase())
    );
  };

  return { contacts, addContact, getSuggestions };
}
