import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Image,
    TextInput, // ⭐ เพิ่ม
    FlatList,
    Alert,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { supabase } from '../src/supabase'
import { getMyLocations } from '../src/api/location.api'
import { deleteLocation } from '../src/api/location.api'
import { useLocation } from '../src/context/LocationContext'

type Location = {
    id: string
    name: string
    type: 'personal' | 'business'
}

export default function SettingScreen() {
    const navigation = useNavigation();
    const { setCurrentLocation } = useLocation()

    const [mode, setMode] = useState("select");
    const [admins, setAdmins] = useState(["ผู้ดูแล 1", "ผู้ดูแล 2"]); // ⭐ เพิ่ม
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch locations function moved out of useEffect
    const fetchLocations = async () => {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        if (!token) return;

        const data = await getMyLocations(token);
        setLocations(data);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchLocations();
        }, [])
    );

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
                            selectedLocationId
                                ? setSelectedLocationId(null)
                                : navigation.goBack()
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
                        {selectedLocationId
                            ? locations.find(l => l.id === selectedLocationId)?.name
                            : "เลือกสถานที่"}
                    </Text>
                    <Text style={styles.subtitle}>
                        จัดการสินค้าและวันหมดอายุแยกตามสถานที่
                    </Text>
                </View>

                {/* Cards */}
                <FlatList
                    data={[
                        ...(locations ?? []),
                        { id: "add", name: "", type: "personal" as const }
                    ]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item }) => {
                        console.log('LOCATION ITEM:', item);
                        if (item.id === "add") {
                            return (
                                <TouchableOpacity
                                    style={[styles.card, styles.cardAdd]}
                                    onPress={() => navigation.navigate("addLocation" as never)}
                                >
                                    <Ionicons name="add-circle-outline" size={48} color="#000" />
                                    <Text style={styles.addText}>เพิ่มสถานที่ใหม่</Text>
                                </TouchableOpacity>
                            );
                        }

                        const isSelected = selectedLocationId === item.id;
                        const isDimmed =
                            selectedLocationId !== null && selectedLocationId !== item.id;

                        const isPersonal = item.type === "personal";

                        return (
                            <View
                                style={[
                                    styles.card,
                                    !isSelected && isDimmed && { opacity: 0.4 },
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.closeBtn}
                                    onPress={() => {
                                        Alert.alert(
                                            'ยืนยันการลบ',
                                            'แน่ใจนะว่าจะลบสถานที่นี้?',
                                            [
                                                { text: 'ยกเลิก', style: 'cancel' },
                                                {
                                                    text: 'ลบ',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        try {
                                                            setDeletingId(item.id)
                                                            const { data: session } = await supabase.auth.getSession()
                                                            const token = session?.session?.access_token
                                                            if (!token) return

                                                            await deleteLocation(token, item.id)

                                                            setLocations(prev => prev.filter(l => l.id !== item.id))
                                                            if (selectedLocationId === item.id) {
                                                                setSelectedLocationId(null)
                                                            }
                                                        } catch (e) {
                                                            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบสถานที่ได้')
                                                        } finally {
                                                            setDeletingId(null)
                                                        }
                                                    }
                                                }
                                            ]
                                        )
                                    }}
                                >
                                    <Ionicons name="close" size={16} color="#999" />
                                </TouchableOpacity>
                                {deletingId === item.id && (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="small" color="#999" />
                                    </View>
                                )}
                                <Image
                                    source={
                                        isPersonal
                                            ? require("../assets/images/home.png")
                                            : require("../assets/images/restaurant.png")
                                    }
                                    style={styles.cardImage}
                                />

                                <Text
                                    style={[
                                        styles.cardTitle,
                                        !isPersonal && { color: "#E46B2C" },
                                    ]}
                                >
                                    {item.name}
                                </Text>

                                <Text style={styles.cardSub}>
                                    ประเภท: {isPersonal ? "ส่วนตัว" : "ธุรกิจ"}
                                </Text>

                                <TouchableOpacity
                                    style={[
                                        styles.enterBtn,
                                        isPersonal ? styles.greenBtn : styles.orangeBtn,
                                    ]}
                                    onPress={() => {
                                        setCurrentLocation(item)
                                        setSelectedLocationId(item.id)
                                        navigation.goBack()
                                    }}
                                >
                                    <Text style={styles.enterText}>เข้าใช้งาน</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />

                {/* ===== ผู้ดูแล ===== */}
                {selectedLocationId && (
                    <View style={styles.adminSection}>
                        <View style={styles.adminHeader}>
                            <Ionicons
                                name="people"
                                size={18}
                                color="#000"
                            />
                            <Text style={styles.adminTitle}>
                                จัดการผู้ใช้
                            </Text>
                        </View>

                        <View style={styles.adminBox}>
                            {admins.map((name, index) => (
                                <View
                                    key={index}
                                    style={styles.adminRow}
                                >
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
                                            setAdmins(
                                                admins.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }
                                    >
                                        <Ionicons
                                            name="close"
                                            size={18}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.addAdminBtn}
                                onPress={() =>
                                    setAdmins([...admins, ""])
                                }
                            >
                                <Ionicons
                                    name="add-circle-outline"
                                    size={20}
                                    color="#000"
                                />
                                <Text style={styles.addAdminText}>
                                    เพิ่มผู้ใช้
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Delete Account */}
                <View style={styles.deleteBox}>
                    <TouchableOpacity style={styles.deleteBtn}>
                        <Text style={styles.deleteText}>
                            ลบบัญชี
                        </Text>
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
        height: 170,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        marginRight: 14,
    },

    closeBtn: {
        position: "absolute",
        top: 6,
        right: 6,
        zIndex: 10,
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        zIndex: 20,
    },

    cardImage: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        marginTop: 4,
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
        marginBottom: 6,
    },

    enterBtn: {
        width: "100%",
        paddingVertical: 6,
        borderRadius: 16,
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
