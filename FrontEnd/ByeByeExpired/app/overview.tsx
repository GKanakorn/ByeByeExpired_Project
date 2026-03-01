import React from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useLocation } from "../src/context/LocationContext"
import PersonalOverview from "../components/PersonalOverview"
import BusinessOverview from "../components/BusinessOverview"

export default function OverviewScreen() {
  const { currentLocation } = useLocation()

  // 🔥 ถ้ายังไม่มี location → แสดง loading ไปเลย
  if (!currentLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F19BEA" />
        <Text style={styles.text}>กำลังโหลดสถานที่...</Text>
      </View>
    )
  }

  if (currentLocation.type === "business") {
    return <BusinessOverview location={currentLocation} />
  }

  return <PersonalOverview location={currentLocation} />
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