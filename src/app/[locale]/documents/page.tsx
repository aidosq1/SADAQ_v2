"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Scale, Shield, PenTool, Calendar, BarChart3 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Document {
  id: number;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  section: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  isPublished: boolean;
}

type SectionKey = "statute" | "rules" | "antidoping" | "calendar" | "ratings";

const sectionConfig: Record<SectionKey, { icon: React.ReactNode; translationKey: string }> = {
  statute: { icon: <Scale className="h-5 w-5" />, translationKey: "sec_statute" },
  rules: { icon: <PenTool className="h-5 w-5" />, translationKey: "sec_rules" },
  antidoping: { icon: <Shield className="h-5 w-5" />, translationKey: "sec_antidoping" },
  calendar: { icon: <Calendar className="h-5 w-5" />, translationKey: "sec_calendar" },
  ratings: { icon: <BarChart3 className="h-5 w-5" />, translationKey: "sec_ratings" },
};

const sectionOrder: SectionKey[] = ["statute", "rules", "antidoping", "calendar", "ratings"];

export default function DocumentsPage() {
  const t = useTranslations("DocumentsPage");
  const locale = useLocale();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/documents?isPublished=true");
        const data = await res.json();
        if (data.success) {
          setDocuments(data.data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

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
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Filter sections that have documents
  const sectionsWithDocs = sectionOrder.filter(
    (section) => groupedDocuments[section] && groupedDocuments[section].length > 0
  );

  if (sectionsWithDocs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
        <p className="text-muted-foreground">{t("no_documents")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionsWithDocs.map((section) => {
          const config = sectionConfig[section];
          const docs = groupedDocuments[section];

          return (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {config.icon}
                  {t(config.translationKey)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted border border-transparent hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div className="overflow-hidden">
                          <span className="truncate text-sm font-medium block">
                            {getLocalizedTitle(doc)}
                          </span>
                          {(doc.fileType || doc.fileSize) && (
                            <span className="text-xs text-muted-foreground">
                              {doc.fileType?.toUpperCase()}
                              {doc.fileType && doc.fileSize && " · "}
                              {formatFileSize(doc.fileSize)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        asChild
                      >
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
