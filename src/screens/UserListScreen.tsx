import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UserListItem } from '../components';
import type { RootStackParamList } from '../navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loadMoreUsers,
  loadUsers,
  refreshUsers,
  selectFilteredUsers,
  selectHasMoreUsers,
  selectIsLoadingMoreUsers,
  selectIsRefreshingUsers,
  selectUsersError,
  selectUsersSearchQuery,
  selectUsersStatus,
  setSearchQuery,
} from '../store/slices/usersSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'UserList'>;

function UserListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectFilteredUsers);
  const status = useAppSelector(selectUsersStatus);
  const error = useAppSelector(selectUsersError);
  const searchQuery = useAppSelector(selectUsersSearchQuery);
  const hasMore = useAppSelector(selectHasMoreUsers);
  const isLoadingMore = useAppSelector(selectIsLoadingMoreUsers);
  const isRefreshing = useAppSelector(selectIsRefreshingUsers);

  useEffect(() => {
    dispatch(loadUsers());
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || status === 'loading') {
      return;
    }
    dispatch(loadMoreUsers());
  }, [dispatch, hasMore, isLoadingMore, status]);

  const handleRefresh = useCallback(() => {
    dispatch(refreshUsers());
  }, [dispatch]);

  const renderUser = ({ item }: { item: (typeof users)[number] }) => (
    <UserListItem
      user={item}
      onPress={userId => navigation.navigate('UserDetails', { userId })}
    />
  );

  if (status === 'loading' && users.length === 0) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.helperText}>Loading users...</Text>
      </View>
    );
  }

  if (status === 'failed' && users.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>
          {error || 'Unable to fetch users.'}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => dispatch(loadUsers())}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={searchQuery}
        onChangeText={text => dispatch(setSearchQuery(text))}
        placeholder="Search by name"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        style={styles.searchInput}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={renderUser}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.helperText}>No users match your search.</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : null
        }
        contentContainerStyle={
          users.length === 0 ? styles.listEmptyContent : undefined
        }
      />
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: '#f3f4f6',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    color: '#111827',
  },
  helperText: {
    fontSize: 15,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 12,
  },
  inlineError: {
    fontSize: 13,
    color: '#b91c1c',
    textAlign: 'center',
    paddingBottom: 8,
    paddingTop: 4,
  },
});

export default UserListScreen;
