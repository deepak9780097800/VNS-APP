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
import { parsePrice, sellerTier } from '@/lib/api/format';
import { getCategories, getCategoryPage, searchNumbersPage } from '@/lib/api/numbers';
import type { Category, SearchNumbersParams, VipNumber } from '@/lib/api/types';
import { useTheme } from '@/theme';

type SellerFilter = 'ALL' | 'PREMIUM' | 'BASIC';
type SortMode = 'none' | 'price_asc' | 'price_desc';

const SELLERS: { key: SellerFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PREMIUM', label: 'Premium' },
  { key: 'BASIC', label: 'Basic' },
];

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'none', label: 'Relevance' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
];

function dedupe(numbers: VipNumber[]): VipNumber[] {
  const seen = new Set<string>();
  const out: VipNumber[] = [];
  for (const n of numbers) {
    const key = String(n.productid ?? n.number);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

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

  // Search: cursor pagination across tiers (per-tier nextURLs).
  const searchList = useInfiniteQuery({
    queryKey: ['search', searchParams],
    queryFn: ({ pageParam }) => searchNumbersPage(searchParams, pageParam),
    initialPageParam: undefined as (string | null)[] | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.nextURLs.some(Boolean) ? lastPage.nextURLs : undefined,
    enabled: searchMode,
  });

  // Category browse: cursor pagination via nextURL.
  const categoryList = useInfiniteQuery({
    queryKey: ['category', activeCat?.id],
    queryFn: ({ pageParam }) =>
      getCategoryPage({ category: activeCat!.name, id: activeCat!.id, url: pageParam }),
    initialPageParam: undefined as string | null | undefined,
    getNextPageParam: (lastPage) => lastPage.nextURL ?? undefined,
    enabled: !searchMode && !!activeCat,
  });

  const rawItems = useMemo(() => {
    if (searchMode) {
      return dedupe((searchList.data?.pages ?? []).flatMap((p) => p.data));
    }
    return dedupe((categoryList.data?.pages ?? []).flatMap((p) => p.data ?? []));
  }, [searchMode, searchList.data, categoryList.data]);

  const items = useMemo(() => {
    let list = rawItems;
    if (seller !== 'ALL') {
      const tier = seller.toLowerCase();
      list = list.filter((n) => sellerTier(n) === tier);
    }

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
    }
    return list;
  }, [rawItems, seller, minPrice, maxPrice, sort]);

  const isLoading = searchMode ? searchList.isLoading : categoryList.isLoading;
  const isError = searchMode ? searchList.isError : categoryList.isError;
  const isFetchingNextPage = searchMode
    ? searchList.isFetchingNextPage
    : categoryList.isFetchingNextPage;

  function loadMore() {
    if (searchMode) {
      if (searchList.hasNextPage && !searchList.isFetchingNextPage) searchList.fetchNextPage();
    } else if (categoryList.hasNextPage && !categoryList.isFetchingNextPage) {
      categoryList.fetchNextPage();
    }
  }

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
          onEndReached={loadMore}
          ListFooterComponent={
            isFetchingNextPage ? (
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
