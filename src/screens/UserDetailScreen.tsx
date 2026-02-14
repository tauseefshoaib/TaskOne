import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DetailInfoCard } from '../components';
import type { RootStackParamList } from '../navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loadUserDetail,
  selectSelectedUser,
  selectSelectedUserError,
  selectSelectedUserStatus,
  selectUserById,
} from '../store/slices/usersSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDetails'>;

function UserDetailScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector(selectSelectedUser);
  const selectedUserStatus = useAppSelector(selectSelectedUserStatus);
  const selectedUserError = useAppSelector(selectSelectedUserError);

  const cachedUser = useAppSelector(state =>
    selectUserById(state, route.params.userId),
  );

  const user =
    selectedUser && selectedUser.id === route.params.userId
      ? selectedUser
      : cachedUser;

  useEffect(() => {
    dispatch(loadUserDetail(route.params.userId));
  }, [dispatch, route.params.userId]);

  const formattedAddress = useMemo(() => {
    if (!user) {
      return '';
    }

    return `${user.address.suite}, ${user.address.street}, ${user.address.city}, ${user.address.zipcode}`;
  }, [user]);

  if (!user && selectedUserStatus === 'loading') {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.helperText}>Loading user details...</Text>
      </View>
    );
  }

  if (!user && selectedUserStatus === 'failed') {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>
          {selectedUserError || 'Unable to load user details.'}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => dispatch(loadUserDetail(route.params.userId))}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>User not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.username}>@{user.username}</Text>

      <DetailInfoCard label="Email" value={user.email} />
      <DetailInfoCard label="Phone" value={user.phone} />
      <DetailInfoCard label="Address" value={formattedAddress} />
      <DetailInfoCard label="Website" value={user.website} />

      {selectedUserStatus === 'loading' ? (
        <Text style={styles.helperText}>Refreshing details...</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    gap: 10,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: '#f3f4f6',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  username: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#b91c1c',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserDetailScreen;
