import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";


const TABS = [
  "All",
  "Vegetable & Fruits",
  "Meat & Poultry",
  "Egg & Milk",
];

const PRODUCTS = [
  {
    id: "1",
    name: "ไข่ไก่สด เบอร์ 2 แพ็ค 30 ฟอง",
    qty: "1 piece",
    exp: "7 JAN 2026",
    img: "https://via.placeholder.com/150",
  },
  {
    id: "2",
    name: "หมูสับสด",
    qty: "1 piece",
    exp: "7 JAN 2026",
    img: "https://via.placeholder.com/150",
  },
  {
    id: "3",
    name: "สันคอหมูสด",
    qty: "3 piece",
    exp: "8 JAN 2026",
    img: "https://via.placeholder.com/150",
  },
  {
    id: "4",
    name: "บะหมี่กึ่งสำเร็จรูป",
    qty: "6 piece",
    exp: "9 JAN 2026",
    img: "https://via.placeholder.com/150",
  },
];

export default function AllProductScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#2563EB" />
          <Text style={styles.backText}>Overview</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>ALL PRODUCT</Text>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabRow}
        contentContainerStyle={styles.tabContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabBtn,
              activeTab === tab && styles.tabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid Wrapper */}
      <View style={styles.productWrapper}>
        <FlatList
          data={PRODUCTS}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.img }} style={styles.img} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.qty}>{item.qty}</Text>
              <Text style={styles.exp}>EXP : {item.exp}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEECEC",
    paddingHorizontal: 16,
  },

  header: {
    marginTop: 40,
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#2563EB",
    fontSize: 15,
    marginLeft: 4,
  },

  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#1D4ED8",
    marginBottom: 30,
    marginTop: 30,
  },

  tabRow: {
    flexDirection: "row",
    marginBottom: 1,
  },


  tabContent: {
    alignItems: "center",
  },

  tabBtn: {
    paddingHorizontal: 12,
    height: 32,
    justifyContent: "center",
    backgroundColor: "#E5EDFF",
    borderRadius: 20,
    marginRight: 8,
  },

  tabBtnActive: {
    backgroundColor: "#4F7DFF",
  },
  tabText: {
    fontSize: 12,
    color: "#4F7DFF",
  },
  tabTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    width: "48%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  img: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
  },
  qty: {
    fontSize: 11,
    color: "#777",
  },
  exp: {
    fontSize: 11,
    color: "#E11D48",
    fontWeight: "600",
    marginTop: 2,
  },
  productWrapper: {
    backgroundColor: "#e1e1e1",     // พื้นหลังกรอบ
    borderRadius: 20,
    padding: 12,
    marginTop: 8,
    marginBottom: 200,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

});
