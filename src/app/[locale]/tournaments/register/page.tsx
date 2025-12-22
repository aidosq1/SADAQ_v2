import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CoachRegistrationForm } from "@/components/registration/CoachRegistrationForm";
import { getLocale } from "next-intl/server";

export default async function TournamentRegisterPage() {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();

  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }

  const pageTitle = locale === "kk"
    ? "Турнирге өтініш беру"
    : locale === "en"
    ? "Tournament Registration"
    : "Подача заявки на турнир";

  const tournamentName = locale === "kk"
    ? "Қазақстан Республикасының Чемпионаты 2025"
    : locale === "en"
    ? "Championship of Kazakhstan 2025"
    : "Чемпионат Республики Казахстан 2025";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{pageTitle}</h1>
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
          <span className="font-medium">{tournamentName}</span>
        </div>
      </div>
      <CoachRegistrationForm />
    </div>
  );
}
