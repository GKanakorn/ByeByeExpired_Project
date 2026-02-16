import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Profile screen mock history data
const historyData = [
  {
    id: 1,
    name: "ปลากระป๋อง",
    quantity: 2,
    usedDate: "12/01/26",
    expireDate: "13/01/26",
    by: "สมศรี",
    image: "https://pngimg.com/uploads/fish_canned/fish_canned_PNG16.png",
  },
  {
    id: 2,
    name: "เมจิ นมสดพาสเจอร์ไรซ์ รสจืด",
    quantity: 1,
    usedDate: "10/01/26",
    expireDate: "13/01/26",
    by: "สมรชัย",
    image: "https://pngimg.com/uploads/milk/milk_PNG12764.png",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  return (
    <LinearGradient
      colors={['#BFEFFF', '#E8D5FF', '#F5D0FE']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="home" size={26} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/setting')} style={styles.iconButton}>
            <Ionicons name="settings" size={26} color="#6B7280" />
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
                <Text style={styles.avatarEmoji}>👩</Text>
              </View>
            </LinearGradient>
          </View>
          
          <LinearGradient
            colors={['rgba(147, 197, 253, 0.8)', 'rgba(196, 181, 253, 0.6)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <Text style={styles.userName}>Ebola Coronana</Text>
            <Text style={styles.userEmail}>ebolacoronana@gmail.com</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>สินค้า</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>ใกล้หมดอายุ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>หมดอายุ</Text>
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
                placeholder="ค้นหาชื่อสินค้า..."
                placeholderTextColor="#A78BFA"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterSelect}>
                <Text style={styles.filterText}>เดือนทั้งหมด</Text>
                <Ionicons name="chevron-down" size={16} color="#7C3AED" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterSelect}>
                <Text style={styles.filterText}>ปีทั้งหมด</Text>
                <Ionicons name="chevron-down" size={16} color="#7C3AED" />
              </TouchableOpacity>
            </View>

            {/* History Cards */}
            <View style={styles.historyList}>
              {historyData.map((item) => (
                <LinearGradient
                  key={item.id}
                  colors={['#F9A8D4', '#C4B5FD', '#93C5FD']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.historyCardGradient}
                >
                  <View style={styles.historyCard}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.historyImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyItemName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                          <Ionicons name="cube-outline" size={12} color="#7C3AED" />
                          <Text style={styles.historyDetail}>{item.quantity}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="calendar-outline" size={12} color="#7C3AED" />
                          <Text style={styles.historyDetail}>{item.usedDate}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="alert-circle-outline" size={12} color="#EF4444" />
                          <Text style={[styles.historyDetail, { color: '#EF4444' }]}>{item.expireDate}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="person-outline" size={12} color="#7C3AED" />
                          <Text style={styles.historyDetail}>{item.by}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} activeOpacity={0.8}>
          <LinearGradient
            colors={['#F3E8FF', '#E9D5FF', '#DDD6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signOutGradient}
          >
            <Ionicons name="log-out-outline" size={18} color="#7C3AED" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 16,
  },
  titleBadge: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileCardWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    zIndex: 10,
    marginBottom: -50,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  profileCard: {
    width: '100%',
    borderRadius: 24,
    paddingTop: 60,
    paddingBottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 4,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#F3E8FF',
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5B21B6',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(167, 139, 250, 0.3)',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7C3AED',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(167, 139, 250, 0.4)',
  },
  historySectionWrapper: {
    flex: 1,
    marginHorizontal: 24,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  historySection: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 10,
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
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  filterSelect: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 6,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterText: {
    fontSize: 12,
    color: '#5B21B6',
    fontWeight: '500',
  },
  historyList: {
    flex: 1,
    gap: 10,
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
  signOutButton: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '50%',
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
});
