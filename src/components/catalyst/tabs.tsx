'use client';

import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
}

export function Tabs({
  defaultValue,
  className = '',
  ...props
}: {
  defaultValue: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [value, onValueChange] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={`flex border-b border-slate-200 ${className}`}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className = '',
  ...props
}: {
  value: string;
} & React.HTMLAttributes<HTMLButtonElement>) {
  const { value: selectedValue, onValueChange } = useTabsContext();

  return (
    <button
      role="tab"
      type="button"
      aria-selected={selectedValue === value}
      onClick={() => onValueChange(value)}
      className={`
        px-4 py-2 text-sm font-medium text-slate-600 border-b-2 border-transparent
        hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${selectedValue === value ? 'text-slate-900 border-blue-600' : ''}
        ${className}
      `}
      {...props}
    />
  );
}

export function TabsContent({
  value,
  className = '',
  ...props
}: {
  value: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { value: selectedValue } = useTabsContext();

  if (selectedValue !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={className} {...props} />
  );
}
