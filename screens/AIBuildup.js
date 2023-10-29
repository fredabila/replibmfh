import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Alert, Text, StyleSheet, Switch, TouchableOpacity, Modal, TextInput, Animated, Easing, TouchableWithoutFeedback, ScrollView, ImageBackground, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { v4 as uuidv4 } from 'uuid';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';



const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const PowerPoint = () => {
    const [speechToText, setSpeechToText] = useState('');
    const [trans, setrans] = useState('')
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voice, setvoice] = useState(false);
    const [lastMessageTime, setLastMessageTime] = useState(null);
    const [messageCount, setMessageCount] = useState(0);
    const [showTypingLoader, setShowTypingLoader] = useState(false);
    const [chatHistory, setChatHistory] = useState("");
    const [audiouri, setAudioURI] = useState(null);



    const SpeechServiceScreen = ({ showTypingLoader }) => {
        const [isRecording, setIsRecording] = useState(false);
        const [recordingDuration, setRecordingDuration] = useState(0);
        const scaleValue = useRef(new Animated.Value(1)).current;
        const [recordingInstance, setRecordingInstance] = useState(null);
        const textColor = 'green'
        const startRecording = async () => {
            try {
                await Audio.requestPermissionsAsync();
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                if (isRecording) {
                    setIsRecording(false);
                    recordingInstance.stopAndUnloadAsync().then(async (status) => {
                        await Audio.setAudioModeAsync(
                            {
                                allowsRecordingIOS: false,
                            }
                        );
                        const uri = recordingInstance.getURI();
                        console.log('Audio recorded: ', uri);
                        const info = await FileSystem.getInfoAsync(uri);
                        const audioFileUri = `${FileSystem.documentDirectory}rec.mp3`;
                        await FileSystem.copyAsync({
                            from: info.uri,
                            to: audioFileUri,
                        });
                        convertSpeechToText(audioFileUri);
                    }).catch(error => {
                        console.error('Error stopping recording: ', error);
                    });
                } else {
                    setIsRecording(true);
                    const recording = new Audio.Recording();
                    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
                    await recording.startAsync();
                    setRecordingInstance(recording);
                }
            } catch (error) {
                console.error('Error starting/stopping recording: ', error);
            }
        };

        useEffect(() => {
            const pulseAnimation = Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.2,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]);

            const animationLoop = Animated.loop(pulseAnimation);
            if (isRecording) {
                animationLoop.start();
            } else {
                animationLoop.stop();
                scaleValue.setValue(1);
            }

            return () => {
                animationLoop.stop();
            };
        }, [isRecording]);

        useEffect(() => {
            let timerInterval;
            if (isRecording) {
                timerInterval = setInterval(() => {
                    setRecordingDuration(prevDuration => prevDuration + 1);
                }, 1000);
            } else {
                clearInterval(timerInterval);
                setRecordingDuration(0);
            }

            return () => {
                clearInterval(timerInterval);
            };
        }, [isRecording]);

        return (
            <ImageBackground source={{ uri: "https://i.pinimg.com/originals/42/78/76/42787621ed6d40f0c30f0ae423fc572c.gif" }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                <SpeechBubble text={trans} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                    {showTypingLoader && !isRecording && (
                        <>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'white',
                                    padding: 20,
                                    borderBottomLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    borderTopLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    position: 'absolute',
                                    bottom: 0.09 * windowHeight,
                                }}
                            >
                                <Text style={{ fontSize: 18, color: 'blue' }}>Loading Response...</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {isRecording && (
                        <>
                            <TouchableOpacity
                                onPress={startRecording}
                                style={{
                                    backgroundColor: 'white',
                                    padding: 20,
                                    borderBottomLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    borderTopLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    position: 'absolute',
                                    bottom: 0.09 * windowHeight,
                                }}
                            >
                                <Text style={{ fontSize: 18, color: 'blue' }}>Tap to stop speaking</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {!isRecording && !showTypingLoader && (
                        <>
                            <TouchableOpacity
                                onPress={startRecording}
                                style={{
                                    backgroundColor: 'white',
                                    padding: 20,
                                    borderBottomLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    borderTopLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    position: 'absolute',
                                    bottom: 0.09 * windowHeight,
                                }}
                            >
                                <Text style={{ fontSize: 18, color: 'blue' }}>Tap to Speak</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {isRecording && (
                        <View style={styles.card}>
                            <Text style={[styles.durationText, { color: textColor }]}>
                                Recording Duration: {recordingDuration} seconds
                            </Text>
                        </View>
                    )}
                </View>
            </ImageBackground>
        );
    };

    const SpeechBubble = ({ text }) => {
        return (
            <View style={styles.containero}>
                <View style={styles.bubble}>
                    <Text style={styles.text}>{text}</Text>
                </View>
                <View style={styles.arrowBorder} />
                <View style={styles.arrow} />
            </View>
        );
    };



    const convertSpeechToText = async (audioFileUri) => {
        setShowTypingLoader(true);
        const formData = new FormData()
        formData.append('file', { uri: audioFileUri, name: 'audio.mp3', type: 'audio/mp3' });
        formData.append('prompt', 'A conversation between a faith AI');
        try {
            // Step 1: Upload the audio file
            const uploadResponse = await fetch('https://northcentralus.api.cognitive.microsoft.com/openai/deployments/buzzchatstt/audio/transcriptions?api-version=2023-09-01-preview', {
                method: 'POST',
                headers: {
                    Accept: "multipart/form-data",
                    'api-key': 'ad59b4cd1efe43f08835bb8ea898bf2e',
                },
                body: formData
            });

            const uploadData = await uploadResponse.json();
            console.log(uploadData);
            const transcript = uploadData.text
            setrans(transcript);
            console.log(transcript)
            setShowTypingLoader(false);
            generateTextBasedResponse(transcript);
            setSpeechToText(transcript);
        } catch (error) {
            console.error('Error converting speech to text:', error);
        }
    };





    const renderChatbotBubble = (props) => {
        const { currentMessage } = props;

        if (currentMessage.typing && showTypingLoader) {
            return (
                <View style={styles.typingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={[styles.typingText, { color: 'black' }]}>
                        Typing...
                    </Text>
                </View>
            );
        }

        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: { backgroundColor: 'green' },
                    right: { backgroundColor: 'white' },
                }}
                textStyle={{
                    left: { color: 'white' },
                    right: { color: 'black' },
                }}
            />
        );
    };

    const renderUserBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#E7E7E7',
                    },
                    right: {
                        backgroundColor: '#3777F0',
                    },
                }}
                textStyle={{
                    left: {
                        color: '#000000',
                    },
                    right: {
                        color: '#FFFFFF',
                    },
                }}
            />
        );
    };

    useEffect(() => {
        NetInfo.fetch().then((state) => {
            if (state.isConnected) {
            } else {
                alert('No internet connection. Try again later');
            }
            setLoading(false);
        });
    }, []);

    const generateImage = async (text) => {
        try {
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [
                    {
                        _id: uuidv4(),
                        text: text,
                        createdAt: new Date(),
                        user: {
                            _id: 1,
                            avatar:
                                'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg',
                        },
                    },
                ])
            );

            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [
                    {
                        _id: uuidv4(),
                        text: '',
                        user: {
                            _id: 2,
                            name: 'Kairos',
                            avatar: 'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg'
                        },
                        typing: true, // Display typing indicator before the response
                    },
                ])
            );

            // Set showTypingLoader to true to display the typing loader
            setShowTypingLoader(true);

            const response = await fetch(
                'https://buzzgpt.openai.azure.com/dalle/text-to-image?api-version=2022-08-03-preview',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': '763862b7a145425f98ac9eefd424c39d',
                    },
                    body: JSON.stringify({
                        caption: text,
                        resolution: '1024x1024',
                    }),
                }
            );

            const json = await response.json();
            console.log(json.id);
            const id = json.id; // Store the generated ID

            // Delay execution for approximately 10 seconds (10000 milliseconds)
            setTimeout(async () => {
                const getImage = await fetch(
                    `https://buzzgpt.openai.azure.com/dalle/text-to-image/operations/${id}?api-version=2022-08-03-preview`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': '763862b7a145425f98ac9eefd424c39d',
                        },
                    }
                );
                const image = await getImage.json();
                const imagecard = image.result.contentUrl;
                setMessages((previousMessages) =>
                    GiftedChat.append(previousMessages, [
                        {
                            _id: uuidv4(),
                            image: imagecard,
                            createdAt: new Date(),
                            user: {
                                _id: 2,
                                name: 'Kairos',
                                avatar: 'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg'
                            },
                        },
                    ])
                );
                setShowTypingLoader(false);
            }, 10000);
        } catch (error) {
            console.error('Error generating image:', error);
        }
    };

    const convertTextToSpeech = async (reply) => {
        const url = 'https://eastus2.tts.speech.microsoft.com/cognitiveservices/v1';
        const options = {
            method: 'POST',
            headers: {
                'Content-type': 'application/ssml+xml',
                'Ocp-Apim-Subscription-Key': '617dd13ee5fb4d35939ab6af28372bf4',
                'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            },
            body: `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="en-US-AndrewNeural">${reply}</voice></speak>`,
        };

        try {
            const response = await fetch(url, options);
            if (response.ok) {
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataURI = reader.result;
                    setAudioURI(dataURI);
                    const sound = new Audio.Sound();
                    sound.loadAsync({ uri: dataURI }).then(() => {
                        sound.playAsync();
                    });
                };
                reader.readAsDataURL(blob);
            } else {
                console.error('Text-to-speech request failed:', response.status);
            }
        } catch (error) {
            console.error('Error converting text to speech:', error);
        }
    };

    useEffect(() => {
        generateStartup("");
    }, []);

    const generateStartup = async (text) => {
        const context = chatHistory;
        try {
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [
                    {
                        _id: uuidv4(),
                        text: '',
                        user: {
                            _id: 2,
                            name: 'Kairos',
                            avatar: 'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg'
                        },
                        typing: true,
                    },
                ])
            );

            setShowTypingLoader(true);
            const response = await fetch(
                'https://buzzgpt.openai.azure.com/openai/deployments/text-davinci-003/completions?api-version=2022-12-01',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': '763862b7a145425f98ac9eefd424c39d',
                    },
                    body: JSON.stringify({
                        prompt: `This is your personality: {
                            "name": Kairos(Christian Faith Guide - A path to dsicvoering oneself as a true Christian),
                            "strict_requirements": {
                              "You help Christians discover their faith and also draw closer to Christ. ",
                                "You provide cleaer concepts into explaining christian faith and helping Christians understand the bible in a much better way ",
                                                  "You help improve the faith of Christians and help them build a better relationship with God by providing cleaer concept and explanations and referencing the bible.",
                            },
                          },
            }, \nChatHistory:${context} \nMe: ${text} \nKairos:`,
                        temperature: 0.7,
                        max_tokens: 200,
                        frequency_penalty: 0.3,
                        presence_penalty: 0.3,
                    }),
                }
            );
            const data = await response.json();
            console.log(data);
            const reply = data.choices[0].text;
            setChatHistory(
                prevHistory => prevHistory + `{ role: 'me', content: ${text} }`
            );
            setChatHistory(
                prevHistory => prevHistory + `{ role: 'kairos', content: ${reply} }`
            );

            // Update the message count and last message time
            setMessageCount((count) => count + 1);
            setLastMessageTime(new Date());

            setShowTypingLoader(false);
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [
                    {
                        _id: uuidv4(),
                        text: reply,
                        createdAt: new Date(),
                        user: {
                            _id: 2,
                            name: 'Kairos',
                            avatar: 'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg'
                        },
                    },
                ])
            );
        } catch (error) {
            console.error('Error generating text-based response:', error);
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [
                    {
                        _id: '2',
                        text: 'My data storage is full so please delete chats to start a fresh new conversation',
                        createdAt: new Date(),
                        user: {
                            _id: 2,
                            name: 'Kairos',
                            avatar: 'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg'
                        },
                    },
                ])
            );
        }
    };

    const generateTextBasedResponse = async (text) => {
        const time = new Date();
        const context = chatHistory;
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [
                {
                    _id: uuidv4(),
                    text: text,
                    createdAt: new Date(),
                    user: {
                        _id: 1,
                        avatar:
                            'https://cdn.dribbble.com/users/1077075/screenshots/10945047/media/70cd58ac294ac9e45e55913702df2472.png?compress=1&resize=400x300&vertical=top',
                    },
                },
            ])
        );

        try {
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [
                    {
                        _id: uuidv4(),
                        text: '',
                        user: {
                            _id: 2,
                            name: 'Kairos',
                            avatar: 'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg'
                        },
                        typing: true, // Display typing indicator before the response
                    },
                ])
            );

            // Set showTypingLoader to true to display the typing loader
            setShowTypingLoader(true);
            const response = await fetch(
                'https://buzzgpt.openai.azure.com/openai/deployments/text-davinci-003/completions?api-version=2022-12-01',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': '763862b7a145425f98ac9eefd424c39d',
                    },
                    body: JSON.stringify({
                        prompt: `This is your personality: {
              "name": Kairos(Christian Faith Guide - A path to discovering oneself as a true Christian),
              "strict_requirements": {
                "You help Christians discover their faith and also draw closer to Christ. You also serve as a general Christian assistant to help guide them through their period of Christianity to avoid their sinful nature",
                "You provide clear concepts into explaining christian faith and helping Christians understand the bible in a much better way ",
                "You help improve the faith of Christians and help them build a better relationship with God by providing cleaer concept and explanations and referencing the bible.",
              },
              "helpful_tactics":{
                "Try backing each response with a bible scripture to help the user understand the insipration served from your responses",
                "Never rebuke the word of God in any response. Train yourself with the nature Jesus portrayed during his time spent on earth. Serve yourself as a virtual prophet to preach the gospel",
                "Always try to serve your answers from the Chrisstian point of view but you can sometimes contradict your responses to test the Christian faith like Jesus did"
              },
              "qustionnaires":{
                "You can hold random questionnaires or surveys to test the users knowledge on issues relating to the bible and serve as a tacher to help them understand those areas better"
              }
            },
            \nTime: ${time} \nChatHistory:${context} \nMe: ${text} \nKairos:`,
                        temperature: 0.7,
                        max_tokens: 200,
                        frequency_penalty: 0.3,
                        presence_penalty: 0.3,
                    }),
                }
            );
            const data = await response.json();
            console.log(data);
            const reply = data.choices[0].text;
            if (voice) {
                await convertTextToSpeech(reply);
            }
            setChatHistory(
                prevHistory => prevHistory + `{ role: 'user', content: ${text} }`
            );
            setChatHistory(
                prevHistory => prevHistory + `{ role: 'kairos', content: ${reply} }`
            );

            setMessageCount((count) => count + 1);
            setLastMessageTime(new Date());

            setShowTypingLoader(false);
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [
                    {
                        _id: uuidv4(),
                        text: reply,
                        createdAt: new Date(),
                        user: {
                            _id: 2,
                            name: 'Kairos',
                            avatar: 'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg'
                        },
                    },
                ])
            );
        } catch (error) {
            console.error('Error generating text-based response:', error);
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [
                    {
                        _id: '2',
                        text: 'My data storage is full so please delete chats to start a fresh new conversation',
                        createdAt: new Date(),
                        user: {
                            _id: 2,
                            name: 'Kairos',
                            avatar: 'https://i.pinimg.com/originals/a5/99/23/a59923e67250280a827086a0c01846c4.jpg'
                        },
                    },
                ])
            );
        }
    };

    const onSend = async (newMessages = []) => {
        const text = newMessages[0].text;
        const imageTriggers = [
            'picture',
            'image',
            'photo',
        ];
        const shouldGenerateImage = imageTriggers.some((trigger) =>
            text.toLowerCase().includes(trigger)
        );

        if (shouldGenerateImage) {
            // Generate image
            await generateImage(text);
        } else {
            await generateTextBasedResponse(text);
        }

        // Update the message count and last message time
        setMessageCount((count) => count + 1);
        setLastMessageTime(new Date());
    };

    const handleVoiceToggle = () => {
        setvoice(prevToggle => !prevToggle);
    };

    return (
        <View style={[styles.container, { backgroundColor: 'white' }]}>
            <View style={styles.header}>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginRight: 10, color: "white" }}>
                    Voice Mode
                </Text>
                <Switch
                    value={voice}
                    onValueChange={handleVoiceToggle}
                    trackColor={{ false: "#E7E7E7", true: "#ffea00" }}
                    thumbColor="#FFFFFF"
                />
            </View>
            {
                loading ? (
                    <ActivityIndicator size="large" color="black" />
                ) : (
                    <View style={{ flex: 1 }} >
                        {!voice ? (
                            <GiftedChat
                                messages={messages}
                                user={{
                                    _id: 1,
                                }}
                                onSend={(newMessages) => onSend(newMessages)}
                                renderBubble={renderUserBubble}
                                renderSystemMessage={() => null}
                                renderChatbotBubble={renderChatbotBubble}
                            />
                        ) : (
                            <SpeechServiceScreen showTypingLoader={showTypingLoader} />
                        )}
                    </View >
                )}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        fontSize: 12,
        marginLeft: 5,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#3777F0"
    },
    recordingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    chatContainer: {
        flex: 1,
        marginBottom: 10,
    },
    recordButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 10,
        marginRight: 10,
    },
    recordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    speechToText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    openButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    openButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        fontSize: 16,
        borderRadius: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: 'red',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginRight: 8,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginLeft: 8,
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerContainer: {
        marginBottom: 10,
    },
    headerText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'black',
        borderRadius: 15,
        padding: 15,
        margin: 15,
        alignItems: 'center',
        position: 'absolute',
        top: 20
    },
    durationText: {
        fontSize: 15,
    },
    containero: {
        alignItems: 'flex-end',
        marginBottom: 10,
        marginRight: 10,
        marginTop: 15
    },
    bubble: {
        backgroundColor: '#3777F0',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 3,
        borderBottomColor: 'red',
        borderBottomWidth: 2,
        borderLeftColor: 'red',
        borderLeftWidth: 2,
        padding: 10,
        maxWidth: 200,
    },
    text: {
        color: 'white',
    },
    arrowBorder: {
        backgroundColor: 'transparent',
        borderWidth: 8,
        borderColor: 'transparent',
        borderTopColor: '#3777F0',
        alignSelf: 'center',
        marginTop: -16,
    },
    arrow: {
        backgroundColor: 'transparent',
        borderWidth: 8,
        borderColor: 'transparent',
        borderTopColor: 'white',
        alignSelf: 'center',
        marginTop: -16,
    },
});

export default PowerPoint;
