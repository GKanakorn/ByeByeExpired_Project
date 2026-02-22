import React, { useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native"
import { getStoragesByLocation } from "../src/api/storage.api"
import { getOverview } from "../src/api/product.api"
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
import { supabase } from '../src/supabase'
import 'react-native-gesture-handler'
import { Swipeable } from 'react-native-gesture-handler'
import { RectButton } from 'react-native-gesture-handler'
import { deleteStorage } from '../src/api/storage.api'
import { searchProducts } from "../src/api/product.api"
import { Alert } from 'react-native'

type Location = {
    id: string
    name: string
    type: "personal" | "business"
}

export default function PersonalOverview({ location }: { location: Location }) {
    const router = useRouter()
    const [storages, setStorages] = useState<any[]>([])
    const [loadingStorages, setLoadingStorages] = useState(false)
    const [nearlyExpired, setNearlyExpired] = useState<any[]>([])
    const [expired, setExpired] = useState<any[]>([])
    const [searchText, setSearchText] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const [allProducts, setAllProducts] = useState<any[]>([])

    const fetchAllData = async () => {
        try {
            setLoadingStorages(true)

            const { data: session } = await supabase.auth.getSession()
            const token = session?.session?.access_token
            const userId = session?.session?.user?.id

            if (!token || !userId) return

            // 1️⃣ โหลด storages
            const storageData = await getStoragesByLocation(token, location.id)
            setStorages(storageData)

            // 2️⃣ โหลด overview ใหม่
            const overview = await getOverview(location.id)
            setNearlyExpired(overview.nearlyExpired || [])
            setExpired(overview.expired || [])
            setAllProducts([
                ...(overview.nearlyExpired || []),
                ...(overview.expired || [])
            ])

        } catch (e) {
            console.log("FETCH OVERVIEW ERROR", e)
        } finally {
            setLoadingStorages(false)
        }
    }
    const handleDeleteStorage = async (storageId: string) => {
        Alert.alert(
            'Delete Storage',
            'Are you sure you want to delete this storage?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data: session } = await supabase.auth.getSession()
                            const token = session?.session?.access_token
                            if (!token) return

                            // โหลดใหม่แบบเดียวกับตอน fetch
                            await deleteStorage(token, storageId)
                            await fetchAllData()

                        } catch (error) {
                            console.log("DELETE STORAGE ERROR:", error)
                        }
                    }
                }
            ]
        )
    }
    const renderRightActions = (storageId: string) => (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteStorage(storageId)}
        >
            <Text style={{ color: "white", fontWeight: "600" }}>
                Delete
            </Text>
        </TouchableOpacity>
    );

    useFocusEffect(
        React.useCallback(() => {
            fetchAllData()
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

    const handleSearch = async (text: string) => {
        if (text.trim().length === 0) {
            setSearchResults([])
            setIsSearching(false)
            return
        }

        try {
            setIsSearching(true)
            const result = await searchProducts(location.id, text)
            setSearchResults(result)
        } catch (err) {
            console.log("SEARCH ERROR:", err)
        } finally {
            setIsSearching(false)
        }
    }
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
                    <TextInput
                        placeholder="Search Product"
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text)
                            handleSearch(text)
                        }}
                    />

                    {searchText.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchText("")
                                setSearchResults([])
                            }}
                        >
                            <Ionicons name="close-circle" size={18} color="#aaa" />
                        </TouchableOpacity>
                    )}
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
                        <Text style={styles.badgeText}>{nearlyExpired.length}</Text>
                    </View>
                </LinearGradient>

                <View style={styles.NearlyExpiredBox}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {nearlyExpired.map((item) => {
                            const formatted = new Date(item.expiration_date)
                                .toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                .toUpperCase()

                            return (
                                <View key={item.id} style={styles.cardNear}>
                                    <Image
                                        source={{ uri: item.product_templates?.image_url || 'https://via.placeholder.com/60' }}
                                        style={styles.productImg}
                                    />
                                    <Text style={styles.cardDateNear}>{formatted}</Text>
                                </View>
                            )
                        })}
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

                    <View style={styles.badgeEx}>
                        <Text style={styles.badgeText}>{expired.length}</Text>
                    </View>
                </LinearGradient>

                <View style={styles.ExpiredBox}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {expired.map((item) => {
                            const formatted = new Date(item.expiration_date)
                                .toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                .toUpperCase()

                            return (
                                <View key={item.id} style={styles.cardEx}>
                                    <Image
                                        source={{
                                            uri: item.product_templates?.image_url || 'https://via.placeholder.com/60',
                                        }}
                                        style={styles.productImg}
                                    />
                                    <Text style={styles.cardDateEx}>{formatted}</Text>
                                </View>
                            )
                        })}
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
                            <Swipeable
                                key={item.id}
                                renderRightActions={() => renderRightActions(item.id)}
                                overshootRight={false}
                                rightThreshold={40}
                            >
                                <View
                                    style={[
                                        styles.storageItem,
                                        {
                                            backgroundColor: "#d3ddff4d",
                                            borderRadius: 12,
                                            padding: 12,
                                        },
                                    ]}
                                >
                                    {/* วงกลม icon */}
                                    <View
                                        style={[
                                            styles.iconCircle,
                                            { backgroundColor: item.color || iconConfig.color },
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
                            </Swipeable>
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

            {searchText.length > 0 && (
                <>
                    <TouchableOpacity
                        style={styles.searchOverlayBackground}
                        activeOpacity={1}
                        onPress={() => {
                            setSearchText("")
                            setSearchResults([])
                        }}
                    />

                    <View style={styles.searchDropdown}>
                        {isSearching ? (
                            <Text style={{ color: "#999" }}>Searching...</Text>
                        ) : searchResults.length === 0 ? (
                            <Text style={{ color: "#999" }}>No product found</Text>
                        ) : (
                            searchResults.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.searchResultItem}
                                    onPress={() => {
                                        setSearchText("")
                                        setSearchResults([])
                                        router.push({
                                            pathname: "/showDetailPersonal",
                                            params: { productId: item.id }
                                        })
                                    }}
                                >
                                    <Text style={{ fontWeight: "500" }}>
                                        {item.product_templates?.name}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </>
            )}

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
                    <TouchableOpacity onPress={() => router.push("/NearlyExpired")}>
                        <Image
                            source={require("../assets/images/button2.png")}
                            style={{ width: 27, height: 27 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/Expired")}>
                        <Image
                            source={require("../assets/images/button3.png")}
                            style={{ width: 27, height: 27 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/profile")}>
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
                            router.replace({
                                pathname: '/scanBarcode',
                                params: {
                                    mode: 'remove',
                                    context: location.type,
                                    locationId: location.id,
                                },
                            })
                        }}
                    >
                        <Text style={styles.pmText}>-</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.plusBtn}
                        onPress={() => {
                            setShowPlusMinus(false)
                            router.replace({
                                pathname: '/scanBarcode',
                                params: {
                                    mode: 'add',
                                    context: location.type,
                                    locationId: location.id,
                                },
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
        backgroundColor: '#4CAF50',

        width: 28,
        height: 28,

        borderRadius: 14,   // ต้อง = width/2
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },

    /* Cards */
    cardNear: {
        backgroundColor: "#FBF4D2",
        padding: 10,
        borderRadius: 12,
        marginRight: 10,
        marginTop: 10,
        alignItems: "center",
        width: 90,
    },
    cardEx: {
        backgroundColor: "#BE9090",
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
    cardDateEx: {
        fontSize: 10,
        color: "#ffffff",
    },
    cardDateNear: {
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
        width: 24,
        height: 24,

        borderRadius: 12,   // ต้อง = width/2
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
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
    badgeEx: {
        backgroundColor: "#FF4D4D",
        width: 28,
        height: 28,

        borderRadius: 14,   // ต้อง = width/2
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        borderRadius: 12,
        marginVertical: 5,
    },

    deleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
    searchOverlayBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2999,
    },
    searchDropdown: {
        position: "absolute",
        top: 165,
        left: 20,
        right: 20,
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
        zIndex: 3000,
    },

    searchResultItem: {
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#eee",
    },
});