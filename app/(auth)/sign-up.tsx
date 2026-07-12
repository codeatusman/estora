import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  const isLoading = fetchStatus === "fetching";

  const handleRegister = async () => {
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });
    if (error) return console.error(error);
    await signUp.verifications.sendEmailCode();
  };

  const handleVerifyCode = async () => {
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: verifyCode,
      });
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize();
      }
    } catch (err) {
      console.error("Verification failed", err);
    }
  };

  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  useEffect(() => {
    if (signUp.status === "complete" || isSignedIn) {
      router.replace("/(root)/(tabs)");
    }
  }, [signUp.status, isSignedIn]);

  if (signUp.status === "complete" || isSignedIn) return null;

  return (
    <SafeAreaView
      className="flex-1 bg-accent"
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../../assets/images/onboarding.png")}
            className="w-full h-[399px]"
            resizeMode="cover"
          />
          <View className="flex-1 bg-accent rounded-t-[28px] -mt-6 px-7 pt-9 gap-3.5">
            <Text className="text-primary text-xs font-semibold">
              {needsVerification ? "Step 2 of 2" : "Step 1 of 2"}
            </Text>
            <Text className="text-white text-2xl font-bold">
              {needsVerification ? "Check your inbox" : "Create account"}
            </Text>
            <Text className="text-accent-300 text-sm mb-2">
              {needsVerification
                ? `We sent a code to ${email}`
                : "Your dream home is one step away."}
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
                  <Text className="text-red-500 text-xs -mt-1.5">
                    {errors.fields.code.message}
                  </Text>
                )}
                <TouchableOpacity
                  className="btn"
                  onPress={handleVerifyCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#1C1C2E" />
                  ) : (
                    <Text className="text-accent font-bold text-base">
                      Confirm & Continue
                    </Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row justify-center gap-6">
                  <TouchableOpacity
                    onPress={() => signUp.verifications.sendEmailCode()}
                  >
                    <Text className="text-primary text-sm">Resend code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => signUp.reset()}>
                    <Text className="text-accent-300 text-sm">Start over</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View className="flex-row gap-3">
                  <TextInput
                    className={"input flex-1"}
                    placeholder="First name"
                    placeholderTextColor="#4B5563"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                  <TextInput
                    className={"input flex-1"}
                    placeholder="Last name"
                    placeholderTextColor="#4B5563"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
                <TextInput
                  className="input"
                  placeholder="Email address"
                  placeholderTextColor="#4B5563"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.fields.emailAddress && (
                  <Text className="text-red-500 text-xs -mt-1.5">
                    {errors.fields.emailAddress.message}
                  </Text>
                )}
                <TextInput
                  className="bg-white border border-accent-200 text-accent rounded-[1.1rem] px-4 py-3.5 text-sm"
                  placeholder="Password"
                  placeholderTextColor="#4B5563"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {errors.fields.password && (
                  <Text className="text-red-500 text-xs -mt-1.5">
                    {errors.fields.password.message}
                  </Text>
                )}

                <TouchableOpacity
                  className="btn"
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#1C1C2E" />
                  ) : (
                    <Text className="text-accent font-bold text-base">
                      Create Account
                    </Text>
                  )}
                </TouchableOpacity>
                <View className="flex-row justify-center">
                  <Text className="text-accent-300">
                    Already have an account?{" "}
                  </Text>
                  <Link href="/sign-in">
                    <Text className="text-primary font-bold">Sign In</Text>
                  </Link>
                </View>
                <View nativeID="clerk-captcha" />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
