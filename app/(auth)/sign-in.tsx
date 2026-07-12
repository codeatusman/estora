import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator, Image, KeyboardAvoidingView,
    Platform, ScrollView, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
    const { signIn, errors, fetchStatus } = useSignIn();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyCode, setVerifyCode] = useState("");

    const isLoading = fetchStatus === "fetching";

    const goToApp = ({ session, decorateUrl }: any) => {
        if (session?.currentTask) return;
        router.replace(decorateUrl("/") as any);
    };

    const handleLogin = async () => {
        const { error } = await signIn.password({ emailAddress: email, password });
        if (error) return;

        if (signIn.status === "complete") {
            await signIn.finalize({ navigate: goToApp });
        } else if (signIn.status === "needs_second_factor") {
            await signIn.mfa.sendPhoneCode();
        } else if (signIn.status === "needs_client_trust") {
            const emailFactor = signIn.supportedSecondFactors.find(
                (f) => f.strategy === "email_code"
            );
            if (emailFactor) await signIn.mfa.sendEmailCode();
        } else {
            console.error("Sign-in incomplete:", signIn);
        }
    };

    const handleVerifyCode = async () => {
        await signIn.mfa.verifyEmailCode({ code: verifyCode });
        if (signIn.status === "complete") {
            await signIn.finalize({ navigate: goToApp });
        } else {
            console.error("Verification incomplete:", signIn);
        }
    };

    const needsVerification = signIn.status === "needs_client_trust";

    return (
        <SafeAreaView className="flex-1 bg-accent" edges={["bottom", "left", "right"]}>
            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
                    <Image
                        source={require("../../assets/images/onboarding.png")}
                        className="w-full h-[456px]"
                        resizeMode="cover"
                    />
                    <View className="flex-1 bg-accent rounded-t-[28px] -mt-6 px-7 pt-9 gap-3.5">
                        <Text className="text-primary text-xs font-semibold">
                            {needsVerification ? "Verify it's you" : "Welcome back"}
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                            {needsVerification ? "Check your inbox" : "Sign in"}
                        </Text>
                        <Text className="text-accent-300 text-sm mb-2">
                            {needsVerification ? "Enter the code we just sent you" : "Find your dream home today."}
                        </Text>

                        {needsVerification ? (
                            <>
                                <TextInput
                                    className={"input text-center tracking-[8px] text-xl"}
                                    placeholder="••••••"
                                    placeholderTextColor="#4B5563"
                                    keyboardType="number-pad"
                                    value={verifyCode}
                                    onChangeText={setVerifyCode}
                                />
                                {errors.fields.code && (
                                    <Text className="text-red-500 text-xs -mt-1.5">{errors.fields.code.message}</Text>
                                )}

                                <TouchableOpacity className="btn" onPress={handleVerifyCode} disabled={isLoading}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#1C1C2E" />
                                    ) : (
                                        <Text className="text-accent font-bold text-base">Verify</Text>
                                    )}
                                </TouchableOpacity>

                                <View className="flex-row justify-center gap-6">
                                    <TouchableOpacity onPress={() => signIn.mfa.sendEmailCode()}>
                                        <Text className="text-primary text-sm">Resend code</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => signIn.reset()}>
                                        <Text className="text-accent-300 text-sm">Start over</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <TextInput
                                    className="input"
                                    placeholder="Email address"
                                    placeholderTextColor="#4B5563"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {errors.fields.identifier && (
                                    <Text className="text-red-500 text-xs -mt-1.5">{errors.fields.identifier.message}</Text>
                                )}

                                <TextInput
                                    className="input"
                                    placeholder="Password"
                                    placeholderTextColor="#4B5563"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                {errors.fields.password && (
                                    <Text className="text-red-500 text-xs -mt-1.5">{errors.fields.password.message}</Text>
                                )}

                                <TouchableOpacity className="btn" onPress={handleLogin} disabled={isLoading}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#1C1C2E" />
                                    ) : (
                                        <Text className="text-accent font-bold text-base">Sign In</Text>
                                    )}
                                </TouchableOpacity>

                                <View className="flex-row justify-center">
                                    <Text className="text-accent-300">Don&apos;t have an account? </Text>
                                    <Link href="/sign-up">
                                        <Text className="text-primary font-bold">Sign Up</Text>
                                    </Link>
                                </View>
                            </>
                        )}

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}