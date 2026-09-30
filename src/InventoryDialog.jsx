import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Briefcase, Gamepad2, Mail, X } from 'lucide-react';

export default function InventoryDialog({ title, kind, onClose, children }) {
    const titleId = useId();
    const panelRef = useRef(null);
    const closeTimer = useRef(null);
    const [closing, setClosing] = useState(false);
    const requestClose = useCallback(() => {
        if (closeTimer.current !== null) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            onClose();
            return;
        }
        setClosing(true);
        closeTimer.current = window.setTimeout(onClose, 180);
    }, [onClose]);

    useEffect(() => {
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const previousPadding = document.body.style.paddingRight;
        const root = document.getElementById('root');
        const wasInert = root?.inert;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';
        if (root) root.inert = true;
        panelRef.current?.querySelector('button')?.focus();

        const onKey = event => {
            if (event.key === 'Escape') { event.preventDefault(); requestClose(); }
            if (event.key !== 'Tab') return;
            const focusable = Array.from(panelRef.current?.querySelectorAll('button, a[href], input, textarea, video[controls]') || []).filter(el => el.getClientRects().length && !el.disabled);
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPadding;
            if (root) root.inert = wasInert;
            document.removeEventListener('keydown', onKey);
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, [requestClose]);

    return createPortal(
        <div className={`game-modal inventory-overlay${closing ? ' is-closing' : ''}`} onClick={requestClose}>
            <section ref={panelRef} className={`inventory-panel inventory-${kind}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={event => event.stopPropagation()}>
                <div className="inventory-spine" aria-hidden="true"><BookOpen size={17} /></div>
                <header className="inventory-header">
                    <div className="inventory-caption"><span className="inventory-emblem">{kind === 'contact' ? <Mail size={19} /> : kind === 'project' ? <Gamepad2 size={19} /> : <Briefcase size={18} />}</span><div><h2 id={titleId}>{title}</h2></div></div>
                    <button type="button" className="inventory-close" onClick={requestClose} aria-label="Закрыть"><X size={20} /></button>
                </header>
                <div className="inventory-content">{children}</div>
            </section>
        </div>, document.body
    );
}
