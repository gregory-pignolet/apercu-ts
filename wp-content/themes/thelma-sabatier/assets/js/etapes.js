/**
 * Étapes racontées : elles apparaissent l'une après l'autre quand on arrive dessus,
 * et sur téléphone la ligne qui relie les numéros se remplit au fil du défilement.
 * Sans effet pour les visiteurs qui demandent moins d'animations : tout reste visible.
 */
(() => {
	const listes = document.querySelectorAll('.ts-etapes__liste');
	if (!listes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
		return;
	}
	const SEUIL = 0.6; // hauteur de l'écran (60 %) à laquelle une étape est « atteinte »

	listes.forEach((liste) => {
		liste.classList.add('ts-etapes--anime');
		const observateur = new IntersectionObserver((entrees) => {
			if (entrees.some((e) => e.isIntersecting)) {
				liste.classList.add('ts-etapes--visible');
				observateur.disconnect();
			}
		}, { threshold: 0.25 });
		observateur.observe(liste);
	});

	const mettreAJour = () => {
		const repere = window.innerHeight * SEUIL;
		listes.forEach((liste) => {
			const cadre = liste.getBoundingClientRect();
			const progression = Math.min(1, Math.max(0, (repere - cadre.top) / cadre.height));
			liste.style.setProperty('--progression', progression.toFixed(3));
			liste.querySelectorAll(':scope > .wp-block-column').forEach((colonne) => {
				colonne.classList.toggle('est-atteinte', colonne.getBoundingClientRect().top < repere);
			});
		});
	};
	window.addEventListener('scroll', mettreAJour, { passive: true });
	window.addEventListener('resize', mettreAJour);
	mettreAJour();
})();
