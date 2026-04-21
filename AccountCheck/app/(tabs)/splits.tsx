import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../constants/api';
import { router } from 'expo-router';

// Show whole numbers as integers (333), fractions as 2 decimal places (333.67)
// This prevents ugly floats like 333.3333333333 from showing up
const formatAmount = (n: number): string => {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
};

export default function SplitsScreen() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/people/`)
      .then(res => setPeople(res.data))
      .catch(err => console.log(err));
  }, []);

  const owedToMe = people.filter(p => p.they_owe_me === true);
  const iOwe = people.filter(p => p.they_owe_me === false);

  const owedToMeTotal = owedToMe.reduce((sum, p) => sum + p.balance, 0);
  const iOweTotal = iOwe.reduce((sum, p) => sum + p.balance, 0);

  const renderPerson = (person) => (
    <TouchableOpacity
      key={person.name}
      style={styles.card}
      onPress={() => router.push(`/person/${person.name}`)}
    >
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {person.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{person.name}</Text>
        </View>
        <Text style={[styles.amount, person.they_owe_me ? styles.green : styles.red]}>
          ₹{formatAmount(person.balance)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Splits</Text>

      {/* Owed to Me */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>OWED TO ME</Text>
          <Text style={styles.green}>₹{formatAmount(owedToMeTotal)}</Text>
        </View>

        {owedToMe.length > 0 ? (
          owedToMe.map(renderPerson)
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>🎉 Nobody owes you anything</Text>
          </View>
        )}
      </View>

      {/* I Owe */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>I OWE</Text>
          <Text style={styles.red}>₹{formatAmount(iOweTotal)}</Text>
        </View>

        {iOwe.length > 0 ? (
          iOwe.map(renderPerson)
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>You're all settled up</Text>
          </View>
        )}
      </View>

      {people.length === 0 && (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🤝</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            No splits yet
          </Text>
          <Text style={{ color: '#4a5568', fontSize: 13, marginTop: 4 }}>
            Add a split expense to get started
          </Text>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080d1a',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#4a5568',
    fontWeight: '600',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#0f1629',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a2340',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
  },
  avatarText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  green: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: 14,
  },
  red: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 14,
  },
});