import { useEffect, useRef } from 'react';
import { ArrowUpRight, Briefcase, Calendar } from 'lucide-react';

export default function CareerCard({ job, level, latest, start, end, duration, onDetails, onProjects }) {
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motion.matches || !('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                card.dataset.reveal = 'visible';
                observer.disconnect();
            }
        }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
        card.dataset.reveal = 'pending';
        observer.observe(card);
        const onMotionChange = () => {
            if (motion.matches) {
                card.dataset.reveal = 'visible';
                observer.disconnect();
            }
        };
        motion.addEventListener('change', onMotionChange);
        return () => { observer.disconnect(); motion.removeEventListener('change', onMotionChange); };
    }, []);

    return <li ref={cardRef} className={`career-step${latest ? ' is-latest' : ''}`} onFocusCapture={() => { cardRef.current.dataset.reveal = 'visible'; }}>
        <span className="career-node" aria-hidden="true">{String(level).padStart(2, '0')}</span>
        <article className="career-card">
        <div className="career-card-page">
            <div className="career-company"><div className="career-logo">{job.LogoUrl ? <img src={job.LogoUrl} alt={`Логотип ${job.Name}`} loading="lazy" /> : <Briefcase size={25} />}</div><div><h3>{job.Name}</h3><span className="career-duration">{duration}{job.JobType && <> · {job.JobType}</>}</span></div></div>
            <div className="career-dates"><Calendar size={13} /><span>{start}</span><span>—</span><span>{end}</span></div>
            <p>{job.Description}</p>
            <div className="career-actions"><button type="button" onClick={() => onDetails(job)}>Подробнее <ArrowUpRight size={15} /></button>{job.Projects?.length > 0 && <button type="button" onClick={() => onProjects(job.Name)}><Briefcase size={14} />Проекты <span className="career-project-count">{job.Projects.length}</span></button>}</div>
        </div>
        </article>
    </li>;
}
