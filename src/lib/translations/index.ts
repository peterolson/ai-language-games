import i18n from 'sveltekit-i18n';
import { dev } from '$app/environment';
import lang from './lang.json';

export const defaultLocale = 'en';

/** @type {import('sveltekit-i18n').Config} */
export const config = {
	translations: {
		en: { lang },
		es: { lang },
		ru: { lang },
		'zh-CN': { lang },
		'zh-TW': { lang },
		kk: { lang }
	},
	loaders: [
		{
			locale: 'en',
			key: 'general',
			loader: async () => (await import('./en/general.json')).default
		},
		{
			locale: 'es',
			key: 'general',
			loader: async () => (await import('./es/general.json')).default
		},
		{
			locale: 'ru',
			key: 'general',
			loader: async () => (await import('./ru/general.json')).default
		},
		{
			locale: 'zh-CN',
			key: 'general',
			loader: async () => (await import('./zh-CN/general.json')).default
		},
		{
			locale: 'zh-TW',
			key: 'general',
			loader: async () => (await import('./zh-TW/general.json')).default
		},
		{
			locale: 'kk',
			key: 'general',
			loader: async () => (await import('./kk/general.json')).default
		}
	]
};

export const {
	t,
	loading,
	locales,
	locale,
	translations,
	loadTranslations,
	addTranslations,
	setLocale,
	setRoute
} = new i18n(config);

loading.subscribe(($loading) => $loading && console.log('Loading translations...'));
