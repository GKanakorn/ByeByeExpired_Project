import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function DeleteProduct() {
  const router = useRouter();
  const [qtyModal, setQtyModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const product = {
    name: "ปลากระป๋องสามแม่ครัว",
    exp: "20 Jan 2026",
    amount: 10,
    image: require("../assets/images/delete.png"),
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={34} color="#434bdfff" />
        </TouchableOpacity>
        <Text style={styles.title}>DeleteProduct</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.card}>
        <Image source={product.image} style={styles.image} />
        <View style={{ flex: 1, marginLeft: 20 }}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.detail}>{product.amount} piece</Text>
          <Text style={styles.exp}>EXP : {product.exp}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setQtyModal(true)}
          style={styles.trashCircle}
        >
          <Ionicons name="trash-outline" size={25} color="#666" />
        </TouchableOpacity>
      </View>

      {/* ================= SELECT QUANTITY MODAL ================= */}
      <Modal visible={qtyModal} transparent animationType="slide">
        <BlurView intensity={40} tint="dark" style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>ลบสินค้าออกจากสต๊อก</Text>
            <View style={styles.sectionDivider} />

            <View style={styles.productRow}>
              <Image source={product.image} style={styles.image} />
              <View style={{ marginLeft: 50 }}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.detail}>{product.amount} piece</Text>
                <Text style={styles.exp}>EXP : {product.exp}</Text>
              </View>
            </View>
            <View style={styles.sectionDivider} />

            <Text style={{ marginTop: 20, textAlign: "center", alignSelf: "center",fontSize: 15, }}>
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
              คุณต้องการลบสินค้า {product.name}
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
                onPress={() => {
                  setConfirmModal(false);
                  setQuantity(1);
                }}
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
});