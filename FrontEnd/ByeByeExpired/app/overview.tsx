import React, { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useLocation } from "../src/context/LocationContext"
import PersonalOverview from "../components/PersonalOverview"
import BusinessOverview from "../components/BusinessOverview"
import NotificationOverlay from "../components/NotificationOverlay"
import { getUserNotifications } from "../src/api/notification.api"
import { supabase } from "../src/supabase"

export default function OverviewScreen() {
  const { currentLocation } = useLocation()
  const [showNotification, setShowNotification] = useState(false)
  const hasShownNotificationRef = useRef(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    // รีเซ็ต flag เมื่อ logout (currentLocation เป็น null)
    if (!currentLocation) {
      hasShownNotificationRef.current = false
      setNotificationCount(0)
      setNotifications([])
    }
  }, [currentLocation])
  
  // Fetch notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session?.session?.access_token
        if (!token) return

        const data = await getUserNotifications(token)
        setNotifications(data)

        // Calculate total notification count
        let totalCount = 0
        data.forEach((location: any) => {
          if (location.notifications && Array.isArray(location.notifications)) {
            totalCount += location.notifications.length
          }
        })
        setNotificationCount(totalCount)
      } catch (err) {
        console.log("FETCH NOTIFICATIONS COUNT ERROR:", err)
      }
    }

    if (currentLocation) {
      fetchNotifications()
    }
  }, [currentLocation])
  
  useEffect(() => {
    // แสดง notification เฉพาะครั้งแรกที่เข้า Overview หลัง login
    if (currentLocation && !hasShownNotificationRef.current) {
      setShowNotification(true)
      hasShownNotificationRef.current = true
    }
  }, [currentLocation])

  const handleCloseNotification = () => {
    setShowNotification(false)
  }

  // 🔥 ถ้ายังไม่มี location → แสดง loading ไปเลย
  if (!currentLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F19BEA" />
        <Text style={styles.text}>กำลังโหลดสถานที่...</Text>
      </View>
    )
  }

  return (
    <>
      {/* Notification Overlay */}
      <NotificationOverlay visible={showNotification} onClose={handleCloseNotification} />

      {/* Main Content */}
      {currentLocation.type === "business" ? (
        <BusinessOverview location={currentLocation} notificationCount={notificationCount} />
      ) : (
        <PersonalOverview location={currentLocation} notificationCount={notificationCount} />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
})