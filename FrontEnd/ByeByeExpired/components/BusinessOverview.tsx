import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type Location = {
  id: string
  name: string
  type: "personal" | "business"
}

export default function BusinessOverview({
  location,
}: {
  location: Location
}) {
  return (
    <View style={styles.container}>
      <Ionicons name="business-outline" size={48} color="#3B82F6" />
      <Text style={styles.title}>{location.name}</Text>
      <Text style={styles.sub}>Business Overview (placeholder)</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F7FB",
  },
  title: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
    color: "#888",
  },
})