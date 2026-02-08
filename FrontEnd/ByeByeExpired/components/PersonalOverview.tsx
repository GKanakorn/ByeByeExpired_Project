import React, { useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native"
import { supabase } from "../src/supabase"
import { getStoragesByLocation } from "../src/api/storage.api"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { STORAGE_ICON_CONFIG, DEFAULT_STORAGE_ICON } from "../constants/storageIcons";
import { router } from 'expo-router'

type Location = {
    id: string
    name: string
    type: "personal" | "business"
}

export default function PersonalOverview({ location }: { location: Location }) {
    const router = useRouter()
    const [storages, setStorages] = useState<any[]>([])
    const [loadingStorages, setLoadingStorages] = useState(false)

    useFocusEffect(
        React.useCallback(() => {
            const fetchStorages = async () => {
                try {
                    setLoadingStorages(true)
                    const { data: session } = await supabase.auth.getSession()
                    const token = session?.session?.access_token
                    if (!token) return

                    const data = await getStoragesByLocation(token, location.id)
                    setStorages(data)
                } catch (e) {
                    console.log("FETCH STORAGE ERROR", e)
                } finally {
                    setLoadingStorages(false)
                }
            }

            fetchStorages()
        }, [location.id])
    )
    //const [showAddOptions, setShowAddOptions] = useState(false);
    const [showPlusMinus, setShowPlusMinus] = useState(false);
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).toUpperCase();

    return (
        <View style={{ flex: 1, backgroundColor: "#F8F7FB" }}>
            {/* Scroll Content */}
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 120 }} // กันไม่ให้โดน Bottom Nav
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    {/* ซ้าย */}
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={styles.dateBox}>
                            <Image
                                source={require("../assets/images/home.png")}
                                style={styles.headerIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.dateText}>{location.name}</Text>
                            <Text style={styles.dateText}>{formattedDate}</Text>
                        </View>
                    </View>

                    {/* ขวา */}
                    <TouchableOpacity
                        style={styles.settingBtn}
                        onPress={() => router.push("/setting")}
                    >
                        <Ionicons name="settings-outline" size={20} color="#FF6EC7" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={16} color="#aaa" />
                    <TextInput placeholder="Search Product" style={styles.searchInput} />
                </View>

                {/* Nearly expired */}
                <LinearGradient
                    colors={["#FFE28A", "#FFF3C2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sectionHeader}
                >
                    <View style={styles.sectionTitle}>
                        <MaterialIcons name="error-outline" size={20} color="#F5A623" />
                        <Text style={[styles.sectionText, { color: "#ce840d" }]}>Nearly expired</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>12</Text>
                    </View>
                </LinearGradient>

                <View style={styles.NearlyExpiredBox}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {["24 JAN 2026", "25 JAN 2026", "28 JAN 2026", "29 JAN 2026", "29 JAN 2026", "30 JAN 2026"].map((date, i) => (
                            <View key={i} style={styles.card}>
                                <Image
                                    source={{ uri: "https://via.placeholder.com/60" }}
                                    style={styles.productImg}
                                />
                                <Text style={styles.cardDate}>{date}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Expired */}
                <LinearGradient
                    colors={["#FEC2D6", "#FEE5E1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sectionHeader}
                >
                    <View style={styles.sectionTitle}>
                        <Feather name="trash-2" size={20} color="#FF4D4D" />
                        <Text style={[styles.sectionText, { color: "#FF4D4D" }]}>Expired</Text>
                    </View>

                    <View style={styles.badgeCircle}>
                        <Text style={styles.badgeText}>8</Text>
                    </View>
                </LinearGradient>

                <View style={styles.ExpiredBox}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {["7 JAN 2026", "8 JAN 2026", "8 JAN 2026", "9 JAN 2026", "12 JAN 2026", "13 JAN 2026"].map((date, i) => (
                            <View key={i} style={styles.card}>
                                <Image
                                    source={{ uri: "https://via.placeholder.com/60" }}
                                    style={styles.productImg}
                                />
                                <Text style={styles.cardDate}>{date}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                {/* Storage */}
                <LinearGradient
                    colors={["#B7ECF7", "#D8F6FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sectionHeader}
                >
                    <View style={styles.sectionTitle}>
                        <Ionicons name="cube-outline" size={20} color="#3B82F6" />
                        <Text style={[styles.sectionText, { color: "#3B82F6" }]}>Storage</Text>
                    </View>
                </LinearGradient>

                <View style={styles.storageBox}>
                    {loadingStorages && (
                        <Text style={{ textAlign: "center", color: "#999" }}>
                            Loading...
                        </Text>
                    )}

                    {!loadingStorages && storages.map((item) => {
                        const iconConfig =
                            STORAGE_ICON_CONFIG[item.icon as keyof typeof STORAGE_ICON_CONFIG]
                            ?? DEFAULT_STORAGE_ICON;

                        return (
                            <View
                                key={item.id}
                                style={[
                                    styles.storageItem,
                                    {
                                        backgroundColor: "#d3ddff4d", // ✅ สีพื้นกล่อง คงที่
                                        borderRadius: 12,
                                        padding: 12,
                                    },
                                ]}
                            >
                                {/* วงกลม icon */}
                                <View
                                    style={[
                                        styles.iconCircle,
                                        { backgroundColor: item.color || iconConfig.color }, // ✅ สีอยู่แค่วงกลม
                                    ]}
                                >
                                    <Image
                                        source={iconConfig.image}
                                        style={styles.iconImage}
                                        resizeMode="contain"
                                    />
                                </View>

                                <Text style={{ flex: 1, marginLeft: 12, fontWeight: "600" }}>
                                    {item.name}
                                </Text>

                                <View
                                    style={[
                                        styles.countBubble,
                                        { backgroundColor: iconConfig.color },
                                    ]}
                                >
                                    <Text style={{ color: "white", fontSize: 12 }}>
                                        {item.item_count ?? 0}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={styles.addStorage}
                        onPress={() => router.push("/addStorage")}
                    >
                        <Text style={{ color: "#3B82F6", fontWeight: "600" }}>
                            + Add Storage
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavWrapper}>
                <View style={styles.bottomBackground} />

                <View style={styles.bottomNav}>
                    <TouchableOpacity onPress={() => router.push("/allProduct")}>
                        <Image
                            source={require("../assets/images/button1.png")}
                            style={{ width: 22, height: 22 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image
                            source={require("../assets/images/button2.png")}
                            style={{ width: 27, height: 27 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image
                            source={require("../assets/images/button3.png")}
                            style={{ width: 27, height: 27 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image
                            source={require("../assets/images/button4.png")}
                            style={{ width: 22, height: 22 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Add Product Button */}
            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowPlusMinus(!showPlusMinus)}
            >
                <Image source={require("../assets/images/add.png")} style={styles.addIcon} />
            </TouchableOpacity>


            {showPlusMinus && (
                <View style={styles.plusMinusContainer}>
                    <TouchableOpacity
                        style={styles.minusBtn}
                        onPress={() => {
                            setShowPlusMinus(false)
                            router.push({
                                pathname: '/scanBarcode',
                                params: { mode: 'remove' },
                            })
                        }}
                    >
                        <Text style={styles.pmText}>-</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.plusBtn}
                        onPress={() => {
                            setShowPlusMinus(false)
                            router.push({
                                pathname: '/scanBarcode',
                                params: { mode: 'add' },
                            })
                        }}
                    >
                        <Text style={styles.pmText}>+</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
}

function StorageItem({
    title,
    count,
    icon,
}: {
    title: string;
    count: number;
    icon: any;
}) {
    return (
        <View style={styles.storageItem}>
            <Ionicons name={icon} size={20} color="#3B82F6" />
            <Text style={{ flex: 1, marginLeft: 10 }}>{title}</Text>
            <View style={styles.countBubble}>
                <Text style={{ color: "white", fontSize: 12 }}>{count}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },

    /* Header */
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50, // เว้นระยะจากขอบบน
        marginBottom: 2,
    },
    dateBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFE4F2",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    dateText: {
        marginLeft: 6,
        color: "#FF6EC7",
        fontWeight: "600",
    },
    settingBtn: {
        backgroundColor: "#FFF",
        padding: 8,
        borderRadius: 20,
    },

    /* Search */
    searchBox: {
        flexDirection: "row",
        backgroundColor: "#EEE",
        padding: 10,
        borderRadius: 20,
        marginVertical: 12,
        alignItems: "center",
        marginBottom: 2,
    },
    searchInput: {
        marginLeft: 8,
        flex: 1,
    },

    /* Section */
    sectionHeader: {
        flexDirection: "row",
        padding: 10,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
    },
    sectionTitle: {
        flexDirection: "row",
        alignItems: "center",
    },
    sectionText: {
        marginLeft: 6,
        fontWeight: "600",
    },
    badge: {
        backgroundColor: "#F5A623",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: "white",
        fontSize: 12,
    },

    /* Cards */
    card: {
        backgroundColor: "#fff0f0",
        padding: 10,
        borderRadius: 12,
        marginRight: 10,
        marginTop: 10,
        alignItems: "center",
        width: 90,
    },
    productImg: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginBottom: 6,
    },
    cardDate: {
        fontSize: 10,
        color: "#888",
    },

    NearlyExpiredBox: {
        backgroundColor: "#FFF",
        width: 350,
        height: 120,
        borderRadius: 16,
        padding: 9,
        marginTop: 10,
        alignSelf: "center",
    },

    ExpiredBox: {
        backgroundColor: "#FFF",
        width: 350,
        height: 120,
        borderRadius: 16,
        padding: 9,
        marginTop: 10,
        alignSelf: "center",
    },

    /* Storage */
    storageBox: {
        backgroundColor: "#FFF",
        width: 350,
        borderRadius: 16,
        padding: 12,
        marginTop: 10,
        alignSelf: "center",
    },
    storageItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    countBubble: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    addStorage: {
        alignItems: "center",
        marginTop: 10,
    },

    /* Bottom Navigation */
    bottomNavWrapper: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 120,
        pointerEvents: "box-none",
    },
    bottomBackground: {
        position: "absolute",
        bottom: -290,
        left: -210,
        right: -210,
        height: 380,
        backgroundColor: "#FFF",
        borderTopLeftRadius: 500,
        borderTopRightRadius: 500,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 15,
        pointerEvents: "none",
    },
    bottomNav: {
        position: "absolute",
        bottom: 20,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        pointerEvents: "auto",
    },

    /* Add Button */
    addBtn: {
        position: "absolute",
        bottom: 60,
        alignSelf: "center",
        backgroundColor: "#F19BEA",
        borderRadius: 50,
        height: 50,
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        elevation: 1000,
    },
    addText: {
        fontSize: 28,
        color: "#FFF",
    },
    badgeCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,   // ครึ่งหนึ่งของ width/height = วงกลมพอดี
        backgroundColor: "#FF4D4D",
        justifyContent: "center",
        alignItems: "center",
    },
    addIcon: {
        width: 45,
        height: 45,
        resizeMode: "contain",
    },

    plusMinusContainer: {
        position: "absolute",
        bottom: 110,
        alignSelf: "center",
        flexDirection: "row",
        gap: 40,
        zIndex: 1001,
        elevation: 1001,
    },

    plusBtn: {
        width: 40,
        height: 40,
        borderRadius: 25,
        backgroundColor: "#ff9eef",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },

    minusBtn: {
        width: 40,
        height: 40,
        borderRadius: 25,
        backgroundColor: "#ff9eef",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },

    pmText: {
        color: "#FFF",
        fontSize: 26,
        fontWeight: "medium",
    },

    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },

    iconImage: {
        width: 26,
        height: 26,
    },

    headerIcon: {
        width: 27,
        height: 27,
    }
});