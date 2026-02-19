import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../src/supabase'
import * as ImagePicker from 'expo-image-picker';

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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const [totalItems, setTotalItems] = useState(0);
  const [nearExpireItems, setNearExpireItems] = useState(0);
  const [expiredItems, setExpiredItems] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setEmail(user.email ?? '');

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
        if (data.full_name) {
          setFullName(data.full_name);
        }
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);

      // ดึงสินค้าทั้งหมดของ user ทุก location
      const { data, error } = await supabase
        .from('products')
        .select('expiration_date')
        .eq('owner_id', userId);

      if (error || !data) return;

      let total = data.length;
      let near = 0;
      let expired = 0;

      data.forEach((item: any) => {
        const exp = new Date(item.expiration_date);

        if (exp < today) {
          expired++;
        } else if (exp >= today && exp <= threeDaysLater) {
          near++;
        }
      });

      setTotalItems(total);
      setNearExpireItems(near);
      setExpiredItems(expired);
    };

    fetchStats();
  }, [userId]);

  const handleChangeAvatar = async () => {
    try {
      if (!userId) return;

      // ขอ permission
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('กรุณาอนุญาตให้เข้าถึงรูปภาพ');
        return;
      }

      // เปิดเลือกภาพ
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

      // อัปโหลดไป Supabase Storage (ใช้ arrayBuffer แทน blob เพื่อแก้ปัญหา 0 bytes ใน React Native)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          upsert: true,
          contentType: image.type ?? 'image/jpeg',
        });

      if (uploadError) {
        console.log(uploadError);
        alert('อัปโหลดรูปไม่สำเร็จ');
        return;
      }

      // ดึง public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // อัปเดตใน profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.log(updateError);
        alert('อัปเดตโปรไฟล์ไม่สำเร็จ');
        return;
      }

      // เพิ่ม query param กัน cache เพื่อให้รูปโหลดใหม่ทันที
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
      alert('เปลี่ยนรูปโปรไฟล์สำเร็จ');
    } catch (err) {
      console.log(err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleUpdateName = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', userId);

    if (error) {
      alert('อัปเดตชื่อไม่สำเร็จ');
    } else {
      alert('อัปเดตชื่อสำเร็จ');
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

      // กลับไปหน้า Load / Login (ปรับ path ถ้าหน้าแรกชื่ออื่น)
      router.replace('/');
    } catch (error) {
      alert('ออกจากระบบไม่สำเร็จ');
    }
  };

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
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 90, height: 90, borderRadius: 45 }}
                  />
                ) : (
                  <Ionicons name="person-circle" size={90} color="#A78BFA" />
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
                    {fullName || 'ยังไม่ได้ตั้งชื่อ'}
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
                <Text style={styles.statLabel}>สินค้า</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{nearExpireItems}</Text>
                <Text style={styles.statLabel}>ใกล้หมดอายุ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{expiredItems}</Text>
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
        <TouchableOpacity
          style={styles.signOutButton}
          activeOpacity={0.8}
          onPress={handleSignOut}
        >
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
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7C3AED',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
