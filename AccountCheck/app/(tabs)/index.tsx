import { 
  StyleSheet, Text, View, ScrollView, 
  StatusBar, TouchableOpacity, Animated 
} from 'react-native';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from '../../constants/api';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const CATEGORY_META = {
  Food:          { icon: '🍔', color: '#FF6B6B' },
  Travel:        { icon: '✈️', color: '#45B7D1' },
  Rent:          { icon: '🏠', color: '#4ECDC4' },
  Entertainment: { icon: '🎬', color: '#A78BFA' },
  Health:        { icon: '💊', color: '#34D399' },
  Shopping:      { icon: '🛍️', color: '#FBBF24' },
  Utilities:     { icon: '⚡', color: '#60A5FA' },
  Other:         { icon: '💰', color: '#9CA3AF' },
};

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];



const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const HERO_HEIGHT = 280;

export default function HomeScreen() {
  const [summary, setSummary] = useState({
    total_spent: 0,
    total_income: 0,
    owed_to_me: 0,
    i_owe: 0,
    spending_by_category: {},
  });
  const [transactions, setTransactions] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

const goToPrevMonth = () => {
  if (currentMonth === 1) {
    setCurrentMonth(12);
    setCurrentYear(currentYear - 1);
  } else {
    setCurrentMonth(currentMonth - 1);
  }
};

const goToNextMonth = () => {
  if (currentMonth === 12) {
    setCurrentMonth(1);
    setCurrentYear(currentYear + 1);
  } else {
    setCurrentMonth(currentMonth + 1);
  }
};




useEffect(() => {
  axios.get(`${API_BASE}/summary?month=${currentMonth}&year=${currentYear}`)
    .then(res => setSummary(res.data))
    .catch(err => console.log(err));
  axios.get(`${API_BASE}/transactions/?month=${currentMonth}&year=${currentYear}`)
    .then(res => setTransactions(res.data))
    .catch(err => console.log(err));
}, [currentMonth, currentYear]);

  // Hero card shrinks as you scroll
  const heroHeight = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [HERO_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Mini header appears as hero disappears
  const miniHeaderOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT / 2, HERO_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const groupByDate = (transactions) => {
  const groups = {};
  transactions.forEach(t => {
    const date = t.transaction_date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
  });
  return groups;
};

const grouped = groupByDate(transactions);

const formatGroupDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Sticky top bar */}
      <View style={styles.stickyBar}>
  <Text style={styles.appName}>Account Check</Text>
  <Animated.Text style={[styles.miniAmount, { opacity: miniHeaderOpacity }]}>
    ₹{summary.total_spent.toLocaleString('en-IN')}
  </Animated.Text>
</View>

{/* Month Navigator — add this below stickyBar, inside fixedTop */}
<View style={{ 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'center',
  marginBottom: 16,
}}>
  <TouchableOpacity onPress={goToPrevMonth} style={{ padding: 8 }}>
    <Text style={{ color: '#3B82F6', fontSize: 18, fontWeight: '600' }}>‹</Text>
  </TouchableOpacity>
  <Text style={{ 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600',
    marginHorizontal: 16,
    letterSpacing: 0.5,
  }}>
    {monthNames[currentMonth - 1]} {currentYear}
  </Text>
  <TouchableOpacity onPress={goToNextMonth} style={{ padding: 8 }}>
    <Text style={{ color: '#3B82F6', fontSize: 18, fontWeight: '600' }}>›</Text>
  </TouchableOpacity>
</View>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Card — animates out on scroll */}
        <Animated.View style={{
          height: heroHeight,
          opacity: heroOpacity,
          overflow: 'hidden',
          marginHorizontal: 20,
          marginBottom: 8,
        }}>
          <LinearGradient
            colors={['#1a3a6e', '#0f2554', '#0a1a3e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <Text style={styles.heroLabel}>TOTAL SPENT</Text>
            <Text style={styles.heroAmount}>
              ₹{summary.total_spent.toLocaleString('en-IN')}
            </Text>

            {/* Expense | Income */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>EXPENSE</Text>
                <Text style={[styles.statValue, { color: '#f87171' }]}>
                  -₹{summary.total_spent.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>INCOME</Text>
                <Text style={[styles.statValue, { color: '#4ade80' }]}>
                  +₹{summary.total_income.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Owed to Me | I Owe */}
            <View style={styles.owedRow}>
              <TouchableOpacity
                style={styles.owedButton}
                onPress={() => router.push('/splits?filter=owed_to_me')}
              >
                <Text style={styles.owedLabel}>OWED TO ME</Text>
                <Text style={[styles.owedValue, { color: '#4ade80' }]}>
                  ₹{summary.owed_to_me.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity
                style={styles.owedButton}
                onPress={() => router.push('/splits?filter=i_owe')}
              >
                <Text style={styles.owedLabel}>I OWE</Text>
                <Text style={[styles.owedValue, { color: '#f87171' }]}>
                  ₹{summary.i_owe.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Transactions */}
{Object.keys(grouped).length === 0 && (
  <View style={{ 
    alignItems: 'center', 
    paddingTop: 60,
    paddingBottom: 40,
  }}>
    <Text style={{ fontSize: 40, marginBottom: 12 }}>💸</Text>
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
      No transactions
    </Text>
    <Text style={{ color: '#4a5568', fontSize: 13, marginTop: 4 }}>
      {monthNames[currentMonth - 1]} {currentYear} is empty
    </Text>
  </View>
)}
{Object.entries(grouped)

  .sort(([a], [b]) => new Date(b) - new Date(a))
  .map(([date, txns]) => (
    <View key={date}>
      {/* Date header */}
      <Text style={{
        color: '#4a5568',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}>
        {formatGroupDate(date)}
      </Text>
      
      {/* Transactions for this date */}
      <View style={styles.txContainer}>
        {txns.map((t, index) => {
          const meta = CATEGORY_META[t.category] || CATEGORY_META['Other'];
          return (
            <View key={t.id} style={[
              styles.txRow,
              index === txns.length - 1 && { borderBottomWidth: 0 }
            ]}>
              <View style={[styles.txIcon, { backgroundColor: meta.color + '22' }]}>
                <Text style={{ fontSize: 20 }}>{meta.icon}</Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{t.description || t.category}</Text>
                <Text style={styles.txMeta}>{t.category}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[
                  styles.txAmount,
                  { color: t.type === 'income' ? '#4ade80' : '#f87171' }
                ]}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </Text>
                {t.is_split && <Text style={styles.splitBadge}>split</Text>}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  ))
}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080d1a',
  },
stickyBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 60,
  paddingBottom: 12,
  backgroundColor: '#080d1a',
  zIndex: 10,              // ← add this
  elevation: 10,           // ← add this (Android)
},
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  miniAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    height: HERO_HEIGHT,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59,130,246,0.08)',
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59,130,246,0.05)',
    bottom: -40,
    left: -20,
  },
  heroLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 14,
  },
  owedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
  },
  owedButton: {
    flex: 1,
  },
  owedLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  owedValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  owedArrow: {
    fontSize: 12,
    fontWeight: '600',
  },
  txSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  txContainer: {
    backgroundColor: '#0f1629',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#141d35',
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 3,
  },
  txMeta: {
    fontSize: 12,
    color: '#4a5568',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  splitBadge: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 3,
    textTransform: 'uppercase',
  },
});