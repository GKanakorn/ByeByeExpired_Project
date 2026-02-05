import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput, // ⭐ เพิ่ม
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
 
/* ===== เพิ่ม import รูป ===== */
import homeImg from "../assets/images/home.png";
import restaurantImg from "../assets/images/restaurant.png";
 
export default function SettingScreen() {
  const navigation = useNavigation();
 
  const [mode, setMode] = useState("select");
  const [admins, setAdmins] = useState(["ผู้ดูแล 1", "ผู้ดูแล 2"]); // ⭐ เพิ่ม
 
  return (
    <LinearGradient
      colors={["#cbd1faff", "#eef4f8ff", "#cfe9f9ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              mode === "select" ? navigation.goBack() : setMode("select")
            }
          >
            <Ionicons name="chevron-back" size={28} color="#5A6AE0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setting</Text>
          <View style={{ width: 28 }} />
        </View>
 
        {/* Title */}
        <View style={styles.titleBox}>
          <Text style={styles.title}>
            {mode === "select"
              ? "เลือกสถานที่"
              : mode === "home"
              ? "บ้าน"
              : "ร้านอาหาร"}
          </Text>
          <Text style={styles.subtitle}>
            จัดการสินค้าและวันหมดอายุแยกตามสถานที่
          </Text>
        </View>
 
        {/* Cards */}
        <View style={styles.cardRow}>
          {/* บ้าน */}
          <View
            style={[
              styles.card,
              mode !== "select" && mode !== "home" && { opacity: 0.4 },
            ]}
          >
            <TouchableOpacity style={styles.closeBtn}>
              <Ionicons name="close" size={16} color="#888" />
            </TouchableOpacity>
 
            <Image source={homeImg} style={styles.cardImage} />
 
            <Text style={styles.cardTitle}>บ้าน</Text>
            <Text style={styles.cardSub}>ประเภท: ส่วนตัว</Text>
 
            <TouchableOpacity
              style={[styles.enterBtn, styles.greenBtn]}
              onPress={() => setMode("home")}
            >
              <Text style={styles.enterText}>เข้าใช้งาน</Text>
            </TouchableOpacity>
          </View>
 
          {/* ร้านอาหาร */}
          <View
            style={[
              styles.card,
              mode !== "select" && mode !== "restaurant" && { opacity: 0.4 },
            ]}
          >
            <TouchableOpacity style={styles.closeBtn}>
              <Ionicons name="close" size={16} color="#888" />
            </TouchableOpacity>
 
            <Image source={restaurantImg} style={styles.cardImage} />
 
            <Text style={[styles.cardTitle, { color: "#E46B2C" }]}>
              ร้านอาหาร
            </Text>
            <Text style={styles.cardSub}>ประเภท: ธุรกิจ</Text>
 
            <TouchableOpacity
              style={[styles.enterBtn, styles.orangeBtn]}
              onPress={() => setMode("restaurant")}
            >
              <Text style={styles.enterText}>เข้าใช้งาน</Text>
            </TouchableOpacity>
          </View>
 
          {/* เพิ่มสถานที่ */}
          <View
  style={[
     styles.card,
     styles.cardAdd,
     mode === "home" && { opacity: 0.3 },
     mode === "restaurant" && { opacity: 0.3 },
  ]}
     pointerEvents={mode === "select" ? "auto" : "none"}
    >
    <Ionicons name="add-circle-outline" size={48} color="#000" />
    <Text style={styles.addText}>เพิ่มสถานที่ใหม่</Text>
     </View>
        </View>
 
        {/* ===== ผู้ดูแล (แสดงเมื่อกดเข้าใช้งาน) ===== */}
        {mode !== "select" && (
          <View style={styles.adminSection}>
            <View style={styles.adminHeader}>
              <Ionicons name="people" size={18} color="#000" />
              <Text style={styles.adminTitle}>จัดการผู้ใช้</Text>
            </View>
 
            <View style={styles.adminBox}>
              {admins.map((name, index) => (
                <View key={index} style={styles.adminRow}>
                  <TextInput
                    value={name}
                    onChangeText={(text) => {
                      const newAdmins = [...admins];
                      newAdmins[index] = text;
                      setAdmins(newAdmins);
                    }}
                    style={styles.adminInput}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setAdmins(admins.filter((_, i) => i !== index))
                    }
                  >
                    <Ionicons name="close" size={18} color="#999" />
                  </TouchableOpacity>
                </View>
              ))}
 
              <TouchableOpacity
                style={styles.addAdminBtn}
                onPress={() => setAdmins([...admins, ""])}
              >
                <Ionicons name="add-circle-outline" size={20} color="#000" />
                <Text style={styles.addAdminText}>เพิ่มผู้ใช้</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
 
        {/* Delete Account */}
        <View style={styles.deleteBox}>
          <TouchableOpacity style={styles.deleteBtn}>
            <Text style={styles.deleteText}>ลบบัญชี</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
 
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    color: "#5A6AE0",
  },
 
  titleBox: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#9AA0B4",
    marginTop: 6,
  },
 
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 10,
  },
 
  card: {
    width: 120,
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
 
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },
 
  cardImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginTop: 10,
  },
 
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    color: "#2E7D32",
  },
 
  cardSub: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
  },
 
  enterBtn: {
    width: "100%",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
 
  greenBtn: {
    backgroundColor: "#B7E28E",
  },
 
  orangeBtn: {
    backgroundColor: "#F7B27A",
  },
 
  enterText: {
    fontSize: 13,
    fontWeight: "600",
  },
 
  cardAdd: {
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#CCC",
  },
 
  addText: {
    marginTop: 6,
    fontSize: 12,
  },
 
  adminSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
 
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
 
  adminTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
 
  adminBox: {
    backgroundColor: "#EAF0FF",
    borderRadius: 20,
    padding: 15,
  },
 
  adminRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 8,
  },
 
  adminInput: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
  },
 
  addAdminBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
 
  addAdminText: {
    fontSize: 14,
  },
 
  deleteBox: {
  marginTop: "auto",
  alignItems: "flex-start", // ⭐ จาก center เป็นซ้าย
  marginBottom: 25,
  marginLeft: 40,           // ⭐ ระยะห่างจากขอบซ้าย
},
 
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: "#f7f1f0ff",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: "#FFF",
  },
 
  deleteText: {
    color: "#d21714ff",
    fontSize: 16,
    fontWeight: "600",
  },
});
