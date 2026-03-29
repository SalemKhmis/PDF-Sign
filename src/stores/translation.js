import { writable, get } from 'svelte/store';

export const currentLang = writable(localStorage.getItem('lang') || 'fr');
export const translations = writable({});

currentLang.subscribe(lang => {
	localStorage.setItem('lang', lang);
});

export async function translateAll(keys, source = 'en', target = 'fr', setLoading = () => {}) {
	try {
		setLoading(true);

		const res = await fetch('http://tplussgest.ddns.net:32147/api/translate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ texts: keys, source, target })
		});

		const data = await res.json();

		// 🔄 Merge new translations into existing ones
		const existing = get(translations);
		translations.set({
			...existing,
			...(data.translations || {})
		});
	} catch (e) {
		console.error('Translation error:', e);
	} finally {
		setLoading(false);
	}
}
