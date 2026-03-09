import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    Pressable,
    Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
    getManageLocation,
    deleteMember,
    inviteMemberToLocation,
} from "../src/api/manageLocation.api";
import { getMyLocations } from "../src/api/location.api";
import { supabase } from "@/src/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

type Member = {
    id: string;
    email: string;
    role: "owner" | "member";
};

export default function ManageLocationScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { locationId } = route.params;

    const [locationName, setLocationName] = useState<string>("");
    const [ownerId, setOwnerId] = useState<string>("");
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [locationType, setLocationType] = useState<'personal' | 'business' | null>(null);

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [inviteVisible, setInviteVisible] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<Member["role"]>("member");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const { data: session } = await supabase.auth.getSession();
            const token = session?.session?.access_token;

            if (!token) {
                Alert.alert("Error", "Token not found");
                return;
            }

            const data = await getManageLocation(token, locationId);

            setLocationName(data.locationName);
            setOwnerId(data.ownerId);
            const { data: userData } = await supabase.auth.getUser();
            setCurrentUserId(userData.user?.id || "");

            setMembers(data.members);
            // also fetch location type so we know which icon to show
            try {
              const allLocs = await getMyLocations(token);
              const found = allLocs.find((l: any) => l.id === locationId);
              setLocationType(found?.type || null);
            } catch (e) {
              console.log('Failed to fetch location type', e);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const isOwner = currentUserId === ownerId;

    const removeMember = async (memberId: string) => {
        Alert.alert("Confirm", "Do you want to remove this member?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    try {
                        setUpdatingId(memberId);

                        const { data: session } = await supabase.auth.getSession();
                        const token = session?.session?.access_token;
                        if (!token) return;

                        await deleteMember(token, locationId, memberId);

                        setMembers((prev) =>
                            prev.filter((m) => m.id !== memberId)
                        );
                    } catch {
                        Alert.alert("Error", "Failed to remove member");
                    } finally {
                        setUpdatingId(null);
                    }
                },
            },
        ]);
    };

    const inviteMember = async () => {
        if (!inviteEmail) return;

        try {
            const { data: session } = await supabase.auth.getSession();
            const token = session?.session?.access_token;
            if (!token) return;

            const { data: userData } = await supabase.auth.getUser();
            const invitedByName =
                userData.user?.user_metadata?.full_name ||
                userData.user?.email ||
                "Owner";

            await inviteMemberToLocation(
                token,
                locationId,
                inviteEmail,
                inviteRole,
                invitedByName
            );

            setInviteVisible(false);
            setInviteEmail("");
            fetchData();
        } catch {
            Alert.alert("Error", "Failed to invite member");
        }
    };

    const renderRoleBadge = (role: Member["role"]) => {
        const map = {
            owner: { bg: "#FFC107", label: "Owner" },
            member: { bg: "#00B894", label: "Member" },
        };

        return (
            <View style={[styles.roleBadge, { backgroundColor: map[role].bg }]}>
                <Text style={styles.roleText}>{map[role].label}</Text>
            </View>
        );
    };

    const renderItem = ({ item }: { item: Member }) => {
        const canEdit = isOwner && item.id !== ownerId;

        return (
            <View style={styles.memberCard}>
                <View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.email}>{item.email}</Text>
                        {item.id === ownerId && (
                            <Text style={{ marginLeft: 6 }}>👑</Text>
                        )}
                    </View>
                    {renderRoleBadge(item.role)}
                </View>

                {canEdit && (
                    <TouchableOpacity
                        onPress={() => removeMember(item.id)}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={22}
                            color="#D32F2F"
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <LinearGradient
            colors={["#cbd1faff", "#eef4f8ff", "#cfe9f9ff"]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color="#5A6AE0" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage Location</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Title */}
                <View style={styles.titleBox}>
                    {locationType && (
                        <View style={styles.iconWrapper}>
                          <Image
                              source={
                                  locationType === 'personal'
                                      ? require('../assets/images/home.png')
                                      : require('../assets/images/business.png')
                              }
                              style={styles.locationIcon}
                          />
                        </View>
                    )}
                    <Text style={styles.title}>{locationName}</Text>
                    <Text style={styles.subtitle}>Manage members in this location</Text>
                    {isOwner && (
                        <TouchableOpacity
                            style={styles.inviteBtn}
                            onPress={() => setInviteVisible(true)}
                        >
                            <Ionicons name="person-add-outline" size={18} color="#FFF" />
                            <Text style={styles.inviteText}>Invite Member</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color="#5A6AE0"
                        style={{ marginTop: 40 }}
                    />
                ) : (
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 20 }}
                        ListEmptyComponent={
                            <Text style={{ textAlign: "center", marginTop: 40 }}>
                                No members found
                            </Text>
                        }
                    />
                )}
                <Modal visible={inviteVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Invite by Email</Text>

                            <TextInput
                                placeholder="Enter email"
                                value={inviteEmail}
                                onChangeText={setInviteEmail}
                                style={styles.input}
                            />

                            <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                                Role
                            </Text>

                            <View style={styles.roleButtonRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.roleButton,
                                        inviteRole === "member" && styles.roleButtonActive,
                                    ]}
                                    onPress={() => setInviteRole("member")}
                                >
                                    <Text
                                        style={[
                                            styles.roleButtonText,
                                            inviteRole === "member" && styles.roleButtonTextActive,
                                        ]}
                                    >
                                        MEMBER
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalRow}>
                                <TouchableOpacity onPress={() => setInviteVisible(false)}>
                                    <Text style={{ color: "#999" }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={inviteMember}>
                                    <Text style={{ color: "#6C63FF", fontWeight: "600" }}>
                                        Invite
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>



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
        justifyContent: "center",
        marginTop: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginTop: 8,
    },
    iconWrapper: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    locationIcon: {
        width: 115,
        height: 115,
        resizeMode: 'contain',
    },
    subtitle: {
        fontSize: 14,
        color: "#9AA0B4",
        marginTop: 6,
    },
    memberCard: {
        backgroundColor: "#FFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    email: {
        fontSize: 14,
        fontWeight: "600",
    },
    roleBadge: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    roleText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    inviteBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#6C63FF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        marginTop: 16,
    },
    inviteText: {
        color: "#FFF",
        fontWeight: "600",
        marginLeft: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 20,
    },
    modalBox: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
    },
    roleSelector: {
        padding: 12,
        backgroundColor: "#F5F6FA",
        borderRadius: 12,
        marginBottom: 16,
    },
    modalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    centerOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    roleModalBox: {
        width: "100%",
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 20,
    },
    roleOption: {
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#F1F1F1",
        marginBottom: 12,
    },
    roleOptionActive: {
        backgroundColor: "#6C63FF",
    },
    roleOptionText: {
        textAlign: "center",
        fontWeight: "600",
        color: "#000",
    },
    roleOptionTextActive: {
        color: "#FFF",
    },
    roleButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },

    roleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#F1F1F1",
        marginHorizontal: 4,
        alignItems: "center",
    },

    roleButtonActive: {
        backgroundColor: "#6C63FF",
    },

    roleButtonText: {
        fontWeight: "600",
        color: "#000",
    },

    roleButtonTextActive: {
        color: "#FFF",
    },
    segmentedContainer: {
        flexDirection: "row",
        marginTop: 8,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },

    segmentButton: {
        flex: 1,
        paddingVertical: 6,
        alignItems: "center",
    },

    segmentLeft: {
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },

    segmentRight: {
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },

    segmentActive: {
        backgroundColor: "#6C63FF",
    },

    segmentText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
    },

    segmentTextActive: {
        color: "#FFFFFF",
    },
});