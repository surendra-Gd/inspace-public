import {Pressable, Image, StyleSheet, FlatList, View, ActivityIndicator, Text} from "react-native";
import React, {Fragment, useCallback, useEffect, useState} from "react";
import { rem } from "../../../../../utils/uiUtils";
import { ShareTextModal } from "../../../../../components/modal/ShareTextModal";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSpace, getSpaceTextsSelector } from "../../../../../service/selectors/spaceSelectors";
import { getTextsAction } from "../../../../../service/actions/textActions";
import TextItem from "../../../../../components/text/TextItem";
import {getLoadingState, selectIsErrorExists} from "../../../../../service/selectors/appSelectors";
import {ADD_TEXT_LOADING} from "../../../../../service/constants/appConstants";

/*
    {"anonymous": false, "createdOn": "2024-12-24T12:27:00.729353", "lastUpdatedOn": "20
    25-01-11T16:26:35.922275", "liked": true, "likesCount": 2, "memberId": 27, "messagesCount": 158,
    "page": null, "spaceId": 3, "tagged": null, "text": "Today I want streak", "textId": 40}
*/

const Text_ = () => {
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const dispatch = useDispatch();
    const { spaceId, currentMember, text } = useSelector(getCurrentSpace);
    const addTextLoading = useSelector(state =>
        getLoadingState(state, spaceId, ADD_TEXT_LOADING));

    const page = text?.page;
    const currentMemberId = currentMember?.memberId;

    const spaceTexts = useSelector(state => getSpaceTextsSelector(state, spaceId));
    const textsError = useSelector(state =>
        selectIsErrorExists(state, spaceId, "GET_TEXTS_ERROR"));

    const fetchTexts = useCallback( async () => {
        try {
            if (!page || (page?.hasNext && !loading)) {
                setLoading(true);
                const fetchPage = page ? page.currentPage + 1 : 0;
                await dispatch(getTextsAction(fetchPage));
            }
        } finally {
            setLoading(false);
        }
    }, [page, loading, dispatch]);

    useEffect(() => {
        if(!page) {
            fetchTexts().finally(() => setLoading(false));
        }
    }, [page, dispatch]);

    const renderItem = useCallback(({ item, index }) => {
        return (
            <View style={{ marginTop: index === 0 ? rem(7) : null }}>
                <TextItem
                    item={item}
                    currentMemberId={currentMemberId}
                    spaceId={spaceId}
                    dispatch={dispatch}
                />
            </View>
        );
    }, [currentMemberId, spaceId]);


    const renderFooter = () => {
        if (!loading || !page?.hasNext) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={"#dfdfdf"} size={22}/>
            </View>
        );
    };


    if (loading && !page) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                    Just a sec, we're almost there! ⏳
                </Text>
            </View>
        );
    }

    if (textsError) {
        return (
            <Text style={styles.textsError}>
                Oops! 🤦‍♂️ Something went wrong. Text didn’t load, try again!
            </Text>
        );
    }

    return (
        <Fragment>
            {(!loading && spaceTexts?.length === 0) ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        🎉 Woohoo! You're the first one here! 🎉
                    </Text>
                </View>
            ) : (
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={spaceTexts}
                    keyExtractor={(item) => item.textId}
                    renderItem={renderItem}
                    onEndReached={fetchTexts}
                    onEndReachedThreshold={0.5}
                    nestedScrollEnabled={true}
                    windowSize={5}
                    style={styles.section}
                    ListFooterComponent={renderFooter}
                />
            )}

            <Pressable style={styles.shareButton} onPress={() => setModalOpen(true)}>
                {addTextLoading ? (
                    <ActivityIndicator color={"#000"} size={19} />
                ) : (
                    <Image style={styles.shareButtonImage}
                        source={require("../../../../../assets/images/pencil (2).png")}
                    />)
                }
            </Pressable>

            {(modalOpen && !addTextLoading) && (
                <ShareTextModal
                    onClose={() => setModalOpen(false)}
                    isVisible={modalOpen}
                    dispatch={dispatch}
                    currentMemberId={currentMemberId}
                    spaceId={spaceId}
                />
            )}
        </Fragment>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: "#000",
        flex: 1
    },
    shareButton: {
        position: "absolute",
        backgroundColor: "#fff",
        bottom: rem(17),
        right: rem(4),
        height: 50,
        width: 50,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center"
    },
    shareButtonImage: {
        width: 35,
        height: 35
    },
    footer: {
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 100,
    },
    textsError: {
        top: "30%",
        fontSize: 14,
        color: "rgba(255,0,0,0.91)",
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: 10,
        textAlign: "center",
        marginTop: 30
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    emptyText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Inter_700Bold",
        textAlign: "center",
        paddingHorizontal: 20
    },
    loadingText:  { color: "#fff", fontSize: 15, fontFamily:"Inter_500Medium" },
    loadingContainer: { alignSelf: "center", top: "40%" }
});

export default Text_;