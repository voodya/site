import { createElement } from 'react';
import { ArrowUpRight, ArrowRight, Gamepad2, Code2, Send, Github, Linkedin, Briefcase } from 'lucide-react';

const snippets = [
    ['PlayerController.cs', 'public sealed class PlayerController : MonoBehaviour\n{\n    [SerializeField] private float speed = 6f;\n\n    private void Update()\n    {\n        var input = ReadInput();\n        transform.position += input * speed * Time.deltaTime;\n    }\n}'],
    ['GameBootstrap.cs', 'public async UniTask StartGameAsync()\n{\n    await assets.LoadAsync();\n    var world = factory.CreateWorld();\n    await world.InitializeAsync();\n\n    // Every great game starts with an idea.\n    stateMachine.Enter<PlayState>();\n}'],
];

export function GameBackdrop({ design }) {
    return <div className="game-backdrop" aria-hidden="true">
        {design === 'neon' ? snippets.map(([name, code], index) => (
            <div className={`code-fragment fragment-${index}`} key={name}>
                <div className="code-filename"><Code2 size={12} /> {name}</div>
                <pre>{code}</pre>
            </div>
        )) : <><span className="arcade-symbol symbol-a">+</span><span className="arcade-symbol symbol-b">✦</span><span className="arcade-symbol symbol-c">↗︎</span></>}
    </div>;
}

export function DesignSelector({ design, onChange }) {
    return <div className="design-bar">
        <div className="design-bar-inner">
            <div className="design-options" role="group" aria-label="Варианты оформления">
                <button aria-pressed={design === 'neon'} onClick={() => onChange('neon')}><span className="design-dot neon-dot" />Neon</button>
                <button aria-pressed={design === 'arcade'} onClick={() => onChange('arcade')}><span className="design-dot arcade-dot" />Arcade</button>
            </div>
        </div>
    </div>;
}

export default function GameHero({ data, links, onPortfolio, onContact }) {
    const projects = data.flatMap(company => company.Projects || []);
    return <section className="game-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
            <h1 id="hero-title">Senior Unity<br /><span>Разработчик</span></h1>
            <p className="hero-description">Архитектура, оптимизация и инструменты для игр на PC, мобильных устройствах и VR/AR.</p>
            <div className="hero-actions">
                <button className="primary-action" onClick={onPortfolio}><Gamepad2 size={19} /> Смотреть проекты <ArrowUpRight size={18} /></button>
                <button className="secondary-action" onClick={onContact}>Обсудить проект <ArrowRight size={17} /></button>
            </div>
            <div className="hero-stack"><div>{['Unity', 'C#', 'VContainer', 'UniTask', 'VR/AR'].map(skill => <span key={skill}>{skill}</span>)}</div><details className="extra-skills"><summary>Другие технологии</summary><div>{['UniRx', 'Zenject', 'Architecture', 'PC', 'MVP', 'MVVM'].map(skill => <span key={skill}>{skill}</span>)}</div></details></div>
        </div>
        <div className="player-card">
            <div className="player-photo"><img src="/Data/Content/Ava.jpg" alt="Владимир Васильев" /></div>
            <div className="player-info"><h2>Владимир Васильев</h2>
                <div className="player-socials">{[[links.telegram, Send, 'Telegram'], [links.linkedin, Linkedin, 'LinkedIn'], [links.headhunter, Briefcase, 'HeadHunter'], [links.github, Github, 'GitHub']].map(([href, Icon, label]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>{createElement(Icon, { size: 18 })}</a>)}</div>
            </div>
        </div>
        <div className="hero-stats"><div><strong>6+<span>лет</span></strong><span>В разработке игр</span></div><div><strong>{projects.length.toString().padStart(2, '0')}<span>проектов</span></strong><span>В портфолио</span></div><div><strong>PC / Mobile</strong><span>А ещё WebGL и VR/AR</span></div></div>
    </section>;
}
