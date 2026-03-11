import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../src/supabase";
import { getStorageDetail } from "../src/api/storage.api";
import { getProducts } from "../src/api/product.api";
import { useFocusEffect } from "@react-navigation/native";
import { useLocation } from "../src/context/LocationContext";
import { Colors } from "@/constants/theme";

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

const FONT_FAMILY = "System";
const FONT_WEIGHT_REGULAR = "500" as const;
const FONT_WEIGHT_SEMIBOLD = "600" as const;

type Product = {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  expiration_date: string;
  img?: string;
  category?: string;
  product_templates?: {
    name?: string;
    image_url?: string;
    category?: string;
  };
};

type StorageDetail = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export default function StorageScreen() {
  const router = useRouter();
  const { currentLocation } = useLocation();
  const { storageId, locationId, context } = useLocalSearchParams();
  
  const [storage, setStorage] = useState<StorageDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [sortAsc, setSortAsc] = useState(true);

  const locationContext =
    (typeof context === "string" ? context : currentLocation?.type) === "business"
      ? "business"
      : "personal";

  const detailPath =
    locationContext === "business" ? "/showDetailBusiness" : "/showDetailPersonal";

  const openProductDetail = (productId: string) => {
    if (!locationId || !productId) return;

    router.push({
      pathname: detailPath,
      params: {
        productId,
        locationId: String(locationId),
      },
    });
  };

  // Fetch storage detail และ products
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          const { data: session } = await supabase.auth.getSession();
          const token = session?.session?.access_token;

          if (!token || !storageId || !locationId) {
            setLoading(false);
            return;
          }

          // Fetch storage detail
          const storageData = await getStorageDetail(
            token,
            storageId as string
          );
          setStorage(storageData);

          // Fetch all products ใน location นี้
          const allProducts = await getProducts(locationId as string);

          // Filter products โดย storage_id === storageId
          const filtered = (allProducts || []).filter(
            (p: any) => p.storage_id === storageId
          );

          setProducts(filtered);
        } catch (error) {
          console.log("Fetch storage data error:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [storageId, locationId])
  );

  // Parse date สำหรับ sorting
  const parseDate = (dateStr: string): number => {
    return new Date(dateStr).getTime();
  };

  // Sort products โดย expiration_date
  const sortedProducts = [...products].sort((a, b) => {
    if (!a.expiration_date || !b.expiration_date) return 0;
    const dateA = parseDate(a.expiration_date);
    const dateB = parseDate(b.expiration_date);

    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  // Filter by category
  const filteredProducts =
    activeTab === "All"
      ? sortedProducts
      : sortedProducts.filter(
          (p) =>
            (p.category || p.product_templates?.category) === CATEGORY_MAP[activeTab]
        );

  // Generate lighter shade of storage color สำหรับ gradient
  const getLighterColor = (hexColor: string): string => {
    // Convert hex to RGB แล้ว lighten มัน
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // Make lighter by increasing values toward 255
    const lighter = `rgba(${r}, ${g}, ${b}, 0.1)`;
    return lighter;
  };

  return (
    <LinearGradient
      colors={[
        storage?.color || "#fdb6cd",
        "#ffffff",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={"#ffffff"} />
            <Text style={[styles.backText, { color: "#ffffff" }]}>
              OVERVIEW
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={"#ffffff"} />
          </View>
        )}

        {!loading && (
          <>
            {/* Title */}
            <Text style={[styles.title, { color: "#ffffff" }]}>
              {(storage?.name || "STORAGE").toUpperCase()}
            </Text>

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
                    activeTab === tab && {
                      ...styles.tabBtnActive,
                      backgroundColor: "#ffffff",
                      borderColor: storage?.color || "#7C3AED"
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && {
                        ...styles.tabTextActive,
                        color: storage?.color || "#7C3AED",
                      },
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
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No products in this storage</Text>
                }
                renderItem={({ item }) => {
                  const imageUrl =
                    item.product_templates?.image_url ||
                    "https://via.placeholder.com/150";

                  return (
                    <TouchableOpacity
                      style={styles.card}
                      activeOpacity={0.85}
                      onPress={() => openProductDetail(item.id)}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.img}
                      />
                      <Text style={styles.name}>
                        {item.name || item.product_templates?.name}
                      </Text>
                      <Text style={styles.qty}>Qty: {item.quantity}</Text>
                      <Text style={styles.exp}>
                        EXP : {new Date(item.expiration_date).toDateString()}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* Floating Sort Button */}
            <TouchableOpacity
              style={[
                styles.floatingBtn,
                { backgroundColor: storage?.color || "#7C3AED" },
              ]}
              onPress={() => setSortAsc(!sortAsc)}
            >
              <Ionicons
                name={sortAsc ? "arrow-up" : "arrow-down"}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 10,
    marginBottom: 18,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#FE7EA9",
    fontSize: 15,
    marginLeft: 4,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT_REGULAR,
  },

  title: {
    textAlign: "center",
    alignSelf: "center",
    width: "100%",
    fontSize: 26,
    fontWeight: FONT_WEIGHT_SEMIBOLD,
    fontFamily: FONT_FAMILY,
    color: "#FE7EA9",
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
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ffffff",
  },

  tabBtnActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  tabText: {
    fontSize: 12,
    color: "#ffffff",
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT_REGULAR,
  },
  tabTextActive: {
    color: "#ffffff",
    fontWeight: FONT_WEIGHT_SEMIBOLD,
    fontFamily: FONT_FAMILY,
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
    fontWeight: FONT_WEIGHT_SEMIBOLD,
    fontFamily: FONT_FAMILY,
  },
  qty: {
    fontSize: 11,
    color: "#777",
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT_REGULAR,
  },
  exp: {
    fontSize: 11,
    color: "#E11D48",
    fontWeight: FONT_WEIGHT_SEMIBOLD,
    fontFamily: FONT_FAMILY,
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
    backgroundColor: "#FE7EA9",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 20,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT_REGULAR,
  },
  imageContainer: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
});
