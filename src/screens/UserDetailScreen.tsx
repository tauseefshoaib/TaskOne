import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDetails'>;

function UserDetailScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text>user details screen</Text>
      <Text>User ID: {route.params.userId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default UserDetailScreen;
