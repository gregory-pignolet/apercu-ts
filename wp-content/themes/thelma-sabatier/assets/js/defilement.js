/**
 * Photos qui défilent au survol d'une carte (liste posée par inc/defilement.php dans data-ts-defile).
 * Rien sur les écrans tactiles (pas de survol) ni pour les visiteurs qui demandent moins d'animations.
 * Les photos suivantes ne se chargent qu'au premier survol.
 */
(() => {
	if (!window.matchMedia('(hover: hover)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return;
	}
	const PREMIER_CHANGEMENT = 600; // ms : la carte réagit vite au survol
	const INTERVALLE = 1300; // ms entre deux photos

	document.querySelectorAll('[data-ts-defile]').forEach((figure) => {
		let urls;
		try {
			urls = JSON.parse(figure.dataset.tsDefile);
		} catch (e) {
			return;
		}
		const base = figure.querySelector('img');
		if (!Array.isArray(urls) || urls.length < 2 || !base) {
			return;
		}
		const carte = figure.closest('.ts-real-card, .ts-projet-carte') || figure;
		const cadre = base.parentElement;
		let calques = null;
		let rang = 0;
		let minuteur = null;

		const montrer = (n) => calques.forEach((img, i) => img.classList.toggle('est-visible', i === n - 1));
		const suivante = () => {
			rang = (rang + 1) % urls.length;
			montrer(rang);
			minuteur = window.setTimeout(suivante, INTERVALLE);
		};
		const demarrer = () => {
			if (!calques) {
				cadre.classList.add('ts-defile');
				calques = urls.slice(1).map((url) => {
					const img = document.createElement('img');
					img.src = url;
					img.alt = '';
					img.decoding = 'async';
					img.className = 'ts-defile__img';
					img.setAttribute('aria-hidden', 'true');
					cadre.appendChild(img);
					return img;
				});
			}
			window.clearTimeout(minuteur);
			minuteur = window.setTimeout(suivante, PREMIER_CHANGEMENT);
		};
		const arreter = () => {
			window.clearTimeout(minuteur);
			rang = 0;
			if (calques) {
				montrer(0);
			}
		};

		carte.addEventListener('mouseenter', demarrer);
		carte.addEventListener('mouseleave', arreter);
		carte.addEventListener('focusin', demarrer);
		carte.addEventListener('focusout', (e) => {
			if (!carte.contains(e.relatedTarget)) {
				arreter();
			}
		});
	});
})();
