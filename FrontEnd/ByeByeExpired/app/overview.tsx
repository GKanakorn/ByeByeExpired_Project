import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { useLocation } from "../src/context/LocationContext"
import PersonalOverview from "../components/PersonalOverview"
import BusinessOverview from "../components/BusinessOverview"


export default function OverviewScreen() {
  const { currentLocation } = useLocation()

  // ยังไม่ได้เลือก location
  if (!currentLocation) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>ยังไม่ได้เลือกสถานที่</Text>
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
    fontSize: 16,
    color: "#999",
  },
})