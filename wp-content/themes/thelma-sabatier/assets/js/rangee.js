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
		let survol = false;
		window.addEventListener('resize', () => { serie = piste.scrollWidth / 2; });
		const arreter = () => { cible = 0; };
		const reprendre = () => { if (!survol && !glisse) cible = VITESSE; };
		// Survol à la souris seulement (au doigt, un appui ne doit pas bloquer la rangée).
		rangee.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { survol = true; arreter(); } });
		rangee.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { survol = false; reprendre(); } });
		rangee.addEventListener('focusin', arreter);
		rangee.addEventListener('focusout', reprendre);
		if ('IntersectionObserver' in window) {
			new IntersectionObserver((entrees) => { visible = entrees[0].isIntersecting; }).observe(rangee);
		}

		// Glisser au doigt (ou à la souris) : la rangée suit, garde un peu d'élan, puis le défilement reprend seul.
		let glisse = null;
		let aGlisse = false;
		let reprise = 0;
		piste.addEventListener('dragstart', (e) => e.preventDefault());
		rangee.addEventListener('pointerdown', (e) => {
			if (e.button !== 0) {
				return;
			}
			glisse = { depart: e.clientX, x0: x, dernier: e.clientX, t: performance.now(), elan: 0 };
			aGlisse = false;
			cible = 0;
			vitesse = 0;
			window.clearTimeout(reprise);
		});
		window.addEventListener('pointermove', (e) => {
			if (!glisse) {
				return;
			}
			const ecart = e.clientX - glisse.depart;
			if (!aGlisse && Math.abs(ecart) > 6) {
				aGlisse = true;
				rangee.classList.add('ts-rangee--glisse');
			}
			if (aGlisse) {
				const maintenant = performance.now();
				glisse.elan = ((e.clientX - glisse.dernier) / Math.max(1, maintenant - glisse.t)) * 16; // pixels par image affichée
				glisse.dernier = e.clientX;
				glisse.t = maintenant;
				x = glisse.x0 + ecart;
			}
		});
		const lacher = () => {
			if (!glisse) {
				return;
			}
			if (aGlisse) {
				vitesse = -glisse.elan; // l'élan continue puis s'estompe
			}
			glisse = null;
			rangee.classList.remove('ts-rangee--glisse');
			reprise = window.setTimeout(reprendre, 1500);
		};
		window.addEventListener('pointerup', lacher);
		window.addEventListener('pointercancel', lacher);
		// Après un glissement, le relâchement ne doit pas ouvrir la fiche.
		rangee.addEventListener('click', (e) => {
			if (aGlisse) {
				e.preventDefault();
				e.stopPropagation();
				aGlisse = false;
			}
		}, true);

		// La rangée boucle sans fin dans les deux sens.
		const boucler = () => {
			if (-x >= serie) {
				x += serie;
				if (glisse) glisse.x0 += serie;
			} else if (x > 0) {
				x -= serie;
				if (glisse) glisse.x0 -= serie;
			}
		};

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
				if (!glisse) {
					x -= vitesse;
				}
				boucler();
				piste.style.transform = `translateX(${x.toFixed(2)}px)`;
				courber();
			}
			window.requestAnimationFrame(tour);
		};
		courber();
		window.requestAnimationFrame(tour);
	});
})();
