// components/NotificationOverlay.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { getUserNotifications, LocationNotifications, NotificationItem } from '../src/api/notification.api'
import { supabase } from '../src/supabase'

interface NotificationOverlayProps {
  visible: boolean
  onClose: () => void
}

export default function NotificationOverlay({ visible, onClose }: NotificationOverlayProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<LocationNotifications[]>([])

  useEffect(() => {
    if (visible) {
      loadNotifications()
    }
  }, [visible])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      if (!token) return

      const data = await getUserNotifications(token)
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // รวมสินค้าซ้ำที่มีทั้งเตือนหมดอายุและสต๊อก
  const mergeNotifications = (items: NotificationItem[]) => {
    const merged = new Map<string, NotificationItem & { alerts: Array<{ type: 'expiring' | 'low_stock', daysUntilExpiry?: number }> }>()
    
    items.forEach(item => {
      const existing = merged.get(item.id)
      if (existing) {
        // เพิ่ม alert ใหม่
        existing.alerts.push({
          type: item.type,
          daysUntilExpiry: item.daysUntilExpiry
        })
      } else {
        // สร้างใหม่
        merged.set(item.id, {
          ...item,
          alerts: [{
            type: item.type,
            daysUntilExpiry: item.daysUntilExpiry
          }]
        })
      }
    })

    return Array.from(merged.values())
  }

  const renderNotificationCard = (
    item: NotificationItem & { alerts: Array<{ type: 'expiring' | 'low_stock', daysUntilExpiry?: number }> }, 
    locationData: LocationNotifications,
    index: number
  ) => {
    const handleCardPress = () => {
      onClose() // ปิด overlay ก่อน
      
      // Route ไปหน้า showDetail ตาม location type
      router.push({
        pathname: locationData.locationType === 'business' 
          ? '/showDetailBusiness' 
          : '/showDetailPersonal',
        params: {
          productId: item.id,
          locationId: locationData.locationId,
        },
      })
    }

    return (
      <TouchableOpacity 
        key={`${item.id}-${index}`}
        style={styles.notificationCard}
        activeOpacity={0.7}
        onPress={handleCardPress}
      >
        <View style={styles.cardContent}>
          {/* Image */}
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]}>
                <Ionicons name="cube-outline" size={24} color="#999" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.quantityText}>จำนวน: {item.quantity} ชิ้น</Text>
            
            {/* แสดง alerts ทั้งหมด */}
            {item.alerts.map((alert, idx) => {
              if (alert.type === 'expiring') {
                const message = alert.daysUntilExpiry === 0 
                  ? 'จะหมดอายุภายในวันนี้!' 
                  : `จะหมดอายุภายใน ${alert.daysUntilExpiry} วัน`
                
                return (
                  <View key={`alert-${idx}`} style={[styles.alertBox, styles.expiringAlertBox]}>
                    <Ionicons name="time-outline" size={14} color="#F59E0B" />
                    <Text style={styles.expiringMessage}>{message}</Text>
                  </View>
                )
              } else {
                const message = item.quantity === 0 
                  ? 'สินค้าหมด!!' 
                  : `เหลือเพียง ${item.quantity} ชิ้น - รีบสต๊อก!`
                
                return (
                  <View key={`alert-${idx}`} style={[styles.alertBox, styles.lowStockAlertBox]}>
                    <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                    <Text style={styles.lowStockMessage}>{message}</Text>
                  </View>
                )
              }
            })}
          </View>

          {/* Arrow Icon */}
          <View style={styles.arrowContainer}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#999"
            />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderLocationSection = (locationData: LocationNotifications) => {
    const mergedItems = mergeNotifications(locationData.notifications)
    
    return (
      <View key={locationData.locationId} style={styles.locationSection}>
        {/* Location Header */}
        <View style={styles.locationHeader}>
          <Ionicons
            name={locationData.locationType === 'business' ? 'business' : 'home'}
            size={20}
            color="#F19BEA"
          />
          <Text style={styles.locationName}>{locationData.locationName}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{mergedItems.length}</Text>
          </View>
        </View>

        {/* Notifications */}
        {mergedItems.map((item, index) => renderNotificationCard(item, locationData, index))}
      </View>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="notifications" size={22} color="#F19BEA" />
              <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={28} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F19BEA" />
              <Text style={styles.loadingText}>กำลังโหลดการแจ้งเตือน...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={60} color="#10B981" />
              <Text style={styles.emptyTitle}>ไม่มีการแจ้งเตือน</Text>
              <Text style={styles.emptySubtitle}>ทุกอย่างเป็นไปด้วยดี!</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {notifications.map(renderLocationSection)}
            </ScrollView>
          )}

          {/* Footer Button */}
          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <Text style={styles.okButtonText}>เข้าใจแล้ว</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  container: {
    flex: 0.9,
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '96%',
    maxWidth: 700,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#F19BEA',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F19BEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  imageContainer: {
    width: 50,
    height: 50,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 18,
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    padding: 5,
    paddingHorizontal: 7,
    borderRadius: 6,
    marginTop: 3,
  },
  expiringAlertBox: {
    backgroundColor: '#FFF7ED',
  },
  lowStockAlertBox: {
    backgroundColor: '#FEF2F2',
  },
  expiringMessage: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
    flex: 1,
  },
  lowStockMessage: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  highlightText: {
    fontWeight: '800',
    color: '#F19BEA',
  },
  arrowContainer: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  okButton: {
    backgroundColor: '#F19BEA',
    margin: 12,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#F19BEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
