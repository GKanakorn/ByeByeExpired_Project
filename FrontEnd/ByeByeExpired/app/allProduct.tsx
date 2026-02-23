// app/allProduct.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { getProducts } from "../src/api/product.api";
import { supabase } from "../src/supabase";

const TABS = [
  "All",
  "Vegetables & Fruits",
  "Meat & Poultry",
  "Egg & Dairy",
  "Processed Foods",
  "Beverages",
];

const CATEGORY_MAP: Record<string, string> = {
  "Vegetables & Fruits": "veg",
  "Meat & Poultry": "meat",
  "Egg & Dairy": "egg",
  "Processed Foods": "processed",
  "Beverages": "drink",
};


export default function AllProductScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  const [sortAsc, setSortAsc] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const { locationId } = useLocalSearchParams()

  const parseDate = (dateStr: string): number => {
    return new Date(dateStr).getTime();
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchProducts = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) return;

          const data = await getProducts(locationId as string);
          setProducts(data);
        } catch (error) {
          console.log("Fetch products error:", error);
        }
      };

      fetchProducts();
    }, [locationId])
  );

  const filteredProducts =
    activeTab === "All"
      ? products
      : products.filter((item: any) => {
          const categoryValue =
            item.product_templates?.category || item.category;
          return categoryValue === CATEGORY_MAP[activeTab];
        });

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const dateA = parseDate(a.expiration_date);
    const dateB = parseDate(b.expiration_date);

    return sortAsc
      ? dateA - dateB
      : dateB - dateA;
  });

  return (
    <LinearGradient
      colors={["#E8F0FF", "#C7DBFF"]}   // สีไล่จากบนลงล่าง
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
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
            renderItem={({ item }) => {
              const imageUrl =
                item.product_templates?.image_url ||
                "https://via.placeholder.com/150";

              return (
                <View style={styles.card}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.img}
                  />
                  <Text style={styles.name}>
                    {item.product_templates?.name || item.name}
                  </Text>
                  <Text style={styles.qty}>Qty: {item.quantity}</Text>
                  <Text style={styles.exp}>
                    EXP : {new Date(item.expiration_date).toDateString()}
                  </Text>
                </View>
              );
            }}
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
    color: "#2563EB",
    fontSize: 15,
    marginLeft: 4,
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "600",
    color: "#1D4ED8",
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
    backgroundColor: "#E5EDFF",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#4F7DFF",
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
    backgroundColor: "#4F7DFF",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

});
