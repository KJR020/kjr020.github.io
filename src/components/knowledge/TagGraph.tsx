"use client";

import type { Core, EventObject, StylesheetCSS } from "cytoscape";
import cytoscape from "cytoscape";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { KnowledgePageData, TagSummary } from "@/types/knowledge";

interface SelectedNode {
  /** タグ名 */
  id: string;
  label: string;
}

interface TagGraphProps {
  tags: TagSummary[];
  pages: KnowledgePageData[];
  selectedNode: SelectedNode | null;
  onNodeSelect: (node: SelectedNode | null) => void;
  isLoading: boolean;
  className?: string;
}

/** ページ数でノードサイズを決定 — 知識量の濃淡を表現 */
function computeTagNodeSize(count: number): number {
  if (count >= 50) return 70;
  if (count >= 20) return 55;
  if (count >= 10) return 42;
  if (count >= 5) return 32;
  return 22;
}

/** タグ名から決定論的に色を生成 — 同じタグは常に同じ色になり視覚的クラスタリングを助ける */
function tagColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 50%)`;
}

function buildTagGraphElements(tags: TagSummary[], pages: KnowledgePageData[]) {
  // ページ数2以上のタグのみ（ノイズ除外）
  const visibleTags = tags.filter((t) => t.count >= 2);
  const visibleTagNames = new Set(visibleTags.map((t) => t.name));

  const tagNodes = visibleTags.map((tag) => ({
    data: {
      id: `tag-${tag.name}`,
      label: tag.name,
      count: tag.count,
      size: computeTagNodeSize(tag.count),
      color: tagColor(tag.name),
    },
  }));

  // 同じページに共起するタグペアにエッジを張る
  const cooccurrence = new Map<string, number>();
  for (const page of pages) {
    const pageTags = page.hashtags.filter((t) => visibleTagNames.has(t));
    for (let i = 0; i < pageTags.length; i++) {
      for (let j = i + 1; j < pageTags.length; j++) {
        const key = [pageTags[i], pageTags[j]].sort().join("||");
        cooccurrence.set(key, (cooccurrence.get(key) ?? 0) + 1);
      }
    }
  }

  const edges = Array.from(cooccurrence.entries()).map(([key, weight]) => {
    const [tagA, tagB] = key.split("||");
    return {
      data: {
        id: `edge-${tagA}-${tagB}`,
        source: `tag-${tagA}`,
        target: `tag-${tagB}`,
        weight,
      },
    };
  });

  return [...tagNodes, ...edges];
}

function SkeletonGraph({ className }: { className?: string }) {
  return (
    <output
      className={cn(
        "flex items-center justify-center",
        "rounded-lg border bg-card",
        "min-h-[400px]",
        className,
      )}
      aria-label="グラフを読み込み中"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">グラフを構築中...</p>
      </div>
    </output>
  );
}

export function TagGraph({
  tags,
  pages,
  selectedNode,
  onNodeSelect,
  isLoading,
  className,
}: TagGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (isLoading || !containerRef.current) return;

    const elements = buildTagGraphElements(tags, pages);

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            width: "data(size)",
            height: "data(size)",
            "background-color": "data(color)",
            "font-size": "10px",
            "text-valign": "center",
            "text-halign": "center",
            color: "#fff",
            "text-outline-color": "data(color)",
            "text-outline-width": 2,
            "text-wrap": "ellipsis",
            "text-max-width": "80px",
          },
        },
        // ページ数の多いタグはラベルを大きく表示して視認性を上げる
        {
          selector: "node[count >= 10]",
          style: {
            "font-size": "12px",
            "font-weight": "bold",
          },
        },
        {
          selector: "edge",
          style: {
            width: "mapData(weight, 1, 10, 1, 6)",
            "line-color": "#94a3b8",
            "curve-style": "bezier",
            opacity: "mapData(weight, 1, 10, 0.3, 0.8)",
          },
        },
        {
          selector: "node:active",
          style: {
            "overlay-opacity": 0,
          },
        },
        {
          selector: "node.highlighted",
          style: {
            "border-width": 3,
            "border-color": "#3b82f6",
          },
        },
        {
          selector: "node.neighbor",
          style: {
            opacity: 1,
          },
        },
        {
          selector: "node.dimmed",
          style: {
            opacity: 0.2,
          },
        },
        {
          selector: "edge.highlighted",
          style: {
            width: 2,
            "line-color": "#3b82f6",
            opacity: 0.8,
          },
        },
        {
          selector: "edge.dimmed",
          style: {
            opacity: 0.08,
          },
        },
      ] as unknown as StylesheetCSS[],
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 800,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 100,
        gravity: 0.25,
        padding: 40,
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      maxZoom: 3,
      minZoom: 0.3,
    });

    cyRef.current = cy;

    cy.on("tap", "node", (evt: EventObject) => {
      const node = evt.target;
      const nodeId = node.data("id") as string;
      const nodeLabel = node.data("label") as string;

      onNodeSelect({
        id: nodeId.replace("tag-", ""),
        label: nodeLabel,
      });

      cy.elements().removeClass("highlighted neighbor dimmed");

      node.addClass("highlighted");
      const neighborhood = node.neighborhood();
      neighborhood.addClass("neighbor highlighted");

      cy.elements()
        .not(node)
        .not(neighborhood)
        .forEach((el) => {
          el.addClass("dimmed");
        });
    });

    cy.on("tap", (evt: EventObject) => {
      if (evt.target === cy) {
        onNodeSelect(null);
        cy.elements().removeClass("highlighted neighbor dimmed");
      }
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [tags, pages, isLoading, onNodeSelect]);

  // 外部からの selectedNode 変更をハイライトに反映
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || isLoading) return;

    cy.elements().removeClass("highlighted neighbor dimmed");

    if (!selectedNode) return;

    const node = cy.getElementById(`tag-${selectedNode.id}`);
    if (node.length === 0) return;

    node.addClass("highlighted");
    const neighborhood = node.neighborhood();
    neighborhood.addClass("neighbor highlighted");

    cy.elements()
      .not(node)
      .not(neighborhood)
      .forEach((el) => {
        el.addClass("dimmed");
      });
  }, [selectedNode, isLoading]);

  if (isLoading) {
    return <SkeletonGraph className={className} />;
  }

  return (
    // 支援技術では読み上げ不能なグラフ描画領域。同等情報は「一覧」タブで提供する
    <div
      ref={containerRef}
      className={cn("rounded-lg border bg-card min-h-[400px] md:min-h-[500px]", className)}
      aria-hidden="true"
    />
  );
}

export type { SelectedNode, TagGraphProps };
