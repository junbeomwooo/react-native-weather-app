import { ScrollView, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1">
      <View className="flex-1 bg-orange-500 justify-center items-center">
        <Text style={{ fontSize: 45 }} className="font-semibold">
          Copenhagen
        </Text>
      </View>
      <ScrollView className="flex-[3] bg-[#FE6346] items-center justify-center">
        <View className="flex-1 font-bold">
          <Text style={{ fontSize: 128 }}>27</Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontSize: 128 }}>27</Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontSize: 128 }}>27</Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontSize: 128 }}>27</Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontSize: 128 }}>27</Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontSize: 128 }}>27</Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium"
          >
            Windy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
