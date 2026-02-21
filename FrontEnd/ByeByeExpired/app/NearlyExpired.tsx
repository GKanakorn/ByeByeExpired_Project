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
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const TABS = [
  "All",
  "Vegetables & Fruits",
  "Meat & Poultry",
  "Egg & Dairy",
  "Processed Foods",
  "Beverages",
];

type Product = {
  id: string;
  name: string;
  qty: string;
  exp: string;
  img: string;
};

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
  {
    id: "5",
    name: "บะหมี่กึ่งสำเร็จรูป",
    qty: "6 piece",
    exp: "9 JAN 2026",
    img: "https://via.placeholder.com/150",
  },
];

export default function NearlyExpiredScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  const [sortAsc, setSortAsc] = useState(true);
  const parseDate = (dateStr: string): number => {
    return new Date(dateStr).getTime();
  };
  const sortedProducts = [...PRODUCTS].sort((a, b) => {
    const dateA = parseDate(a.exp);
    const dateB = parseDate(b.exp);

    return sortAsc
      ? dateA - dateB   // ใกล้หมดอายุขึ้นก่อน
      : dateB - dateA;  // หมดอายุช้าที่สุดขึ้นก่อน
  });

  return (
    <LinearGradient
      colors={["#FCFFCD", "#FFE0A1"]}   // สีไล่จากบนลงล่าง
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1  ,paddingHorizontal: 16, paddingTop: 8}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#C98900" />
            <Text style={styles.backText}>Overview</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>NEARLY EXPIRED</Text>

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
            data={sortedProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 16,
            }}
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
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => setSortAsc(!sortAsc)}
        >
          <Ionicons
            name={sortAsc ? "arrow-up" : "arrow-down"}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 10,
    marginBottom: 18
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#C98900",
    fontSize: 15,
    marginLeft: 4,
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "600",
    color: "#C98900",
    marginBottom: 15,
    marginTop: 30,
    letterSpacing: 1,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  tabContent: {
    alignItems: "center",
    paddingHorizontal: 4,
  },

  tabBtn: {
    paddingHorizontal: 14,
    height: 28,
    justifyContent: "center",
    backgroundColor: "#fff7ca",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#C98900",
  },

  tabBtnActive: {
    backgroundColor: "#C98900",
  },
  tabText: {
    fontSize: 12,
    color: "#C98900",
  },
  tabTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
    width: "48%",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  img: {
    width: "100%",
    height: 110,
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
    flex: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    padding: 18,
    marginTop: 0,
  },
  floatingBtn: {
    position: "absolute",
    right: 24,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#C98900",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

});
