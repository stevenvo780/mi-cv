'use client';

/**
 * Shared search state for the site: the navbar holds the input, the home
 * gallery consumes the query to filter products. Client-only context so the
 * (sticky) navbar and the page content stay in sync without prop drilling.
 */
import React, { createContext, useContext, useState } from 'react';

interface SearchCtx {
  query: string;
  setQuery: (q: string) => void;
}

const Ctx = createContext<SearchCtx>({ query: '', setQuery: () => {} });

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  return <Ctx.Provider value={{ query, setQuery }}>{children}</Ctx.Provider>;
}

export function useSearch(): SearchCtx {
  return useContext(Ctx);
}
