import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { User } from '../types';

type Props = {
  user: User;
  onPress: (userId: number) => void;
};

function UserListItem({ user, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(user.id)}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.meta}>{user.email}</Text>
      <Text style={styles.meta}>{user.website}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    fontSize: 20,
    color: '#4b5563',
  },
});

export default UserListItem;
