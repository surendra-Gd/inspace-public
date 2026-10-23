import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import { useSelector } from 'react-redux';
import {getCurrentSpace, getUnseenRequestsCount} from "../../../../service/selectors/spaceSelectors";
import SpaceRequests from "../../../../components/activity/SpaceRequests";
import Activities from "../../../../components/activity/Activities";
import {rem} from "../../../../utils/uiUtils";


function InSpaceActivity() {
    const { currentMember, spaceId } = useSelector(getCurrentSpace);

    const [modalOpen, setModalOpen] = useState(false);
    const [requestsLoading, setRequestsLoading] = useState(false);

    const count = useSelector(getUnseenRequestsCount);

    return (
        <View style={styles.container}>

            {currentMember?.admin && (
                <TouchableOpacity style={styles.requestButton}
                    onPress={() => setModalOpen(!modalOpen)}
                >
                    <Text style={styles.requestButtonText}>Requests</Text>
                    <Image source={require("../../../../assets/images/down.png")} style={[styles.icon, modalOpen ? styles.iconActive : styles.iconDefault]} />
                    {(count > 0 && count !== null) && (
                        <View style={styles.unseenIcon}>
                            <Text style={styles.unseenIconText}>
                                {count}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}

            {modalOpen && (
                <SpaceRequests count={count}
                    setLoading={setRequestsLoading}
                    spaceId={spaceId} loading={requestsLoading} />
            )}

            <Activities spaceId={spaceId} isAdmin={currentMember?.admin}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: rem(7.3),
        backgroundColor: '#000',
        height: "100%"
    },
    dropdownContainerActive: {
        backgroundColor: '#e0f7fa',
    },
    requestButton: {
        position:"absolute",
        alignSelf: "flex-start",
        top: rem(0.8),
        marginLeft: rem(1.2),
        width: 134,
        height: 35,
        borderRadius: 24,
        backgroundColor: "#141414FF",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    requestButtonText: {
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold",
        color: '#fff',
        letterSpacing: rem(0.05)
    },
    icon: {
        width: 17,
        height: 17,
        marginLeft: rem(1),
        transform: [{translateY: 0}],
        pointerEvents: "auto"
    },
    iconActive: {
        transform: [{"rotateX": "180deg"}]
    },
    unseenIcon: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "yellow",
        width: 18,
        height: 18,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4
    },
    unseenIconText: {
        borderRadius: 10,
        fontSize: 12,
        textAlign: "center",
        verticalAlign: "middle",
        fontFamily: "Inter_600SemiBold",
        color: "#000"
    },
});

export default InSpaceActivity;