import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, ScrollView, StatusBar,
  Alert, Modal, FlatList,
} from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/constants/api';
import { CATEGORY_META } from '@/constants/categories';
import { useCustomCategories } from '@/hooks/useCustomCategories';
import { useSplitContacts } from '@/hooks/useSplitContacts';

const TYPES = ['expense', 'income'];

// Each split person has a name and optional amount
type SplitPerson = { name: string; amount: string };

export default function AddExpenseScreen() {

  // ── Form state ──────────────────────────────
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [type, setType] = useState('expense');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Split state ─────────────────────────────
  const [isSplit, setIsSplit] = useState(false);
  const [splitPeople, setSplitPeople] = useState<SplitPerson[]>([]);

  // ── Split modal state ───────────────────────
  const [splitModalVisible, setSplitModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNameInput, setNewNameInput] = useState('');

  // ── Hooks ───────────────────────────────────
  const { customCategories, addCustomCategory } = useCustomCategories();
  const { contacts, addContact, getSuggestions } = useSplitContacts();

  // ── Filtered contacts based on search ───────
  // If searchQuery is empty → show all, else filter by what user typed
  const filteredContacts = searchQuery.trim()
    ? getSuggestions(searchQuery)
    : contacts;

  // ── Toggle a person in/out of split list ────
  // If already selected → remove them
  // If not selected → add them with empty amount
  const togglePerson = (name: string) => {
    const exists = splitPeople.find(p => p.name === name);
    if (exists) {
      setSplitPeople(splitPeople.filter(p => p.name !== name));
    } else {
      setSplitPeople([...splitPeople, { name, amount: '' }]);
    }
  };

  // ── Check if a person is selected ───────────
  const isSelected = (name: string) =>
    splitPeople.some(p => p.name === name);

  // ── Update amount for a specific person ─────
  const updateAmount = (name: string, amount: string) => {
    setSplitPeople(splitPeople.map(p =>
      p.name === name ? { ...p, amount } : p
    ));
  };

  // ── Add a brand new contact ──────────────────
  const handleAddNewContact = async () => {
    const trimmed = newNameInput.trim();
    if (!trimmed) return;
    await addContact(trimmed);
    // auto-select them after adding
    setSplitPeople([...splitPeople, { name: trimmed, amount: '' }]);
    setNewNameInput('');
  };

  // ── Remove a person tag ──────────────────────
  const removePerson = (name: string) => {
    setSplitPeople(splitPeople.filter(p => p.name !== name));
  };

  // ── Submit handler ───────────────────────────
  const handleSubmit = async () => {
    const finalCategory = category === 'Other'
      ? customCategoryInput.trim()
      : category;

    if (!amount) return Alert.alert('Missing amount', 'Please enter an amount');
    if (!finalCategory) return Alert.alert('Missing category', 'Please enter a category name');

    try {
      const body = {
        amount: parseFloat(amount),
        description,
        category: finalCategory,
        type,
        is_split: isSplit,
        your_share: null,
        paid_by_me: true,
        transaction_date: new Date().toISOString().split('T')[0],
        split_with: isSplit
          ? splitPeople
            .filter(p => p.name.trim() !== '')
            .map(p => p.amount
              ? { name: p.name.trim(), amount: parseFloat(p.amount) }
              : p.name.trim()
            )
          : null,
      };

      await axios.post(`${API_BASE}/transactions/`, body);

      // save custom category if needed
      if (category === 'Other' && customCategoryInput.trim()) {
        await addCustomCategory(customCategoryInput.trim());
      }

      // save all split contacts
      for (const person of splitPeople) {
        if (person.name.trim()) {
          await addContact(person.name.trim());
        }
      }

      // reset form
      setIsSuccess(true);
      setMessage('Added successfully!');
      setAmount('');
      setDescription('');
      setCategory('Food');
      setCustomCategoryInput('');
      setSplitPeople([]);
      setIsSplit(false);
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      setIsSuccess(false);
      setMessage('Something went wrong. Please try again.');
    }
  };

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Transaction</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Amount */}
        <Text style={styles.label}>AMOUNT (₹)</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor="#2d3a55"
        />

        {/* Description */}
        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Dinner, rent, movie..."
          placeholderTextColor="#2d3a55"
        />

        {/* Type */}
        <Text style={styles.label}>TYPE</Text>
        <View style={styles.chipRow}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[
                styles.chip,
                type === t && (t === 'expense' ? styles.chipRed : styles.chipGreen)
              ]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                {t === 'expense' ? '− Expense' : '+ Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.chipWrap}>
          {Object.keys(CATEGORY_META)
            .filter(cat => cat !== 'Other')
            .map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {CATEGORY_META[cat].icon} {cat}
                </Text>
              </TouchableOpacity>
            ))}

          {/* Custom categories */}
          {customCategories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                ⭐ {cat}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Other */}
          <TouchableOpacity
            style={[styles.chip, category === 'Other' && styles.chipActive]}
            onPress={() => setCategory('Other')}
          >
            <Text style={[styles.chipText, category === 'Other' && styles.chipTextActive]}>
              💰 Other
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom category input */}
        {category === 'Other' && (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Enter custom category name"
            placeholderTextColor="#2d3a55"
            value={customCategoryInput}
            onChangeText={setCustomCategoryInput}
          />
        )}

        {/* Split toggle */}
        <View style={styles.splitToggleRow}>
          <View>
            <Text style={styles.splitToggleLabel}>Split Expense</Text>
            <Text style={styles.splitToggleHint}>Divide with others</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, isSplit && styles.toggleActive]}
            onPress={() => setIsSplit(!isSplit)}
          >
            <Text style={[styles.toggleText, isSplit && styles.toggleTextActive]}>
              {isSplit ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Split section */}
        {isSplit && (
          <View style={styles.splitCard}>
            <Text style={styles.splitCardTitle}>Split with</Text>

            {/* Selected people as tags */}
            {splitPeople.length > 0 && (
              <View style={styles.tagRow}>
                {splitPeople.map(person => (
                  <View key={person.name} style={styles.personTag}>
                    <Text style={styles.personTagName}>{person.name}</Text>
                    <TouchableOpacity onPress={() => removePerson(person.name)}>
                      <Text style={styles.personTagRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Amount inputs for selected people */}
            {splitPeople.map(person => (
              <View key={person.name} style={styles.amountRow}>
                <Text style={styles.personAmountLabel}>{person.name}</Text>
                <TextInput
                  style={styles.personAmountInput}
                  placeholder="₹ amount (blank = equal)"
                  placeholderTextColor="#2d3a55"
                  keyboardType="numeric"
                  value={person.amount}
                  onChangeText={v => updateAmount(person.name, v)}
                />
              </View>
            ))}

            {/* Add people button */}
            <TouchableOpacity
              style={styles.addPersonBtn}
              onPress={() => setSplitModalVisible(true)}
            >
              <Text style={styles.addPersonText}>+ Add People</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Message */}
        {message !== '' && (
          <View style={[
            styles.messageBanner,
            isSuccess ? styles.messageBannerSuccess : styles.messageBannerError
          ]}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>
            {type === 'income' ? 'Add Income ↑' : 'Add Expense ↓'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Split People Bottom Sheet Modal ── */}
      <Modal
        visible={splitModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add People</Text>
              <TouchableOpacity onPress={() => {
                setSplitModalVisible(false);
                setSearchQuery('');
                setNewNameInput('');
              }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search box */}
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search saved names..."
              placeholderTextColor="#4a5568"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Saved contacts list */}
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {filteredContacts.length === 0 && (
                <Text style={styles.noContacts}>
                  {searchQuery ? 'No matches found' : 'No saved contacts yet'}
                </Text>
              )}
              {filteredContacts.map(name => (
                <TouchableOpacity
                  key={name}
                  style={styles.contactRow}
                  onPress={() => togglePerson(name)}
                >
                  {/* Avatar circle */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.contactName}>{name}</Text>

                  {/* Checkmark if selected */}
                  {isSelected(name) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Add new name */}
            <View style={styles.newNameRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add new name..."
                placeholderTextColor="#4a5568"
                value={newNameInput}
                onChangeText={setNewNameInput}
              />
              <TouchableOpacity
                style={styles.addNewBtn}
                onPress={handleAddNewContact}
              >
                <Text style={styles.addNewBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                setSplitModalVisible(false);
                setSearchQuery('');
              }}
            >
              <Text style={styles.confirmBtnText}>
                Confirm {splitPeople.length > 0 ? `(${splitPeople.length} selected)` : ''}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080d1a' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#080d1a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  scrollContent: { padding: 20 },
  label: {
    fontSize: 11,
    color: '#4a5568',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  amountInput: {
    backgroundColor: '#0f1629',
    borderRadius: 16,
    padding: 18,
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#141d35',
    borderRadius: 14,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
  },
  chipRow: { flexDirection: 'row', gap: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#141d35',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
  },
  chipActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  chipRed: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderColor: '#f87171',
  },
  chipGreen: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderColor: '#4ade80',
  },
  chipText: { color: '#4a5568', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  // Split toggle
  splitToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#0f1629',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
  },
  splitToggleLabel: { fontSize: 15, fontWeight: '700', color: '#e2e8f0' },
  splitToggleHint: { fontSize: 12, color: '#4a5568', marginTop: 2 },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#141d35',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
  },
  toggleActive: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderColor: '#3B82F6',
  },
  toggleText: { color: '#4a5568', fontSize: 13, fontWeight: '700' },
  toggleTextActive: { color: '#3B82F6' },

  // Split card
  splitCard: {
    backgroundColor: '#0f1629',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
    gap: 10,
  },
  splitCardTitle: { fontSize: 14, fontWeight: '700', color: '#e2e8f0' },

  // Person tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  personTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  personTagName: { color: '#3B82F6', fontWeight: '600', fontSize: 13 },
  personTagRemove: { color: '#f87171', fontSize: 13, fontWeight: '700' },

  // Amount inputs per person
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personAmountLabel: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    width: 70,
  },
  personAmountInput: {
    flex: 1,
    backgroundColor: '#141d35',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
  },

  addPersonBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
  },
  addPersonText: { color: '#3B82F6', fontWeight: '700', fontSize: 13 },

  // Message
  messageBanner: {
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  messageBannerSuccess: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  messageBannerError: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  messageText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Submit
  submitBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Split modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#0f1629',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  modalClose: { color: '#4a5568', fontSize: 22 },
  searchInput: {
    backgroundColor: '#141d35',
    borderRadius: 14,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
    marginBottom: 12,
  },
  noContacts: {
    color: '#4a5568',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.08)',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#3B82F6', fontWeight: '700', fontSize: 15 },
  contactName: { flex: 1, color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  checkmark: { color: '#4ade80', fontSize: 18, fontWeight: '700' },

  newNameRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  addNewBtn: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  addNewBtnText: { color: '#3B82F6', fontWeight: '700', fontSize: 14 },
  confirmBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});