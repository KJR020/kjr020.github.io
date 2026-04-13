"use client";

import { AlertCircle, BookOpen, GitFork, Network, RefreshCw, Tag } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { QueryProvider } from "@/components/QueryProvider";
import { Button } from "@/components/ui/button";
import { useKnowledgeData } from "@/hooks/useKnowledgeData";
import { cn } from "@/lib/utils";
import type { KnowledgePageData } from "@/types/knowledge";
import { PageList } from "./PageList";
import { type SelectedNode, TagGraph } from "./TagGraph";
import { TagList } from "./TagList";

type TabId = "tag-graph" | "list";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "tag-graph", label: "タグ共起", icon: Network },
  { id: "list", label: "一覧", icon: BookOpen },
];

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card px-3 py-2",
        "text-sm text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value.toLocaleString()}</span>
    </div>
  );
}

function getPagesForTag(
  pages: KnowledgePageData[],
  selectedNode: SelectedNode | null,
): KnowledgePageData[] {
  if (!selectedNode) return [];
  return pages.filter((page) => page.hashtags.includes(selectedNode.id));
}

const PROJECT = "KJR020";

function KnowledgeGraphInner() {
  const [activeTab, setActiveTab] = useState<TabId>("tag-graph");
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);

  const { pages, tags, totalPages, isLoading, error } = useKnowledgeData(PROJECT);

  const handleNodeSelect = useCallback((node: SelectedNode | null) => {
    setSelectedNode(node);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    setSelectedNode(null);
  }, []);

  const filteredPages = useMemo(() => getPagesForTag(pages, selectedNode), [pages, selectedNode]);
  const selectedTag = selectedNode?.id ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error.message || "データの取得に失敗しました"}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-2">
        <StatCard icon={BookOpen} label="ページ" value={totalPages} />
        <StatCard icon={Tag} label="タグ" value={tags.length} />
        <StatCard icon={GitFork} label="接続" value={pages.reduce((sum, p) => sum + p.linked, 0)} />
      </div>

      {/* Tabs */}
      <nav aria-label="表示切り替え">
        <div className="flex gap-1 rounded-lg border bg-muted p-1" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* List view */}
      {activeTab === "list" && <TagList tags={tags} pages={pages} />}

      {/* Tag co-occurrence graph */}
      {activeTab === "tag-graph" && (
        <div className="relative" role="tabpanel" aria-label="タグ共起グラフビュー">
          <TagGraph
            tags={tags}
            pages={pages}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            isLoading={isLoading}
            className="w-full"
          />

          {/* Detail panel */}
          {selectedNode && (
            <div className="absolute top-3 right-3 w-72 md:w-80 z-10">
              <PageList pages={filteredPages} selectedTag={selectedTag} onClose={handleClose} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function KnowledgeGraph() {
  return (
    <QueryProvider>
      <KnowledgeGraphInner />
    </QueryProvider>
  );
}
