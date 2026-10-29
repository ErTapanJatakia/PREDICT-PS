/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Password Predictability Research Workbench
 * Phase 1 Application Root
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { NavTabs, TabKey } from './components/NavTabs';
import { OverviewView } from './components/OverviewView';
import { PasswordLabPlaceholder } from './components/PasswordLabPlaceholder';
import { ExperimentsPlaceholder } from './components/ExperimentsPlaceholder';
import { EvaluationPlaceholder } from './components/EvaluationPlaceholder';
import { MethodologyPrivacyView } from './components/MethodologyPrivacyView';
import { AuditManifestView } from './components/AuditManifestView';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header with Disclaimer and Status */}
      <Header />

      {/* Main Navigation Tabs */}
      <NavTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="focus:outline-none"
        >
          {activeTab === 'overview' && (
            <OverviewView onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'password-lab' && (
            <PasswordLabPlaceholder />
          )}

          {activeTab === 'experiments' && (
            <ExperimentsPlaceholder />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationPlaceholder />
          )}

          {activeTab === 'methodology' && (
            <MethodologyPrivacyView />
          )}

          {activeTab === 'audit' && (
            <AuditManifestView />
          )}
        </div>
      </main>

      {/* Academic Footer */}
      <Footer onNavigateTab={setActiveTab} />
    </div>
  );
}
