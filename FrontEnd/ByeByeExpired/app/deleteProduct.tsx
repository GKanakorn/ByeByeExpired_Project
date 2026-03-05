//deleteProduct.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Pressable,
  TextInput,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { supabase } from "../src/supabase";
import { API_URL } from "../src/config/api";

export default function DeleteProduct() {
  const router = useRouter();
  const [qtyModal, setQtyModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [searchName, setSearchName] = useState('');

  const { barcode, locationId, context } = useLocalSearchParams<{
    barcode?: string
    locationId?: string
    context?: 'personal' | 'business'
  }>()

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!locationId) return;

      try {
        setLoading(true);

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;

        // 🟢 ===== SCAN MODE =====
        if (barcode) {
          const res = await fetch(
            `${API_URL}/products/by-barcode/${barcode}?locationId=${locationId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const result = await res.json();
          if (!res.ok) {
            throw new Error(result.message || "Fetch product failed");
          }

          setProducts(Array.isArray(result) ? result : [result]);
        }

        // 🟢 ===== MANUAL MODE =====
        else {
          const res = await fetch(
            `${API_URL}/products?locationId=${locationId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const result = await res.json();
          if (!res.ok) {
            throw new Error(result.message || "Fetch product failed");
          }

          setProducts(result || []);
        }
      } catch (err) {
        console.log("FETCH PRODUCT ERROR", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [barcode, locationId]);

  console.log("DELETE PARAMS:", {
    barcode,
    locationId,
    context,
  })

  // Filter products based on search
  const filteredProducts = products.filter((item) => {
    if (!searchName.trim()) return true;
    const productName = item.product_templates?.name || item.name || '';
    return productName.toLowerCase().includes(searchName.toLowerCase());
  });

  const handleDelete = async () => {
  if (!selectedProduct) return;

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const res = await fetch(
      `${API_URL}/products/${selectedProduct.id}/delete`,
      {
        method: "PATCH", // ใช้ PATCH เพราะเราลด quantity
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: quantity,
        }),
      }
    );

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Delete failed");
    }

    // 🔥 รีเฟรช list ใหม่
    setProducts((prev) =>
      prev
        .map((item) =>
          item.id === selectedProduct.id
            ? { ...item, quantity: item.quantity - quantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    setConfirmModal(false);
    setQuantity(1);

  } catch (err) {
    console.log("DELETE ERROR", err);
  }
};

  return (
    <LinearGradient
      colors={["#b5c0f4ff", "#fcfaffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* ===== MAIN PAGE ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/overview')}>
          <Ionicons name="chevron-back" size={34} color="#434bdfff" />
        </TouchableOpacity>
        <Text style={styles.title}>DeleteProduct</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== SEARCH BAR ===== */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหาสินค้า..."
              value={searchName}
              onChangeText={setSearchName}
              placeholderTextColor="#999"
            />
            {searchName.length > 0 && (
              <TouchableOpacity onPress={() => setSearchName('')}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ===== PRODUCT LIST (Filtered) ===== */}
        <View style={{ marginTop: 20, flex: 1 }}>
          {loading && (
            <Text style={{ textAlign: "center", color: "#666" }}>
              Loading...
            </Text>
          )}

          {!loading && filteredProducts.length === 0 && (
            <Text style={{ textAlign: "center", color: "#666" }}>
              {searchName ? 'ไม่พบสินค้าที่ค้นหา' : 'No product found'}
            </Text>
          )}

          {!loading &&
            filteredProducts.map((item) => (
              <View key={item.id} style={styles.card}>
                <Image
                  source={{
                    uri:
                      item.product_templates?.image_url ||
                      "https://via.placeholder.com/100",
                  }}
                  style={styles.image}
                />

                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.product_templates?.name || item.name}
                  </Text>

                  <Text style={styles.detail}>
                    {item.quantity} piece
                  </Text>

                  <Text style={styles.exp}>
                    EXP :{" "}
                    {item.expiration_date
                      ? new Date(item.expiration_date).toLocaleDateString("en-GB")
                      : "-"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.trashCircle}
                  onPress={() => {
                    setSelectedProduct(item);
                    setQtyModal(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* ================= SELECT QUANTITY MODAL ================= */}
      <Modal visible={qtyModal} transparent animationType="slide">
        <BlurView intensity={40} tint="dark" style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>ลบสินค้าออกจากสต๊อก</Text>
            <View style={styles.sectionDivider} />

            <View style={styles.productRow}>
              <Image
                source={{
                  uri:
                    selectedProduct?.product_templates?.image_url ||
                    "https://via.placeholder.com/100",
                }}
                style={styles.image}
              />
              <View style={{ marginLeft: 50 }}>
                <Text style={styles.name}>
                  {selectedProduct?.product_templates?.name || "No product found"}
                </Text>
                <Text style={styles.detail}>
                  {selectedProduct?.quantity ?? 0} piece
                </Text>
                <Text style={styles.exp}>
                  EXP :{" "}
                  {selectedProduct?.expiration_date
                    ? new Date(selectedProduct.expiration_date).toLocaleDateString("en-GB")
                    : "-"}
                </Text>
              </View>
            </View>
            <View style={styles.sectionDivider} />

            <Text style={{ marginTop: 20, textAlign: "center", alignSelf: "center", fontSize: 15, }}>
              จำนวนที่ต้องการลบ
            </Text>

            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() =>
                  setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                }
              >
                <Text style={styles.counterText}>-</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.qtyBox}>
                <Text style={styles.qty}>{quantity}</Text>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setQuantity((prev) => prev + 1)}
              >
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowBtn}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setQtyModal(false)}
              >
                <Text style={{ fontSize: 16, fontWeight: "500" }}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setQtyModal(false);
                  setConfirmModal(true);
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* ================= CONFIRM MODAL ================= */}
      <Modal visible={confirmModal} transparent animationType="slide">
        <BlurView intensity={40} tint="dark" style={styles.overlayCenter}>
          <View style={styles.modalCenterBox}>
            <View style={styles.handle} />
            <Ionicons
              name="warning"
              size={65}
              color="#f4b400"
              style={{ marginBottom: 20, alignSelf: "center" }}
            />

            <Text style={styles.modalTitle}>ยืนยันการลบสินค้า</Text>
            <Text style={{ textAlign: "center", marginVertical: 10 }}>
              คุณต้องการลบสินค้า {selectedProduct?.product_templates?.name || "No product found"}
              {"\n"}จำนวน {quantity} ชิ้น
            </Text>

            <View style={styles.rowBtn}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfirmModal(false)}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleDelete}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 90,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#434bdfff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 25,
    marginBottom: 20,
    minHeight: 120,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5eaff",
    marginRight: 5,
  },
  name: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 6,
  },
  detail: {
    color: "#777",
    marginBottom: 4,
  },
  exp: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBox: {
    width: "100%",
    height: "65%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 50,
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    width: "100%",
    marginTop: 15,
    marginBottom: 25,
    lineHeight: 26,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e6e7f0ff",
    borderRadius: 15,
    overflow: "hidden",
    alignSelf: "center",
    marginVertical: 15,
  },
  qty: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 20,
  },
  counterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6ff",
  },
  counterText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#080808ff",
  },
  qtyBox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#c5ccff",
    height: "100%",
  },
  rowBtn: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 35,
    width: "100%",
  },
  cancelBtn: {
    backgroundColor: "#ddd",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  confirmBtn: {
    backgroundColor: "#9aa8ff",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 15,
  },
  overlayCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCenterBox: {
    width: "92%",
    backgroundColor: "#ffffff",
    borderRadius: 35,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  sectionDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e6e7f0",
    marginVertical: 15,
  },
  trashCircle: {
    width: 40,
    height: 40,
    borderRadius: 22.5,
    backgroundColor: "#f4f6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});