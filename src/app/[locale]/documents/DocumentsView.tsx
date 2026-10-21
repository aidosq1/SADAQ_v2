"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Scale, Shield, PenTool, Calendar, FolderOpen, type LucideIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { IconTile } from "@/components/ui/icon-tile";
import { EmptyState, LoadingState } from "@/components/ui/states";

export interface Document {
  id: number;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  section: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  year: number | null;
  isPublished: boolean;
}

type SectionKey = "statute" | "rules" | "antidoping" | "calendar";

const sectionConfig: Record<SectionKey, { icon: LucideIcon; translationKey: string }> = {
  statute: { icon: Scale, translationKey: "sec_statute" },
  rules: { icon: PenTool, translationKey: "sec_rules" },
  antidoping: { icon: Shield, translationKey: "sec_antidoping" },
  calendar: { icon: Calendar, translationKey: "sec_calendar" },
};

const sectionOrder: SectionKey[] = ["statute", "rules", "antidoping", "calendar"];

interface DocumentsViewProps {
  initialDocuments?: Document[];
}

export default function DocumentsView({ initialDocuments }: DocumentsViewProps) {
  const t = useTranslations("DocumentsPage");
  const locale = useLocale();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments ?? []);
  const [loading, setLoading] = useState(!initialDocuments);

  useEffect(() => {
    // Данные пришли с сервера вместе с HTML
    if (initialDocuments) return;
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/documents?isPublished=true");
        const data = await res.json();
        if (data.success) {
          setDocuments(data.data);
        }
      } catch {
        console.error("Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [initialDocuments]);

  // Group documents by section
  const groupedDocuments = documents.reduce((acc, doc) => {
    const section = doc.section as SectionKey;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(doc);
    return acc;
  }, {} as Record<SectionKey, Document[]>);

  // Get localized title based on current locale
  function getLocalizedTitle(doc: Document): string {
    if (locale === "kk" && doc.titleKk) return doc.titleKk;
    if (locale === "en" && doc.titleEn) return doc.titleEn;
    return doc.title;
  }

  // Format file size
  function formatFileSize(bytes: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title={t("title")} />
        <LoadingState />
      </PageContainer>
    );
  }

  // Filter sections that have documents
  const sectionsWithDocs = sectionOrder.filter(
    (section) => groupedDocuments[section] && groupedDocuments[section].length > 0
  );

  return (
    <PageContainer>
      <PageHeader title={t("title")} />
      {sectionsWithDocs.length === 0 ? (
        <EmptyState icon={FolderOpen} title={t("no_documents")} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sectionsWithDocs.map((section) => {
            const config = sectionConfig[section];
            const docs = groupedDocuments[section];

            return (
              <Card key={section}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <IconTile icon={config.icon} size="sm" />
                    {t(config.translationKey)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="-mx-2 space-y-1">
                    {docs.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
                        >
                          <FileText className="size-4 shrink-0 text-primary" />
                          <span className="min-w-0 flex-1">
                            <span className="type-small block truncate font-medium text-foreground group-hover:text-primary">
                              {getLocalizedTitle(doc)}
                            </span>
                            <span className="type-caption">
                              {doc.year && <span>{doc.year}</span>}
                              {doc.year && (doc.fileType || doc.fileSize) && " · "}
                              {doc.fileType?.toUpperCase()}
                              {doc.fileType && doc.fileSize && " · "}
                              {formatFileSize(doc.fileSize)}
                            </span>
                          </span>
                          <Download className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
