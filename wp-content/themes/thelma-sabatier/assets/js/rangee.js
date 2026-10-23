/**
 * Réalisations de l'accueil : une rangée d'images qui défile sans fin, courbée sur les bords
 * (inspirée du modèle « Tilted Grid Hero » de Ruixen sur 21st.dev, licence MIT).
 * Elle s'arrête au survol et quand on y navigue au clavier, et seulement quand elle est à l'écran.
 * Pour les visiteurs qui demandent moins d'animations : rangée immobile, à faire défiler à la main.
 */
(() => {
	const rangees = document.querySelectorAll('.ts-rangee');
	if (!rangees.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return;
	}
	const VITESSE = 0.5; // pixels par image affichée

	rangees.forEach((rangee) => {
		const piste = rangee.querySelector('.ts-rangee__piste');
		if (!piste || !piste.children.length) {
			return;
		}
		// Deuxième série, cachée aux lecteurs d'écran et au clavier, pour boucler sans fin.
		[...piste.children].forEach((carte) => {
			const copie = carte.cloneNode(true);
			copie.setAttribute('aria-hidden', 'true');
			copie.querySelectorAll('a').forEach((lien) => lien.setAttribute('tabindex', '-1'));
			piste.appendChild(copie);
		});
		rangee.classList.add('ts-rangee--anime');

		let x = 0;
		let vitesse = VITESSE;
		let cible = VITESSE;
		let serie = piste.scrollWidth / 2;
		let visible = true;
		window.addEventListener('resize', () => { serie = piste.scrollWidth / 2; });
		const arreter = () => { cible = 0; };
		const reprendre = () => { cible = VITESSE; };
		rangee.addEventListener('mouseenter', arreter);
		rangee.addEventListener('mouseleave', reprendre);
		rangee.addEventListener('focusin', arreter);
		rangee.addEventListener('focusout', reprendre);
		if ('IntersectionObserver' in window) {
			new IntersectionObserver((entrees) => { visible = entrees[0].isIntersecting; }).observe(rangee);
		}

		// Chaque image se tourne vers le visiteur d'autant plus qu'elle est loin du centre.
		const courber = () => {
			const centre = rangee.clientWidth / 2;
			const demi = Math.max(centre, 360); // courbe plus douce sur téléphone
			for (const carte of piste.children) {
				const u = Math.max(-1.3, Math.min(1.3, (carte.offsetLeft + carte.offsetWidth / 2 + x - centre) / demi));
				carte.style.transform = `perspective(900px) rotateY(${(-u * 36).toFixed(2)}deg) scale(${(1 + 0.16 * Math.abs(u)).toFixed(3)})`;
			}
		};
		const tour = () => {
			if (visible) {
				vitesse += (cible - vitesse) * 0.06;
				x -= vitesse;
				if (-x >= serie) {
					x += serie;
				}
				piste.style.transform = `translateX(${x.toFixed(2)}px)`;
				courber();
			}
			window.requestAnimationFrame(tour);
		};
		courber();
		window.requestAnimationFrame(tour);
	});
})();
