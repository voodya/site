import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Map, Briefcase, Mail, X, ExternalLink, Send, Linkedin, Github, Globe, Calendar, Laptop, Handshake } from 'lucide-react';

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
        // ОБНОВЛЕНИЕ: Уменьшены отступы на мобильных (px-4 py-2) и увеличены на десктопе (md:px-6 md:py-3)
        className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full transition-all duration-300 font-medium text-sm md:text-base ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
    >
        <Icon size={18} />
        <span>{label}</span>
    </button>
);

const RoadmapView = ({ data, onViewProjects }) => {
    // Разделяем данные на "Таймлайн" (с датами) и "Прочее" (без дат)
    const timelineData = useMemo(() => data.filter(item => item.StartDate), [data]);
    const otherData = useMemo(() => data.filter(item => !item.StartDate), [data]);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // ДАННЫЕ О ПАРТНЕРАХ (Можно вынести в JSON, но пока здесь)
    const partners = [
        {
            name: "I know this place..?",
            role: "Помощь с паблишингом",
            logoUrl: "https://www.voodyadev.online/Data/Content/1.jpg", // Замените на реальное лого
            url: "https://store.steampowered.com/app/2707160/YA_znayu_eto_mesto_glava_II/" // Замените на реальную ссылку
        },
        {
            name: "Announcement coming soon...",
            role: "Один из основателей. Разработчик.",
            logoUrl: "https://www.voodyadev.online/Data/Content/2.jpg", // Замените на реальное лого
            url: "https://www.voodyadev.online/Promo" // Замените на реальную ссылку
        }
        // Можно добавить больше партнеров сюда
    ];

    return (
        <div className="animate-fade-in space-y-16">
            {/* HERO SECTION */}
            <div className="flex flex-col md:flex-row items-start gap-8 bg-slate-800/50 p-8 rounded-3xl border border-slate-700 relative overflow-hidden">
                {/* Декоративный фон (опционально) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <div className="w-48 flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-48 h-48 mb-4">
                        <img
                            src="https://www.voodyadev.online/Data/Content/Ava.jpg" // ЗАМЕНИ ЭТУ ССЫЛКУ НА СВОЕ ФОТО
                            alt="Profile"
                            className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-slate-700"
                        />
                    </div>

                    {/* СОЦСЕТИ ПОД ФОТО */}
                    <div className="flex justify-center gap-4 text-slate-400">
                        <a href="https://t.me/rigitbidy" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" title="Telegram">
                            <Send size={20} />
                        </a>
                        <a href="https://linkedin.com/in/владимир-васильев-868975243/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" title="LinkedIn">
                            <Linkedin size={20} />
                        </a>
                        <a href="https://hh.ru/resume/322fefcaff0e4e3b9f0039ed1f6c3842415534" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" title="HeadHunter">
                            <Briefcase size={20} />
                        </a>
                        <a href="https://github.com/voodya" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" title="GitHub">
                            <Github size={20} />
                        </a>
                    </div>
                </div>

                <div className="text-center md:text-left space-y-6 flex-1">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            Senior Unity Разработчик
                        </h1>
                        <p className="text-xl text-blue-400 font-semibold">
                            Опыт работы: 6 лет 6 месяцев
                        </p>
                        <p className="text-slate-300 max-w-2xl leading-relaxed mx-auto md:mx-0">
                            Специализируюсь на создании архитектуры игровых проектов, оптимизации и разработке инструментов.
                            Имею опыт работы с VR/AR, мобильными играми и PC проектами.
                            Люблю чистый код и сложные задачи.
                        </p>

                        {/* НАВЫКИ */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                            {["Unity", "C#", "VContainer", "UniRx", "UniTask", "Zenject", "VR/AR", "Architecture", "PC", "MVP", "MVVM"].map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium hover:bg-blue-600/20 transition-colors"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>


                </div>
            </div>

            {/* ROADMAP TIMELINE (Опыт работы) */}
            {timelineData.length > 0 && (
                <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-white pl-4 border-l-4 border-blue-600">
                        Опыт работы
                    </h2>
                    <div className="relative border-l-2 border-slate-700 ml-4 md:ml-6 space-y-12 pb-4">
                        {timelineData.map((job, index) => (
                            <div
                                key={index}
                                className="relative pl-8 md:pl-12 group"
                            >
                                {/* Dot */}
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 transition-colors duration-300 z-10"></div>

                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    {/* Company Logo */}
                                    {job.LogoUrl && (
                                        <div className="w-20 h-20 flex-shrink-0 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg mt-1 transition-colors">
                                            <img
                                                src={job.LogoUrl}
                                                alt={`${job.Name} Logo`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-3 flex-grow">
                                        {/* Header with Name and Date */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <h3 className="text-2xl font-bold text-white transition-colors">
                                                {job.Name}
                                            </h3>

                                            {/* Date Display */}
                                            <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full text-blue-300 border border-slate-700">
                                                    <Calendar size={14} />
                                                    <span className="capitalize">{formatDate(job.StartDate)}</span>
                                                    <span>—</span>
                                                    <span className="capitalize">{formatDate(job.EndDate || 'Present')}</span>
                                                    <span className="text-slate-500 px-1">•</span>
                                                    <span className="text-slate-400">{calculateDuration(job.StartDate, job.EndDate || 'Present')}</span>
                                                </div>
                                                {job.JobType && (
                                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {job.JobType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                            {job.Description}
                                        </p>

                                        <div className="flex flex-wrap gap-3 mt-4">
                                            <button
                                                onClick={() => setSelectedCompany(job)}
                                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-semibold rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all flex items-center gap-2 group/btn"
                                            >
                                                <span>Подробнее</span>
                                                <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>

                                            {job.Projects && job.Projects.length > 0 && (
                                                <button
                                                    onClick={() => onViewProjects(job.Name)}
                                                    className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-sm font-semibold rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-all flex items-center gap-2 group/btn"
                                                >
                                                    <span>Просмотреть проекты</span>
                                                    <Briefcase size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                            Проекты, в которых я принимал участие на добровольных началах в качестве программиста или технического специалиста геймдев-индустрии.
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
    const [imgSrc, setImgSrc] = useState(project.ImageUrl || "");

    // ОБНОВЛЕНИЕ: Следим за изменением пропса project.ImageUrl
    // Если проект меняется (при сортировке), сбрасываем состояние картинки
    useEffect(() => {
        setImgSrc(project.ImageUrl || "");
    }, [project.ImageUrl]);

    const handleError = () => {
        setImgSrc("https://via.placeholder.com/150/1e293b/FFFFFF?text=No+Icon");
    };

    return (
        <div
            onClick={() => onClick(project)}
            className="bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border border-slate-700 flex flex-col h-full group"
        >
            <div className="aspect-square w-full bg-slate-900 relative overflow-hidden">
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
                        <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-sm">
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
        </div>
    );
};

const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    // Используем Portal для рендеринга модального окна в body
    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl relative flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Кнопка закрытия */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-950/50 hover:bg-red-500/80 rounded-full text-white transition-colors border border-slate-700/50 backdrop-blur-sm"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Скроллящаяся область контента */}
                <div className="overflow-y-auto p-6 md:p-10 space-y-8 h-full custom-scrollbar">
                    {/* Header Block */}
                    <div className="flex flex-col md:flex-row gap-8 items-start pt-4">
                        <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                            <img
                                src={project.ImageUrl || "https://via.placeholder.com/150/1e293b/FFFFFF?text=Icon"}
                                alt={project.Name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-4 pr-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{project.Name}</h2>
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
            </div>
        </div>,
        document.body
    );
};

const CompanyModal = ({ company, onClose, onViewProjects }) => {
    if (!company) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 w-full max-w-6xl max-h-[80vh] rounded-2xl border border-slate-700 shadow-2xl relative flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-950/50 hover:bg-red-500/80 rounded-full text-white transition-colors border border-slate-700/50 backdrop-blur-sm"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar">
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
                                <h2 className="text-3xl font-bold text-white mb-2">{company.Name}</h2>
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
            </div>
        </div>,
        document.body
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
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 justify-center pb-4 border-b border-slate-800">
                {companies.map(company => (
                    <button
                        key={company}
                        onClick={() => setFilter(company)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === company
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {company}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProjects.map((project, idx) => (
                    <ProjectCard
                        // ОБНОВЛЕНИЕ: Используем уникальный ключ вместо индекса, 
                        // чтобы React пересоздавал компонент при смене сортировки
                        key={`${project.Platform ? project.Platform[0] : ''}-${project.Name}`}
                        project={project}
                        onClick={setSelectedProject}
                    />
                ))}
            </div>

            {/* Modal */}
            <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </div>
    );
};

const ContactsView = () => {
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

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
                alert("Сообщение успешно отправлено! Я свяжусь с вами в ближайшее время.");
                setContact('');
                setMessage('');
            } else {
                alert("Произошла ошибка при отправке. Пожалуйста, попробуйте позже или напишите мне в Telegram.");
            }
        } catch (error) {
            console.error("Ошибка отправки формы:", error);
            alert("Ошибка сети. Пожалуйста, проверьте подключение и попробуйте снова.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white">Связаться со мной</h2>
                <p className="text-slate-400">
                    Открыт к предложениям о работе и интересным проектам.
                </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Ваш контакт (Email / Telegram) <span className="text-red-500">*</span>
                        </label>
                        <input
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Сообщение
                        </label>
                        <textarea
                            rows="4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Расскажите о проекте..."
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${isSubmitting
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent"></div>
                                <span>Отправка...</span>
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                <span>Отправить</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="flex justify-center gap-6">
                <SocialButton href="https://t.me/rigitbidy" icon={Send} label="Telegram" />
                <SocialButton href="https://linkedin.com/in/владимир-васильев-868975243/" icon={Linkedin} label="LinkedIn" />
                <SocialButton href="https://hh.ru/resume/322fefcaff0e4e3b9f0039ed1f6c3842415534" icon={Briefcase} label="HeadHunter" />
                <SocialButton href="https://github.com/voodya" icon={Github} label="GitHub" />
            </div>
        </div>
    );
};

const SocialButton = ({ href, icon: Icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group"
    >
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-blue-500 group-hover:bg-slate-700 transition-all">
            <Icon size={24} />
        </div>
        <span className="text-xs font-medium">{label}</span>
    </a>
);

export default function App() {
    const [activeTab, setActiveTab] = useState('roadmap');
    const [portfolioData, setPortfolioData] = useState([]);
    const [portfolioFilter, setPortfolioFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleViewProjects = (companyName) => {
        setPortfolioFilter(companyName);
        setActiveTab('portfolio');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
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
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">

            {/* HEADER / NAV */}
            <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Globe className="text-blue-500" />
                        <span>Васильев Владимир</span>
                    </div>

                    {/* ОБНОВЛЕНИЕ: flex-wrap позволяет кнопкам переноситься на новую строку, если не влезают */}
                    <nav className="flex flex-wrap justify-center gap-2">
                        <TabButton
                            active={activeTab === 'roadmap'}
                            onClick={() => setActiveTab('roadmap')}
                            icon={Map}
                            label="Роадмап"
                        />
                        <TabButton
                            active={activeTab === 'portfolio'}
                            onClick={() => setActiveTab('portfolio')}
                            icon={Briefcase}
                            label="Портфолио"
                        />
                        <TabButton
                            active={activeTab === 'contacts'}
                            onClick={() => setActiveTab('contacts')}
                            icon={Mail}
                            label="Контакты"
                        />
                    </nav>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 min-h-[80vh]">
                {activeTab === 'roadmap' && (
                    <RoadmapView
                        data={portfolioData}
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
                {activeTab === 'contacts' && <ContactsView />}
            </main>

            {/* FOOTER */}
            <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
                <p>© {new Date().getFullYear()} Unity Developer Portfolio. All rights reserved.</p>
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
          background: #0f172a; 
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}</style>
        </div>
    );
}