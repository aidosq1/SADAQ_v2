"use client";

import { motion } from "framer-motion";
import { Sparkles, Calendar, Globe, Target, User, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

// Data
const HISTORY_EVENTS = [
    {
        year: "Бронзовый век",
        title: "Исторические корни",
        desc: "Стрельба из лука была неотъемлемой частью жизни кочевников Великой степи. Наши предки использовали лук как для охоты, так и для защиты земель, демонстрируя невероятное мастерство верховой стрельбы.",
        icon: Sparkles,
    },
    {
        year: "1992",
        title: "Признание мира",
        desc: "Федерация стрельбы из лука Республики Казахстан была официально признана Международной федерацией (World Archery). Это открыло двери для наших спортсменов на мировую арену.",
        icon: Globe,
    },
    {
        year: "1996",
        title: "Олимпийский дебют",
        desc: "Сборная Казахстана впервые приняла участие в летних Олимпийских играх в Атланте под собственным флагом. Это стало важной вехой для развития национального спорта.",
        icon: Target,
    },
    {
        year: "2004",
        title: "Становление",
        desc: "Был заложен фундамент современной структуры Федерации. Началось активное развитие инфраструктуры и подготовка нового поколения тренеров и судей.",
        icon: User,
    },
    {
        year: "2023-2024",
        title: "Новые высоты",
        desc: "Масштабная победа наших спортсменов на Кубке Мира и завоевание исторических лицензий на Олимпийские игры в Париже. Казахстан становится одним из лидеров азиатского региона.",
        icon: Crown, // Or Medal
    },
];

export default function HistoryPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden selection:bg-amber-500/30">
            {/* --- Hero Section --- */}
            <section className="relative py-20 md:py-32 flex flex-col items-center justify-center text-center px-4">
                {/* Decorative Blur */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-800/20 blur-[100px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        <span>Наследие Великой Степи</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Наша История
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
                        Путь от древних традиций кочевников до олимпийских пьедесталов современности.
                        История побед, развития и стремления к совершенству.
                    </p>
                </motion.div>
            </section>

            {/* --- Timeline Section --- */}
            <section className="relative pb-24 px-4 max-w-5xl mx-auto">
                {/* Vertical Line */}
                <div className="absolute left-4 md:left-1/2 top-10 bottom-10 w-0.5 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent md:-translate-x-1/2" />

                <div className="space-y-12 md:space-y-24">
                    {HISTORY_EVENTS.map((item, index) => (
                        <TimelineItem key={index} item={item} index={index} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function TimelineItem({ item, index }: { item: any, index: number }) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={cn(
                "relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0",
                isEven ? "md:flex-row-reverse" : ""
            )}
        >
            {/* 1. Content Card */}
            <div className="flex-1 w-full pl-12 md:pl-0">
                <div className={cn(
                    "relative group p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]",
                    isEven ? "md:mr-12" : "md:ml-12"
                )}>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                    <div className="relative z-10 space-y-3">
                        <span className="inline-block text-amber-400 font-bold text-xl md:text-2xl font-heading">
                            {item.year}
                        </span>
                        <h3 className="text-2xl font-bold text-white group-hover:text-amber-200 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            {item.desc}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Center Icon */}
            <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 transform md:-translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center">
                <div className="relative w-10 h-10 rounded-full border border-slate-700 bg-slate-900 z-10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_0_4px_rgba(15,23,42,1)]">
                    <item.icon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* 3. Empty Space for Layout Balance */}
            <div className="flex-1 w-full hidden md:block" />
        </motion.div>
    );
}
