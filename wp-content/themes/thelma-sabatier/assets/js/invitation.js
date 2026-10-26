/**
 * Bandeau « Parlons-en » : la carte d'invitation arrive comme une notification quand on arrive dessus.
 * Sans effet pour les visiteurs qui demandent moins d'animations : la carte reste visible.
 */
(() => {
	const cartes = document.querySelectorAll('.ts-invit');
	if (!cartes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
		return;
	}
	cartes.forEach((carte) => {
		carte.classList.add('ts-invit--anime');
		const observateur = new IntersectionObserver((entrees) => {
			if (entrees.some((e) => e.isIntersecting)) {
				carte.classList.add('ts-invit--visible');
				observateur.disconnect();
			}
		}, { threshold: 0.4 });
		observateur.observe(carte);
	});
})();
