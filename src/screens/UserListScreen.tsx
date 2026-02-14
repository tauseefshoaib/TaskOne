import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'UserList'>;

function UserListScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>user list screen</Text>
      <Button
        title="go to user details screen"
        onPress={() => navigation.navigate('UserDetails', { userId: 1 })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});

export default UserListScreen;
