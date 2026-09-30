import React, { useState, useEffect, useMemo } from 'react';
import GameHero, { GameBackdrop, DesignSelector } from './GameDesign.jsx';
import InventoryDialog from './InventoryDialog.jsx';
import CareerCard from './CareerCard.jsx';
import { Map, Briefcase, Mail, ExternalLink, Send, Linkedin, Github, Globe, Calendar, Gamepad2, Play, LoaderCircle, ArrowUpRight, Handshake } from 'lucide-react';

const SOCIAL_LINKS = {
    telegram: 'https://t.me/rigitbidy',
    linkedin: 'https://www.linkedin.com/in/vladimir-vasilev-868975243/',
    headhunter: 'https://hh.ru/resume/322fefcaff0e4e3b9f0039ed1f6c3842415534',
    github: 'https://github.com/voodya',
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Функция для форматирования даты (из "2023-01" в "Январь 2023")
const formatDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.toLowerCase() === 'present') return 'По настоящее время';

    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
};

// Функция для расчета длительности работы
const calculateDuration = (start, end) => {
    if (!start) return '';

    const startDate = new Date(start);
    const endDate = end && end.toLowerCase() !== 'present' ? new Date(end) : new Date();

    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();

    // Корректировка, если неполный месяц, но для грубого подсчета ок
    if (months <= 0) return 'Меньше месяца';

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let result = '';
    if (years > 0) result += `${years} ${getNoun(years, 'год', 'года', 'лет')} `;
    if (remainingMonths > 0) result += `${remainingMonths} ${getNoun(remainingMonths, 'месяц', 'месяца', 'месяцев')}`;

    return result.trim();
};

// Склонение существительных
const getNoun = (number, one, two, five) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return five;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
};

// --- КОМПОНЕНТЫ ---

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        aria-pressed={active}
        // ОБНОВЛЕНИЕ: Уменьшены отступы на мобильных (px-4 py-2) и увеличены на десктопе (md:px-6 md:py-3)
        className={`nav-tab flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full transition-all duration-300 font-medium text-sm md:text-base ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
    >
        {React.createElement(Icon, { size: 18 })}
        <span>{label}</span>
    </button>
);

const RoadmapView = ({ data, onViewProjects, onPortfolio, onContact }) => {
    // The route follows career progression; portfolio sorting stays unchanged.
    const timelineData = useMemo(() => data.filter(item => item.StartDate).sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate)), [data]);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // ДАННЫЕ О ПАРТНЕРАХ (Можно вынести в JSON, но пока здесь)
    const partners = [
        {
            name: "I know this place..?",
            role: "Помощь с паблишингом",
            logoUrl: "/Data/Content/1.jpg",
            url: "https://store.steampowered.com/app/2707160/YA_znayu_eto_mesto_glava_II/" // Замените на реальную ссылку
        },
        {
            name: "Announcement coming soon...",
            role: "Один из основателей. Разработчик.",
            logoUrl: "/Data/Content/Default.png",
            url: "https://www.voodyadev.online/Promo" // Замените на реальную ссылку
        }
        // Можно добавить больше партнеров сюда
    ];

    return (
        <div className="animate-fade-in space-y-16">
            <GameHero data={data} links={SOCIAL_LINKS} onPortfolio={onPortfolio} onContact={onContact} />

            {/* ROADMAP TIMELINE (Опыт работы) */}
            {timelineData.length > 0 && (
                <div className="space-y-8">
                    <div className="section-heading"><h2>Опыт работы</h2></div>
                    <ol className="career-route" aria-label="Карьерный путь по порядку">
                        {timelineData.map((job, index) => (
                            <CareerCard
                                key={`${job.Name}-${job.StartDate}`}
                                job={job}
                                level={timelineData.length - index}
                                latest={index === 0}
                                start={formatDate(job.StartDate)}
                                end={formatDate(job.EndDate || 'Present')}
                                duration={calculateDuration(job.StartDate, job.EndDate || 'Present')}
                                onDetails={setSelectedCompany}
                                onProjects={onViewProjects}
                            />
                        ))}
                    </ol>
                </div>
            )}

            {/* PARTNERS SECTION */}
            {partners.length > 0 && (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-white pl-4 border-l-4 border-purple-500 flex items-center gap-3">
                            <span>Партнерские проекты</span>
                            <Handshake size={24} className="text-slate-500" />
                        </h2>
                        <p className="text-slate-400 pl-4 max-w-2xl leading-relaxed">
                            Разработка и техническая поддержка на добровольных началах.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {partners.map((partner, idx) => (
                            <a
                                key={idx}
                                href={partner.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 bg-slate-800/30 hover:bg-slate-800/50 p-4 pr-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 group"
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-lg">
                                    <img
                                        src={partner.logoUrl}
                                        alt={partner.name}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
                                        {partner.name}
                                    </div>
                                    <div className="text-sm text-slate-500 group-hover:text-slate-400">
                                        {partner.role}
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-slate-600 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all ml-2" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <CompanyModal
                company={selectedCompany}
                onClose={() => setSelectedCompany(null)}
                onViewProjects={onViewProjects}
            />
        </div>
    );
};

const ProjectCard = ({ project, onClick }) => {
    const [failedImage, setFailedImage] = useState(null);
    const imgSrc = project.ImageUrl && failedImage !== project.ImageUrl ? project.ImageUrl : "/Data/Content/Default.png";

    const handleError = () => setFailedImage(project.ImageUrl);

    return (
        <button
            type="button"
            onClick={() => onClick(project)}
            className="project-card text-left bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border border-slate-700 flex flex-col h-full group"
        >
            <div className="project-art aspect-square w-full bg-slate-900 relative overflow-hidden">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={project.Name}
                        onError={handleError}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Briefcase size={48} />
                    </div>
                )}
                {/* Platform Badge Overlay */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {project.Platform.slice(1).map((tag, i) => (
                        <span key={i} className="project-platform-tag text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{project.Name}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{project.Description}</p>
                </div>
            </div>
        </button>
    );
};

const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <InventoryDialog title={project.Name} kind="project" onClose={onClose}>
                {/* Скроллящаяся область контента */}
                <div className="inventory-page space-y-8">
                    {/* Header Block */}
                    <div className="flex flex-col md:flex-row gap-8 items-start pt-4">
                        <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                            <img
                                src={project.ImageUrl || "/Data/Content/Default.png"}
                                alt={project.Name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-4 pr-8">
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    {project.Platform.map((tag, i) => (
                                        <span key={i} className={`text-sm px-3 py-1 rounded-md font-medium border ${i === 0 ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <p className="text-slate-300 text-lg leading-relaxed">
                                {project.Description}
                            </p>

                            {project.ProjectUrl && (
                                <a
                                    href={project.ProjectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/20"
                                >
                                    <span>Открыть проект</span>
                                    <ExternalLink size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Media Gallery */}
                    <div className="space-y-6 pt-8 border-t border-slate-800">
                        <h3 className="text-2xl font-bold text-white">Галерея</h3>

                        {/* Videos if any */}
                        {project.VideoUrls && project.VideoUrls.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {project.VideoUrls.map((vid, i) => (
                                    <video key={i} controls className="w-full rounded-xl border border-slate-700 bg-black shadow-lg">
                                        <source src={vid} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ))}
                            </div>
                        )}

                        {/* Screenshots */}
                        {project.ScreenUrls && project.ScreenUrls.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {project.ScreenUrls.map((screen, i) => (
                                    <div key={i} className="group relative aspect-[9/16] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300">
                                        <img
                                            src={screen}
                                            alt={`Screenshot ${i}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">Скриншотов нет</p>
                        )}
                    </div>
                </div>
        </InventoryDialog>
    );
};

const CompanyModal = ({ company, onClose, onViewProjects }) => {
    if (!company) return null;

    return (
        <InventoryDialog title={company.Name} kind="company" onClose={onClose}>
                <div className="inventory-page space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                            {company.LogoUrl ? (
                                <img
                                    src={company.LogoUrl}
                                    alt={company.Name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <Globe size={48} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-blue-400 font-medium font-medium">
                                        <Calendar size={16} />
                                        <span>{formatDate(company.StartDate)}</span>
                                        {company.StartDate && <span>—</span>}
                                        <span>{formatDate(company.EndDate || 'Present')}</span>
                                    </div>
                                    {company.JobType && (
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-bold uppercase tracking-wider">
                                            {company.JobType}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                                    {company.FullDescription || company.Description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                {company.CompanyUrl && (
                                    <a
                                        href={company.CompanyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-bold shadow-lg shadow-blue-600/20"
                                    >
                                        <ExternalLink size={20} />
                                        <span>Сайт компании</span>
                                    </a>
                                )}
                                {company.Projects && company.Projects.length > 0 && (
                                    <button
                                        onClick={() => {
                                            onViewProjects(company.Name);
                                            onClose();
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-xl transition-colors font-bold"
                                    >
                                        <Briefcase size={20} />
                                        <span>Просмотреть проекты</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
        </InventoryDialog>
    );
};

const PortfolioView = ({ data, filter, setFilter }) => {
    const [selectedProject, setSelectedProject] = useState(null);

    // Get unique companies from data for filter tabs
    const companies = useMemo(() => {
        return ['All', ...data.map(d => d.Name)];
    }, [data]);

    const allProjects = useMemo(() => {
        let projects = [];
        data.forEach(company => {
            if (company.Projects) {
                projects = [...projects, ...company.Projects];
            }
        });
        return projects;
    }, [data]);

    const filteredProjects = useMemo(() => {
        if (filter === 'All') return allProjects;
        return allProjects.filter(p => p.Platform && p.Platform[0] === filter);
    }, [filter, allProjects]);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="section-heading"><h1>Портфолио</h1></div>
            {/* Filter Bar */}
            <div className="project-filters flex flex-wrap gap-2 pb-4 border-b border-slate-800">
                {companies.map(company => (
                    <button
                        key={company}
                        onClick={() => setFilter(company)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === company
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {company === 'All' ? 'Все проекты' : company}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                    <ProjectCard
                        // ОБНОВЛЕНИЕ: Используем уникальный ключ вместо индекса, 
                        // чтобы React пересоздавал компонент при смене сортировки
                        key={`${project.Platform ? project.Platform[0] : ''}-${project.Name}`}
                        project={project}
                        onClick={setSelectedProject}
                    />
                ))}
            </div>

            {filteredProjects.length === 0 && <p className="empty-state">В этой категории пока нет проектов. Выберите другую компанию или «Все проекты».</p>}
            {/* Modal */}
            <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </div>
    );
};

const ContactsView = ({ open, onClose }) => {
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submission, setSubmission] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmission(null);

        // Структура данных согласно запросу
        const payload = {
            "Message": message,
            "Callback": contact
        };

        try {
            const response = await fetch("https://hook.eu2.make.com/35mplaycplk1rwfefgik2gcipy07xcac", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSubmission({ success: true, text: "Сообщение доставлено! Свяжусь с вами в ближайшее время." });
                setContact('');
                setMessage('');
            } else {
                setSubmission({ success: false, text: "Не удалось отправить. Попробуйте ещё раз или напишите в Telegram." });
            }
        } catch (error) {
            console.error("Ошибка отправки формы:", error);
            setSubmission({ success: false, text: "Ошибка сети. Проверьте подключение и попробуйте снова." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <InventoryDialog title="Связаться со мной" kind="contact" onClose={onClose}>
            <div className="contact-lobby">
                <aside className="contact-briefing">
                    <h3>Обсудим проект</h3>
                    <p>Расскажите о задаче и оставьте контакт для ответа.</p>
                    <div className="contact-player"><img src="/Data/Content/Ava.jpg" alt="Владимир Васильев" /><div><strong>Владимир Васильев</strong></div></div>
                    <div className="contact-socials">
                        <SocialButton href={SOCIAL_LINKS.telegram} icon={Send} label="Telegram" />
                        <SocialButton href={SOCIAL_LINKS.linkedin} icon={Linkedin} label="LinkedIn" />
                        <SocialButton href={SOCIAL_LINKS.headhunter} icon={Briefcase} label="HeadHunter" />
                        <SocialButton href={SOCIAL_LINKS.github} icon={Github} label="GitHub" />
                    </div>
                </aside>
                <div className="contact-form-panel">
                <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-slate-300 mb-2">
                            Ваш контакт (Email / Telegram) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="contact"
                            type="text"
                            required
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="@username или email@example.com"
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                            Сообщение
                        </label>
                        <textarea
                            id="message"
                            rows="4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Расскажите о проекте..."
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="contact-play" aria-label={isSubmitting ? 'Отправка сообщения' : 'Отправить сообщение'}>
                        <span className="contact-play-icon">{isSubmitting ? <LoaderCircle size={26} className="animate-spin" /> : <Play size={26} fill="currentColor" />}</span>
                        <span className="contact-play-copy"><strong>{isSubmitting ? 'SENDING...' : 'PLAY'}</strong><span>{isSubmitting ? 'Отправка сообщения…' : 'Отправить сообщение'}</span></span>
                    </button>
                    {submission && <p role={submission.success ? 'status' : 'alert'} className={`contact-feedback${submission.success ? ' is-success' : ''}`}>{submission.text}</p>}
                </form>
                </div>
            </div>
        </InventoryDialog>
    );
};

const SocialButton = ({ href, icon: Icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-social-button"
    >
        {React.createElement(Icon, { size: 24 })}
        <span>{label}</span>
    </a>
);

export default function App() {
    const [design, setDesign] = useState(() => {
        try { return localStorage.getItem('portfolio-design') === 'arcade' ? 'arcade' : 'neon'; }
        catch { return 'neon'; }
    });
    useEffect(() => {
        document.body.dataset.design = design;
        document.querySelector('link[rel="icon"]')?.setAttribute('href', `/favicon-${design}.svg`);
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', design === 'arcade' ? '#fffdf7' : '#151620');
        try { localStorage.setItem('portfolio-design', design); } catch { /* Storage can be disabled. */ }
    }, [design]);
    // Use the fragment for direct links so analytics query parameters stay untouched.
    const [activeTab, setActiveTab] = useState(() =>
        window.location.hash === '#portfolio' ? 'portfolio' : 'roadmap'
    );
    const [portfolioData, setPortfolioData] = useState([]);
    const [portfolioFilter, setPortfolioFilter] = useState('All');
    const [contactsOpen, setContactsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleTabChange = (tab) => {
        if (tab === 'contacts') { setContactsOpen(true); return; }
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const handleViewProjects = (companyName) => {
        setPortfolioFilter(companyName);
        setActiveTab('portfolio');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {

        document.title = "voodya.dev · Unity Developer";
        // Логика отправки данных о визите
        const reportVisit = async () => {
            // Получаем параметры из URL после знака вопроса
            const urlParams = window.location.search.substring(1);

            const payload = {
                "User": "User",
                "Ip": new Date().toLocaleString(), // Пользователь просил время в поле Ip
                "Id": urlParams // Добавляем строковое значение из URL
            };

            try {
                await fetch("https://hook.eu2.make.com/xqwrv5sswv3rsdk8kwjvs0nkk24xiqrx", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                // Ошибки аналитики не должны мешать работе сайта
                console.error("Analytics report failed:", err);
            }
        };

        const TIME_ON_SITE = 5000; 

        // Запускаем таймер и сохраняем его ID
        const visitTimer = setTimeout(() => {
            reportVisit();
        }, TIME_ON_SITE);

        // ОБНОВЛЕНИЕ: Добавлен параметр для сброса кеша браузера (Timestamp)
        const cacheBuster = new Date().getTime();

        fetch(`assets/Content.json?t=${cacheBuster}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить файл данных (Content.json)');
                }
                return response.json();
            })
            .then((data) => {
                // СОРТИРОВКА ДАННЫХ
                const sortedData = [...data].sort((a, b) => {
                    const dateA = a.StartDate ? new Date(a.StartDate) : null;
                    const dateB = b.StartDate ? new Date(b.StartDate) : null;

                    if (dateA && dateB) return dateB - dateA;
                    if (dateA && !dateB) return -1;
                    if (!dateA && dateB) return 1;
                    return 0;
                });

                setPortfolioData(sortedData);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Ошибка при загрузке портфолио:", err);
                setError(err.message);
                setIsLoading(false);
            });
            return () => clearTimeout(visitTimer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-slate-400">Загрузка данных...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl text-center max-w-md">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Ошибка</h3>
                    <p className="text-slate-300">{error}</p>
                    <p className="text-sm text-slate-500 mt-4">Убедитесь, что файл assets/Content.json существует.</p>
                </div>
            </div>
        );
    }

    // ОБНОВЛЕНИЕ: Добавлен overflow-x-hidden для предотвращения горизонтальной прокрутки
    return (
        <div className="game-app min-h-screen text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">

            <GameBackdrop design={design} />
            <DesignSelector design={design} onChange={setDesign} />
            <a href="#main-content" className="skip-link">Перейти к содержимому</a>
            {/* HEADER / NAV */}
            <header className="game-header sticky top-0 z-40 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="brand-icon"><Gamepad2 size={23} /></span>
                        <span className="brand-name">voodya<span>.dev</span></span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {/* ОБНОВЛЕНИЕ: flex-wrap позволяет кнопкам переноситься на новую строку, если не влезают */}
                        <nav className="flex flex-wrap justify-center gap-2">
                            <TabButton
                                active={activeTab === 'roadmap'}
                                onClick={() => handleTabChange('roadmap')}
                                icon={Map}
                                label="Опыт"
                            />
                            <TabButton
                                active={activeTab === 'portfolio'}
                                onClick={() => handleTabChange('portfolio')}
                                icon={Briefcase}
                                label="Портфолио"
                            />
                            <TabButton
                                active={contactsOpen}
                                onClick={() => handleTabChange('contacts')}
                                icon={Mail}
                                label="Контакты"
                            />
                        </nav>
                        <a
                            href="https://calendly.com/vvvjobrigit/1-hour-one-on-one"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meeting-link inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-blue-500 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 md:px-5"
                        >
                            <Calendar size={18} />
                            <span>Запланировать встречу</span><ArrowUpRight size={16} />
                        </a>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main id="main-content" className="game-main max-w-6xl mx-auto px-4 py-8 md:py-12 min-h-[80vh]">
                {activeTab === 'roadmap' && (
                    <RoadmapView
                        data={portfolioData}
                        onPortfolio={() => { setPortfolioFilter('All'); handleTabChange('portfolio'); }}
                        onContact={() => handleTabChange('contacts')}
                        onViewProjects={handleViewProjects}
                    />
                )}
                {activeTab === 'portfolio' && (
                    <PortfolioView
                        data={portfolioData}
                        filter={portfolioFilter}
                        setFilter={setPortfolioFilter}
                    />
                )}
            </main>

            <ContactsView open={contactsOpen} onClose={() => setContactsOpen(false)} />
            {/* FOOTER */}
            <footer className="game-footer border-t border-slate-800 py-8 text-slate-500 text-sm">
                <p>© {new Date().getFullYear()} Владимир Васильев</p>
            </footer>

            {/* GLOBAL STYLES FOR ANIMATIONS */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        /* Custom scrollbar for modal */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: var(--page);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--line);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--subtle);
        }
      `}</style>
        </div>
    );
}
