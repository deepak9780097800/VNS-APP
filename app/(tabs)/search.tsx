import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { NumberCard } from '@/components/NumberCard';
import { Screen, ThemedText } from '@/components/ui';
import { isComingSoon, parsePrice } from '@/lib/api/format';
import { getCategories, getNumbersByCategory, searchNumbers } from '@/lib/api/numbers';
import type { Category, SearchNumbersParams } from '@/lib/api/types';
import { useTheme } from '@/theme';

type SellerFilter = 'ALL' | 'PREMIUM' | 'BASIC';
type SortMode = 'none' | 'price_asc' | 'price_desc' | 'fresh';

const SELLERS: { key: SellerFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PREMIUM', label: 'Premium' },
  { key: 'BASIC', label: 'Basic' },
];

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'none', label: 'Relevance' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'fresh', label: 'Available first' },
];

const PAGINATE = 60;

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [seller, setSeller] = useState<SellerFilter>('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortMode>('none');

  const searchMode = query.trim().length > 0;

  const catsQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000,
  });

  // Default to the first category so browse mode has content on open.
  useEffect(() => {
    if (!searchMode && !activeCat && catsQuery.data?.length) {
      setActiveCat(catsQuery.data[0]);
    }
  }, [searchMode, activeCat, catsQuery.data]);

  const searchParams = useMemo<SearchNumbersParams>(
    () => ({
      number: query.trim() || undefined,
      seller: seller === 'ALL' ? 'BASIC,PREMIUM' : seller,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    }),
    [query, seller, minPrice, maxPrice],
  );

  const searchQuery = useQuery({
    queryKey: ['search', searchParams],
    queryFn: () => searchNumbers(searchParams),
    enabled: searchMode,
  });

  const categoryList = useInfiniteQuery({
    queryKey: ['category', activeCat?.id],
    queryFn: ({ pageParam }) =>
      getNumbersByCategory({
        category: activeCat!.name,
        id: activeCat!.id,
        page: pageParam,
        paginate: PAGINATE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const count = lastPage.count ?? 0;
      const loaded = pages.reduce((n, p) => n + (p.data?.length ?? 0), 0);
      return loaded < count ? pages.length + 1 : undefined;
    },
    enabled: !searchMode && !!activeCat,
  });

  const rawItems = useMemo(
    () =>
      searchMode
        ? searchQuery.data ?? []
        : categoryList.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [searchMode, searchQuery.data, categoryList.data],
  );

  const items = useMemo(() => {
    let list = rawItems;
    if (seller !== 'ALL') list = list.filter((n) => n.seller_type === seller);

    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min != null || max != null) {
      list = list.filter((n) => {
        const p = parsePrice(n.unit_price);
        if (min != null && p < min) return false;
        if (max != null && p > max) return false;
        return true;
      });
    }

    if (sort === 'price_asc') {
      list = [...list].sort((a, b) => parsePrice(a.unit_price) - parsePrice(b.unit_price));
    } else if (sort === 'price_desc') {
      list = [...list].sort((a, b) => parsePrice(b.unit_price) - parsePrice(a.unit_price));
    } else if (sort === 'fresh') {
      list = [...list].sort((a, b) => Number(isComingSoon(a)) - Number(isComingSoon(b)));
    }
    return list;
  }, [rawItems, seller, minPrice, maxPrice, sort]);

  const isLoading = searchMode ? searchQuery.isLoading : categoryList.isLoading;
  const isError = searchMode ? searchQuery.isError : categoryList.isError;

  const inputBg = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    color: theme.colors.textPrimary,
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search numbers e.g. 786, 99999…"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          style={[styles.input, inputBg]}
        />

        {/* Category chips (browse mode) */}
        {!searchMode ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {catsQuery.data?.map((cat) => {
              const active = activeCat?.id === cat.id;
              return (
                <Pressable
                  key={String(cat.id)}
                  onPress={() => setActiveCat(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      borderRadius: theme.radii.full,
                    },
                  ]}
                >
                  <ThemedText
                    variant="label"
                    tone={active ? 'inverse' : 'secondary'}
                    weight="medium"
                  >
                    {cat.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {/* Seller + sort */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {SELLERS.map((s) => {
            const active = seller === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSeller(s.key)}
                style={[
                  styles.miniChip,
                  {
                    backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                    borderColor: active ? theme.colors.accent : theme.colors.border,
                    borderRadius: theme.radii.full,
                  },
                ]}
              >
                <ThemedText variant="caption" tone={active ? 'primary' : 'secondary'} weight="semibold">
                  {s.label}
                </ThemedText>
              </Pressable>
            );
          })}
          <View style={styles.divider} />
          {SORTS.map((s) => {
            const active = sort === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSort(s.key)}
                style={[
                  styles.miniChip,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.radii.full,
                  },
                ]}
              >
                <ThemedText variant="caption" tone={active ? 'inverse' : 'secondary'} weight="semibold">
                  {s.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Price range */}
        <View style={styles.priceRow}>
          <TextInput
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder="Min ₹"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            style={[styles.priceInput, inputBg]}
          />
          <TextInput
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Max ₹"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            style={[styles.priceInput, inputBg]}
          />
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <ThemedText tone="danger">Something went wrong. Pull to retry.</ThemedText>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <ThemedText tone="secondary">कोई नंबर नहीं मिला (no numbers found).</ThemedText>
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => String(item.productid)}
          renderItem={({ item }) => (
            <NumberCard item={item} onPress={(n) => router.push(`/number/${n.productid}`)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!searchMode && categoryList.hasNextPage && !categoryList.isFetchingNextPage) {
              categoryList.fetchNextPage();
            }
          }}
          ListFooterComponent={
            categoryList.isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} color={theme.colors.primary} />
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  miniChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  divider: { width: 1, alignSelf: 'stretch', marginHorizontal: 4 },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  footer: { paddingVertical: 16 },
});
