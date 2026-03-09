// src/profile.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../src/supabase'
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getProfile,
  updateProfile,
  getProfileStats,
} from "../src/api/profile.api"
import * as ImagePicker from 'expo-image-picker';
import { getDeletedHistory } from "../src/api/product.api";
import { deleteAccount as deleteAccountAPI } from "../src/api/auth.api";


export default function ProfilePage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const [totalItems, setTotalItems] = useState(0);
  const [nearExpireItems, setNearExpireItems] = useState(0);
  const [expiredItems, setExpiredItems] = useState(0);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'ALL' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // 🔥 temp state for confirm before apply
  const [tempMonth, setTempMonth] = useState<number | null>(null);
  const [tempYear, setTempYear] = useState<number | null>(null);
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
        setEmail(user.email ?? '');

        const profile = await getProfile(token);
        setFullName(profile.full_name ?? '');
        setAvatarUrl(profile.avatar_url ?? null);

        const stats = await getProfileStats(token);
        setTotalItems(stats.total ?? 0);
        setNearExpireItems(stats.near ?? 0);
        setExpiredItems(stats.expired ?? 0);

        // ✅ Load history
        setLoadingHistory(true);
        const history = await getDeletedHistory(token);
        setHistoryData(history ?? []);
        setLoadingHistory(false);

      } catch (err) {
        console.log("Fetch profile error:", err);
      }
    };

    fetchProfileAndStats();
  }, []);


  const handleChangeAvatar = async () => {
    try {
      if (!userId) return;

      // Request permission
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Please allow access to photos');
        return;
      }

      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const image = result.assets[0];
      const response = await fetch(image.uri);
      const arrayBuffer = await response.arrayBuffer();

      const fileExt = image.uri.split('.').pop() ?? 'jpg';
      const fileName = `${userId}.${fileExt}`;

      // Upload to Supabase Storage (using arrayBuffer instead of blob to fix 0 bytes issue in React Native)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          upsert: true,
          contentType: image.type ?? 'image/jpeg',
        });

      if (uploadError) {
        console.log(uploadError);
        alert('Failed to upload image');
        return;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Update profiles table via backend API
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      await updateProfile(token, { avatar_url: publicUrl });

      // Add query param to prevent cache and reload image immediately
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
      alert('Profile picture updated successfully');
    } catch (err) {
      console.log(err);
      alert('An error occurred');
    }
  };

  const handleUpdateName = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      await updateProfile(token, { full_name: fullName });
      alert('Name updated successfully');
    } catch (error) {
      alert('Failed to update name');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();

      // reset local states
      setUserId(null);
      setAvatarUrl(null);
      setFullName('');
      setEmail('');
      setTotalItems(0);
      setNearExpireItems(0);
      setExpiredItems(0);

      // Navigate to Load / Login page
      router.replace('/');
    } catch (error) {
      alert('Failed to sign out');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              const token = sessionData?.session?.access_token;
              if (!token) {
                alert('Authentication token not found');
                return;
              }

              await deleteAccountAPI(token);
              
              // Sign out and clear local data
              await supabase.auth.signOut();
              setUserId(null);
              setAvatarUrl(null);
              setFullName('');
              setEmail('');
              setTotalItems(0);
              setNearExpireItems(0);
              setExpiredItems(0);

              alert('Account deleted successfully');
              router.replace('/');
            } catch (error: any) {
              alert(error.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const filteredHistory = historyData.filter((item) => {
    const matchesSearch =
      item.product_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

    const itemDate = new Date(item.deleted_at);
    let matchesDate = true;

    if (selectedRange === 'WEEK') {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today
      
      const startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0); // Start of day 7 days ago

      matchesDate =
        itemDate >= startDate &&
        itemDate <= now;
    }

    if (selectedRange === 'MONTH') {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today
      
      const startDate = new Date();
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0); // Start of day 30 days ago

      matchesDate =
        itemDate >= startDate &&
        itemDate <= now;
    }

    if (
      selectedRange === 'CUSTOM' &&
      selectedMonth !== null &&
      selectedYear !== null
    ) {
      matchesDate =
        itemDate.getMonth() === selectedMonth &&
        itemDate.getFullYear() === selectedYear;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <LinearGradient
      colors={['#BFEFFF', '#E8D5FF', '#F5D0FE']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#5A6AE0" />
          </TouchableOpacity>
        </View>

        {/* My Profile Title */}
        <View style={styles.titleContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleBadge}
          >
            <Text style={styles.headerTitle}>My Profile</Text>
          </LinearGradient>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCardWrapper}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#C4B5FD', '#A78BFA', '#8B5CF6']}
              style={styles.avatar}
            >
              <View style={styles.avatarInner}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 76, height: 76, borderRadius: 38 }}
                  />
                ) : (
                  <Ionicons name="person-circle" size={76} color="#A78BFA" />
                )}
              </View>
            </LinearGradient>
            <TouchableOpacity
              onPress={handleChangeAvatar}
              style={styles.editIcon}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <LinearGradient
            colors={['rgba(147, 197, 253, 0.8)', 'rgba(196, 181, 253, 0.6)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isEditingName ? (
                <>
                  <TextInput
                    style={[styles.userName, { borderBottomWidth: 1, borderColor: '#A78BFA' }]}
                    value={fullName}
                    onChangeText={setFullName}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={async () => {
                      await handleUpdateName();
                      setIsEditingName(false);
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color="#7C3AED" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.userName}>
                    {fullName || 'Name not set'}
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditingName(true)}>
                    <Ionicons name="pencil" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalItems}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{nearExpireItems}</Text>
                <Text style={styles.statLabel}>Near Expiry</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{expiredItems}</Text>
                <Text style={styles.statLabel}>Expired</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* History Section */}
        <View style={styles.historySectionWrapper}>
          <LinearGradient
            colors={['rgba(233, 213, 255, 0.8)', 'rgba(196, 181, 253, 0.6)']}
            style={styles.historySection}
          >
            <View style={styles.historyHeader}>
              <Ionicons name="time" size={20} color="#7C3AED" />
              <Text style={styles.historyTitle}>History</Text>
            </View>

            {/* Search with icon */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#A78BFA" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search product name..."
                placeholderTextColor="#A78BFA"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Filters */}
            <View style={styles.quickFilterContainer}>
              {[
                { label: 'All', value: 'ALL' },
                { label: '7 Days Ago', value: 'WEEK' },
                { label: '30 Days Ago', value: 'MONTH' },
                {
                  label:
                    selectedMonth !== null && selectedYear !== null
                      ? `${monthNames[selectedMonth]} ${selectedYear}`
                      : 'Select Month',
                  value: 'CUSTOM'
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.quickFilterButton,
                    selectedRange === item.value &&
                    styles.quickFilterButtonActive,
                  ]}
                  onPress={() => {
                    if (item.value === 'CUSTOM') {
                      setTempMonth(
                        selectedMonth !== null
                          ? selectedMonth
                          : new Date().getMonth()
                      );
                      setTempYear(
                        selectedYear !== null
                          ? selectedYear
                          : new Date().getFullYear()
                      );
                      setIsMonthModalVisible(true);
                    } else {
                      setSelectedRange(item.value as any);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.quickFilterText,
                      selectedRange === item.value &&
                      styles.quickFilterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>


            <Modal
              visible={isMonthModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setIsMonthModalVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setIsMonthModalVisible(false)}>
                <View style={styles.sheetBackdrop} />
              </TouchableWithoutFeedback>
              <View style={styles.sheetContainer}>
                <View style={styles.dragIndicator} />
                <Text style={styles.modalTitle}>Select Month</Text>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                  <Picker
                    style={{ flex: 1 }}
                    itemStyle={{ color: '#111827' }}
                    selectedValue={tempMonth ?? new Date().getMonth()}
                    onValueChange={(value) => setTempMonth(value)}
                  >
                    {monthNames.map((name, index) => (
                      <Picker.Item key={index} label={name} value={index} />
                    ))}
                  </Picker>

                  <Picker
                    style={{ flex: 1 }}
                    itemStyle={{ color: '#111827' }}
                    selectedValue={tempYear ?? new Date().getFullYear()}
                    onValueChange={(value) => setTempYear(value)}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <Picker.Item key={year} label={`${year}`} value={year} />
                      );
                    })}
                  </Picker>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsMonthModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => {
                      if (tempMonth === null || tempYear === null) return;
                      setSelectedMonth(tempMonth);
                      setSelectedYear(tempYear);
                      setSelectedRange('CUSTOM');
                      setIsMonthModalVisible(false);
                    }}
                  >
                    <Text style={styles.applyButtonText}>
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* History Cards */}
            <FlatList
              data={filteredHistory}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
              ListEmptyComponent={
                loadingHistory ? (
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>
                    Loading...
                  </Text>
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>
                    No deletion history yet
                  </Text>
                )
              }
              renderItem={({ item }) => (
                <LinearGradient
                  colors={['#F9A8D4', '#C4B5FD', '#93C5FD']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.historyCardGradient}
                >
                  <View style={styles.historyCard}>
                    <View style={styles.imageContainer}>
                      {item.photo_url ? (
                        <Image
                          source={{ uri: item.photo_url }}
                          style={styles.historyImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="image-outline" size={24} color="#A78BFA" />
                      )}
                    </View>

                    <View style={styles.historyInfo}>
                      <Text style={styles.historyItemName} numberOfLines={1}>
                        {item.product_name}
                      </Text>

                      <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                          <Ionicons name="cube-outline" size={12} color="#7C3AED" />
                          <Text style={styles.historyDetail}>
                            {item.deleted_quantity}
                          </Text>
                        </View>

                        <View style={styles.detailItem}>
                          <Ionicons name="calendar-outline" size={12} color="#7C3AED" />
                          <Text style={styles.historyDetail}>
                            {new Date(item.deleted_at).toLocaleDateString()}
                          </Text>
                        </View>

                        <View style={styles.detailItem}>
                          <Ionicons name="person-outline" size={12} color="#7C3AED" />
                          <Text style={styles.historyDetail}>
                            {item.deleted_by === userId 
                              ? 'You' 
                              : item.deleted_by_profile?.full_name || 'Unknown'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              )}
            />
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.deleteAccountButton}
            activeOpacity={0.8}
            onPress={handleDeleteAccount}
          >
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.deleteAccountGradient}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.deleteAccountText}>Delete</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            activeOpacity={0.8}
            onPress={handleSignOut}
          >
            <LinearGradient
              colors={['#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signOutGradient}
            >
              <Ionicons name="log-out-outline" size={18} color="#fff" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleBadge: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileCardWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    zIndex: 10,
    marginBottom: -42,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  profileCard: {
    width: '100%',
    borderRadius: 20,
    paddingTop: 42,
    paddingBottom: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#F3E8FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B21B6',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(167, 139, 250, 0.3)',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(167, 139, 250, 0.4)',
  },
  historySectionWrapper: {
    marginHorizontal: 20,
    flex: 1,
    marginTop: 12,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  historySection: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 8,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: '#374151',
  },
  historyCardGradient: {
    borderRadius: 16,
    padding: 2.5,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyImage: {
    width: 50,
    height: 50,
  },
  historyInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  historyItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B21B6',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyDetail: {
    fontSize: 11,
    color: '#4B5563',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginTop: 10,
    marginBottom: 12,
    gap: 10,
  },
  signOutButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signOutGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteAccountButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteAccountGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
  },
  deleteAccountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7C3AED',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  quickFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
    marginBottom: 10,
  },
  quickFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  quickFilterButtonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  quickFilterText: {
    fontSize: 11,
    color: '#5B21B6',
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: '#ffffff',
  },
  // --- Bottom sheet premium styles ---
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  dragIndicator: {
    alignSelf: 'center',
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },

  // --- Month/year text contrast (for future use) ---
  selectedMonthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedMonthButton: {
    backgroundColor: '#2A2A3D',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  // --- Apply button premium purple ---
  applyButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 0,
    minWidth: 100,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
});