import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { API_BASE } from '../../constants/api';
import { CATEGORY_META } from '../../constants/categories';

export default function GoalsScreen() {

  const monthLabel = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState({});
  const [spending, setSpending] = useState({});
  const [overallGoal, setOverallGoal] = useState(15000);
  const [totalSpent, setTotalSpent] = useState(0);
  const [overallModalVisible, setOverallModalVisible] = useState(false);
  const [overallInput, setOverallInput] = useState('');

  const handleSaveOverallGoal = async (amount: string) => {
  if (!amount) return;
  try {
    await AsyncStorage.setItem('overall_goal', amount);
    setOverallGoal(parseFloat(amount));
  } catch (err) {
    Alert.alert('Oops', 'Something went wrong. Please try again.');
  }
};

  const handleSave = async () => {
    if (!category) {
      Alert.alert('Oops', 'Please select a category');
      return;
    }
    if (!goal) {
      Alert.alert('Oops', 'Please enter a budget amount');
      return;
    }

    const updated = { ...budget, [category]: parseFloat(goal) };

    try {
      await AsyncStorage.setItem('user_budget', JSON.stringify(updated));
      setBudget(updated);
      setModalVisible(false);
      setCategory('');
      setGoal('');
    } catch (err) {
      Alert.alert('Oops', 'Something went wrong. Please try again.');
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('user_budget');
        setBudget(data ? JSON.parse(data) : {});
        // load overall goal from AsyncStorage
          const og = await AsyncStorage.getItem('overall_goal');
          setOverallGoal(og ? parseFloat(og) : 15000);



        const response = await axios.get(`${API_BASE}/summary`);
        setSpending(response.data.spending_by_category);
                  // get total_spent from API (already fetching /summary!)
          setTotalSpent(response.data.total_spent);
      } catch (err) {
        console.error('Failed to load data', err);
      }
    };
    loadData();
  }, []);

  function getProgress(spent: number, budget: number) {
    if (budget === 0) return 0;
    return Math.min(spent / budget, 1);
  }

  function getBarColor(progress: number) {
    if (progress >= 1) return '#f87171';
    if (progress >= 0.8) return '#FBBF24';
    return '#4ade80';
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.stickyBar}>
        <View>
          <Text style={styles.title}>Goals</Text>
          <Text style={styles.subtitle}>{monthLabel}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Set Budget</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

                    {/* Overall Goal Card */}
            <View style={styles.card}>
              
              {/* Top row: title + ✏️ button */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.categoryName}>💰 Monthly Goal</Text>
                <TouchableOpacity 
                style={styles.addButton}  // reuse your existing blue button style!
                onPress={() => {
                  setOverallInput(String(overallGoal));
                  setOverallModalVisible(true);
                }}>
                <Text style={styles.addButtonText}>Edit</Text>
              </TouchableOpacity>
              </View>

              {/* Amount row */}
              <Text style={styles.amountText}>
                ₹{totalSpent.toLocaleString('en-IN')}
                <Text style={styles.budgetText}> / ₹{overallGoal.toLocaleString('en-IN')}</Text>
              </Text>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {
                  width: `${getProgress(totalSpent, overallGoal) * 100}%`,
                  backgroundColor: getBarColor(getProgress(totalSpent, overallGoal))
                }]} />
              </View>

              <Text style={[styles.percentText, { color: getBarColor(getProgress(totalSpent, overallGoal)) }]}>
                {Math.round(getProgress(totalSpent, overallGoal) * 100)}%
              </Text>

            </View>

        {/* Empty state */}
        {Object.keys(budget).length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + Set Budget to set a monthly budget for a category
            </Text>
          </View>
        )}

        {/* Goal cards */}
        {Object.keys(budget).map(category => {
          const spent = spending[category] || 0;
          const budgetAmount = budget[category];
          const progress = getProgress(spent, budgetAmount);
          const barColor = getBarColor(progress);
          const meta = CATEGORY_META[category] || { icon: '💰', color: '#9CA3AF' };
          const isOver = progress >= 1;

          return (
            <View key={category} style={styles.card}>

              {/* Top row: icon + name | amount */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.iconBubble, { backgroundColor: meta.color + '22' }]}>
                    <Text style={{ fontSize: 18 }}>{meta.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category}</Text>
                  {isOver && (
                    <View style={styles.overBadge}>
                      <Text style={styles.overBadgeText}>Over</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.amountText}>
                  ₹{spent.toLocaleString('en-IN')}
                  <Text style={styles.budgetText}> / ₹{budgetAmount.toLocaleString('en-IN')}</Text>
                </Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[
                  styles.progressFill,
                  { width: `${progress * 100}%`, backgroundColor: barColor }
                ]} />
              </View>

              {/* Percentage */}
              <Text style={[styles.percentText, { color: barColor }]}>
                {Math.round(progress * 100)}%
              </Text>

            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            {/* Modal header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalTitle}>Set Budget</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setCategory('');
                setGoal('');
              }}>
                <Text style={{ color: '#4a5568', fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category picker */}
            <Text style={styles.modalLabel}>Pick a category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {Object.keys(CATEGORY_META).map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                >
                  <Text style={[styles.categoryChipText, category === cat && { color: '#fff' }]}>
                    {CATEGORY_META[cat].icon} {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount input */}
            <Text style={styles.modalLabel}>Monthly budget</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2000"
              placeholderTextColor="#4a5568"
              keyboardType="numeric"
              value={goal}
              onChangeText={setGoal}
            />

            {/* Save button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Budget</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* Overall Goal Modal */}
<Modal visible={overallModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>

      {/* Header with ✕ */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={styles.modalTitle}>Edit Monthly Goal</Text>
        <TouchableOpacity onPress={() => setOverallModalVisible(false)}>
          <Text style={{ color: '#4a5568', fontSize: 22 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <Text style={styles.modalLabel}>Monthly goal amount</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 15000"
        placeholderTextColor="#4a5568"
        keyboardType="numeric"
        value={overallInput}
        onChangeText={setOverallInput}
      />

      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={() => {
        handleSaveOverallGoal(overallInput);
        setOverallModalVisible(false);
      }}>
        <Text style={styles.saveButtonText}>Save Goal</Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080d1a',
  },
  stickyBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#080d1a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#4a5568',
    marginTop: 4,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  addButtonText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 13,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#4a5568',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  // Goal card
  card: {
    backgroundColor: '#0f1629',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  overBadge: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  overBadgeText: {
    fontSize: 11,
    color: '#f87171',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  budgetText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '400',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#141d35',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },

  // Modal
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  modalLabel: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#141d35',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
  },
  categoryChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#141d35',
    borderRadius: 14,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});