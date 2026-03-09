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
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { supabase } from '../src/supabase'
import { getMyLocations, deleteLocation, Location } from '../src/api/location.api'
import { useLocation } from '../src/context/LocationContext'
import { getUserNotifications, LocationNotifications, NotificationItem } from '../src/api/notification.api'


export default function SettingScreen() {
    const navigation = useNavigation();
    const { setCurrentLocation } = useLocation()

    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<LocationNotifications[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Fetch locations function moved out of useEffect
    const fetchLocations = async () => {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        if (!token) return;

        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id || null
        setCurrentUserId(userId)

        const data = await getMyLocations(token);
        setLocations(data);
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true)
            const { data: session } = await supabase.auth.getSession();
            const token = session?.session?.access_token;
            if (!token) return;

            const data = await getUserNotifications(token);
            setNotifications(data);
        } catch (err) {
            console.log("FETCH NOTIFICATIONS ERROR:", err)
        } finally {
            setLoadingNotifications(false)
        }
    };

    const mergeNotifications = (items: NotificationItem[]) => {
        const merged = new Map<string, NotificationItem & { alerts: Array<{ type: 'expiring' | 'low_stock'; daysUntilExpiry?: number }> }>()

        for (const item of items) {
            if (!merged.has(item.id)) {
                merged.set(item.id, {
                    ...item,
                    alerts: [{ type: item.type, daysUntilExpiry: item.daysUntilExpiry }],
                })
                continue
            }

            const existing = merged.get(item.id)!
            if (!existing.alerts.some((alert) => alert.type === item.type)) {
                existing.alerts.push({ type: item.type, daysUntilExpiry: item.daysUntilExpiry })
            }

            if (item.imageUrl) existing.imageUrl = item.imageUrl
            existing.quantity = Math.min(existing.quantity, item.quantity)
            if (item.daysUntilExpiry !== undefined) existing.daysUntilExpiry = item.daysUntilExpiry
        }

        return Array.from(merged.values())
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchLocations();
            fetchNotifications();
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
                    <Text style={styles.headerTitle}>Menu</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Title */}
                <View style={styles.titleBox}>
                    <Text style={styles.title}>
                        {selectedLocationId
                            ? locations.find(l => l.id === selectedLocationId)?.name
                            : "Select Location"}
                    </Text>
                    <Text style={styles.subtitle}>
                        Manage products and expiration dates by location
                    </Text>
                </View>

                {/* Cards - Horizontal Scroll (Fixed Height) */}
                <View style={styles.cardsContainer}>
                    <FlatList
                        data={[
                            ...(locations ?? []),
                            { 
                                id: "add", 
                                name: "", 
                                type: "personal" as const, 
                                owner_id: "", 
                                role: "member" as const 
                            }
                        ]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                        scrollEnabled={true}
                        renderItem={({ item }) => {
                            console.log('LOCATION ITEM:', item);
                            if (item.id === "add") {
                                return (
                                    <TouchableOpacity
                                        style={[styles.card, styles.cardAdd]}
                                        onPress={() => navigation.navigate("addLocation" as never)}
                                    >
                                        <Ionicons name="add-circle-outline" size={48} color="#000" />
                                        <Text style={styles.addText}>Add New Location</Text>
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
                                    {item.role === "owner" && (
                                    <TouchableOpacity
                                        style={styles.closeBtn}
                                        onPress={() => {
                                            Alert.alert(
                                                'Confirm Deletion',
                                                'Are you sure you want to delete this location?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
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
                                                            } catch (e: any) {
                                                                Alert.alert('Delete location failed', e?.message || 'Unable to delete location')
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
                                    )}
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
                                        Type: {isPersonal ? "Personal" : "Business"}
                                    </Text>

                                    <TouchableOpacity
                                        style={[
                                            styles.enterBtn,
                                            isPersonal ? styles.greenBtn : styles.orangeBtn,
                                        ]}
                                        onPress={() => {
                                            if (item.id !== "add") {
                                                setCurrentLocation(item)
                                            }
                                            navigation.goBack()
                                        }}
                                    >
                                        <Text style={styles.enterText}>Enter</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.manageBtn}
                                        onPress={() => {
                                            (navigation.navigate as any)("manageLocation", { locationId: item.id });
                                        }}
                                    >
                                        <Text style={styles.manageText}>Manage Users</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }}
                    />
                </View>

                {/* Notifications Title - Fixed */}
                {notifications.length > 0 && (
                    <View style={styles.notificationsTitleContainer}>
                        <Text style={styles.notificationsTitle}>📬 Notifications</Text>
                    </View>
                )}

                {/* Notifications - Vertical Scroll */}
                <ScrollView 
                    style={styles.notificationsScrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {notifications.length > 0 && (
                        <View style={styles.notificationsSection}>
                            {notifications.map((location) => {
                                const mergedItems = mergeNotifications(location.notifications || [])

                                return (
                                <View key={location.locationId} style={styles.locationNotifications}>
                                    <View style={styles.locationHeader}>
                                        <Text style={styles.locationName}>{location.locationName}</Text>
                                        <View style={styles.locationCountBadge}>
                                            <Text style={styles.locationCountText}>{mergedItems.length}</Text>
                                        </View>
                                    </View>
                                    {mergedItems.map((notif, idx) => (
                                        <View key={idx} style={styles.notificationItem}>
                                            <View style={styles.notificationContent}>
                                                {notif.imageUrl && (
                                                    <Image 
                                                        source={{ uri: notif.imageUrl }}
                                                        style={styles.notifImage}
                                                    />
                                                )}
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.notifName} numberOfLines={1}>{notif.name}</Text>
                                                    <Text style={styles.notifType}>
                                                        {notif.alerts.map((alert) =>
                                                            alert.type === 'expiring' ? '🕐 Expiring Soon' : '📉 Out of Stock'
                                                        ).join(' • ')}
                                                    </Text>
                                                    {notif.alerts.some((alert) => alert.type === 'expiring') && (
                                                        <Text style={styles.notifDate}>
                                                            {notif.daysUntilExpiry === 0 
                                                                ? 'Expires today!' 
                                                                : `Expires in ${notif.daysUntilExpiry} day(s)`}
                                                        </Text>
                                                    )}
                                                    {notif.alerts.some((alert) => alert.type === 'low_stock') && (
                                                        <Text style={styles.notifDate}>Only {notif.quantity} left</Text>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                )
                            })}
                        </View>
                    )}
                </ScrollView>
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
    
    // Cards Container - Fixed Height for Horizontal Scroll
    cardsContainer: {
        height: 230,
        marginBottom: 16,
    },

    // Notifications ScrollView - Take Remaining Space
    notificationsScrollView: {
        flex: 1,
        paddingBottom: 20,
    },    titleBox: {
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
        height: 190,
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

    manageBtn: {
        marginTop: 6,
        width: "100%",
        paddingVertical: 6,
        borderRadius: 16,
        alignItems: "center",
        backgroundColor: "#EAF0FF",
    },

    manageText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#5A6AE0",
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

    // Notifications Styles
    notificationsTitleContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    notificationsSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    notificationsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    locationNotifications: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    locationName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5A6AE0',
    },
    locationCountBadge: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#5A6AE0',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    locationCountText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    notificationItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    notifImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#EEE',
    },
    notifName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    notifType: {
        fontSize: 12,
        color: '#FF6EC7',
        fontWeight: '500',
        marginTop: 2,
    },
    notifDate: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
});
