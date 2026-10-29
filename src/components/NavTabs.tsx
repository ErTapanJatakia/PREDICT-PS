/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Navigation Tabs Component
 */

import React from 'react';
import {
  Compass,
  KeyRound,
  GitCompare,
  BarChart3,
  ShieldCheck,
  FileCode2,
} from 'lucide-react';

export type TabKey =
  | 'overview'
  | 'password-lab'
  | 'experiments'
  | 'evaluation'
  | 'methodology'
  | 'audit';

interface NavTabsProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

interface TabItem {
  id: TabKey;
  label: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  {
    id: 'overview',
    label: 'Overview & Roadmap',
    icon: Compass,
  },
  {
    id: 'password-lab',
    label: 'Password Lab',
    badge: 'Phase 2 Plan',
    badgeColor: 'text-amber-300 bg-amber-950/70 border-amber-800/80',
    icon: KeyRound,
  },
  {
    id: 'experiments',
    label: 'Experiments',
    badge: 'Baselines',
    badgeColor: 'text-sky-300 bg-sky-950/70 border-sky-800/80',
    icon: GitCompare,
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    badge: 'Metrics',
    badgeColor: 'text-indigo-300 bg-indigo-950/70 border-indigo-800/80',
    icon: BarChart3,
  },
  {
    id: 'methodology',
    label: 'Methodology & Privacy',
    icon: ShieldCheck,
  },
  {
    id: 'audit',
    label: 'Audit & Manifest',
    icon: FileCode2,
  },
];

export const NavTabs: React.FC<NavTabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          role="tablist"
          aria-label="Research Workbench Navigation"
          className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-700"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      tab.badgeColor || 'text-slate-300 bg-slate-800 border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
