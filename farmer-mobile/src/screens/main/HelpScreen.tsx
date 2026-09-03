import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  ScreenContainer,
  AppText,
  HelpHeader,
  HelpTopicCard,
  FaqItem,
  ContactSupportCard,
  EmergencyAssistanceCard,
} from '../../components';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';

type NavigationProps = NativeStackNavigationProp<MainStackParamList, 'Help'>;

interface FaqData {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqData[] = [
  {
    id: 'faq_1',
    category: 'Booking',
    question: 'How do I book a procurement delivery slot?',
    answer:
      'Navigate to "Book Slot" from the dashboard. Select your allocated Procurement Centre, choose your crop type, enter the declared quantity in Quintals, pick an available calendar date and operating time window, and confirm your booking.',
  },
  {
    id: 'faq_2',
    category: 'Queue Token',
    question: 'What is my digital queue token (e.g. A-001)?',
    answer:
      'When your slot booking is confirmed, the system automatically assigns a digital intake token. You can present this digital pass on your mobile screen at the centre weighbridge gate for entry verification.',
  },
  {
    id: 'faq_3',
    category: 'Queue Tracking',
    question: "How does the live queue tracker and 'People Ahead' work?",
    answer:
      'The Live Queue screen synchronizes with the procurement centre intake lane. It shows the token currently being served, your position in line, and the number of farmers ahead of you.',
  },
  {
    id: 'faq_4',
    category: 'Weighment',
    question: 'Where can I view my gross and net weighment records?',
    answer:
      'Tap "Procurements" on the dashboard or menu and select your intake slip. You can inspect the verified net weight, weighment moisture percentage, and operator timestamp recorded at the weighbridge.',
  },
  {
    id: 'faq_5',
    category: 'Quality Grading',
    question: 'How is quality grading (FAQ Grade A/B/C) determined?',
    answer:
      'After gross weighment, the authorized quality assayer inspects a representative produce sample for moisture percentage, foreign matter, and broken grains to assign the official Fair Average Quality (FAQ) grade.',
  },
  {
    id: 'faq_6',
    category: 'DBT Payment',
    question: 'When and how will my DBT payment be credited?',
    answer:
      'Once your quality grading is certified and the intake slip is approved, a payment voucher is generated. The settlement amount is credited directly to your registered bank account via Direct Benefit Transfer (DBT).',
  },
  {
    id: 'faq_7',
    category: 'Notifications',
    question: 'How do in-app notifications and alerts work?',
    answer:
      'You receive alerts for slot confirmations, queue token generation, intake completion, and DBT disbursement vouchers. Tap the bell icon on the top header to view the Notification Center.',
  },
  {
    id: 'faq_8',
    category: 'Profile',
    question: 'How can I view my registered farmer information?',
    answer:
      'Tap your greeting or name on the dashboard header, or navigate to "Profile" to view your verified Farmer Registration Code (e.g. FAR-000001), mobile number, village, district, and registered farm address.',
  },
  {
    id: 'faq_9',
    category: 'Rescheduling',
    question: 'What should I do if I cannot arrive during my scheduled slot?',
    answer:
      'If you cannot make your scheduled window, your token will remain valid until the end of that day’s operating hours. If missed entirely, you can easily schedule a new delivery slot from the "Book Slot" screen.',
  },
  {
    id: 'faq_10',
    category: 'Account',
    question: 'How do I securely sign out of my account?',
    answer:
      'Open the "Profile" screen, scroll down to the bottom, and tap "Sign Out". Confirming the dialog will securely clear your session tokens from encrypted keystore storage and return you to the login screen.',
  },
];

export const HelpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Booking', 'Queue Token', 'Weighment', 'DBT Payment'];

  const filteredFaqs = selectedCategory === 'ALL'
    ? FAQS
    : FAQS.filter((f) => f.category.toLowerCase().includes(selectedCategory.toLowerCase()) || f.category === selectedCategory);

  return (
    <ScreenContainer
      scrollable
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AppText variant="body" weight="bold" color={theme.colors.primaryDark}>
            ← Back
          </AppText>
        </TouchableOpacity>

        <AppText variant="h3" weight="bold">
          Help & Support
        </AppText>

        <View style={styles.placeholderBox} />
      </View>

      {/* Main Guidance Banner */}
      <HelpHeader />

      {/* Quick Navigation Topics */}
      <View style={styles.sectionBlock}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold" style={styles.sectionHeader}>
          QUICK TOPICS
        </AppText>

        <HelpTopicCard
          title="Slot Booking Guide"
          icon="📅"
          description="How to schedule delivery slots & select centres"
          onPress={() => navigation.navigate('BookSlot')}
        />

        <HelpTopicCard
          title="Live Queue & Token Guide"
          icon="🎫"
          description="How digital tokens and intake lanes operate"
          onPress={() => navigation.navigate('Queue')}
        />

        <HelpTopicCard
          title="Intake & Weighment Guide"
          icon="⚖️"
          description="Weighbridge slips, quality grading & settlement"
          onPress={() => navigation.navigate('Procurements')}
        />
      </View>

      {/* FAQ Category Filter */}
      <View style={styles.sectionBlock}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold" style={styles.sectionHeader}>
          FREQUENTLY ASKED QUESTIONS
        </AppText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.75}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  color={isActive ? theme.colors.textInverse : theme.colors.textSecondary}
                >
                  {cat === 'ALL' ? 'All Questions' : cat}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FAQ Accordion Items */}
        <View style={styles.faqList}>
          {filteredFaqs.map((faq) => (
            <FaqItem
              key={faq.id}
              category={faq.category}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </View>
      </View>

      {/* Procurement Centre On-Ground Support Card */}
      <ContactSupportCard />

      {/* Emergency & Safety Notice Card */}
      <EmergencyAssistanceCard />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  placeholderBox: {
    width: 50,
  },
  sectionBlock: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    marginBottom: theme.spacing.xs,
    marginLeft: 2,
  },
  categoryScroll: {
    gap: theme.spacing.xs,
    paddingVertical: 4,
    marginBottom: theme.spacing.sm,
  },
  categoryChip: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  faqList: {
    gap: 0,
  },
});

export default HelpScreen;
