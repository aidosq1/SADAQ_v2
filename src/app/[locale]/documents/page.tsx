"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  year: number | null;
  isPublished: boolean;
}

type SectionKey = "statute" | "rules" | "antidoping" | "calendar" | "ratings";

const sectionConfig: Record<SectionKey, { icon: React.ReactNode; translationKey: string; groupByYear: boolean }> = {
  statute: { icon: <Scale className="h-5 w-5" />, translationKey: "sec_statute", groupByYear: false },
  rules: { icon: <PenTool className="h-5 w-5" />, translationKey: "sec_rules", groupByYear: false },
  antidoping: { icon: <Shield className="h-5 w-5" />, translationKey: "sec_antidoping", groupByYear: false },
  calendar: { icon: <Calendar className="h-5 w-5" />, translationKey: "sec_calendar", groupByYear: false },
  ratings: { icon: <BarChart3 className="h-5 w-5" />, translationKey: "sec_ratings", groupByYear: true },
};

const sectionOrder: SectionKey[] = ["statute", "rules", "antidoping", "calendar", "ratings"];

export default function DocumentsPage() {
  const t = useTranslations("DocumentsPage");
  const locale = useLocale();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");

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

  // Get available years from ratings section documents
  const ratingsYears = [...new Set(
    documents
      .filter(doc => doc.section === "ratings" && doc.year)
      .map(doc => doc.year as number)
  )].sort((a, b) => b - a);

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
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 lg:mb-8">{t("title")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 lg:mb-8">{t("title")}</h1>
        <p className="text-muted-foreground">{t("no_documents")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 lg:mb-8">{t("title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {sectionsWithDocs.map((section) => {
          const config = sectionConfig[section];
          let docs = groupedDocuments[section];

          // Filter by year for sections with groupByYear enabled
          if (config.groupByYear && selectedYear !== "all") {
            docs = docs.filter(doc => doc.year === parseInt(selectedYear));
          }

          return (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {config.icon}
                    {t(config.translationKey)}
                  </span>
                  {config.groupByYear && ratingsYears.length > 0 && (
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {locale === "kk" ? "Барлығы" : locale === "en" ? "All" : "Все"}
                        </SelectItem>
                        {ratingsYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {docs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("no_documents")}</p>
                  ) : docs.map((doc) => (
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
                          <span className="text-xs text-muted-foreground">
                            {doc.year && <span>{doc.year}</span>}
                            {doc.year && (doc.fileType || doc.fileSize) && " · "}
                            {doc.fileType?.toUpperCase()}
                            {doc.fileType && doc.fileSize && " · "}
                            {formatFileSize(doc.fileSize)}
                          </span>
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
