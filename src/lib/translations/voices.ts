import { writable } from 'svelte/store';

export const voices: Record<string, { id: string; name: string }[]> = {
	en: [
		{
			id: 'en-US-JennyNeural',
			name: 'Jenny (US - woman)'
		},
		{
			id: 'en-US-BrianNeural',
			name: 'Brian (US - man)'
		},
		{
			id: 'en-US-AnaNeural',
			name: 'Ana (US - girl)'
		},
		{
			id: 'en-GB-SoniaNeural',
			name: 'Sonia (UK - woman)'
		},
		{
			id: 'en-GB-RyanNeural ',
			name: 'Ryan (UK - man)'
		},
		{
			id: 'en-IE-EmilyNeural',
			name: 'Emily (Ireland - woman)'
		},
		{
			id: 'en-IE-ConnorNeural',
			name: 'Connor (Ireland - man)'
		},
		{
			id: 'en-AU-NatashaNeural',
			name: 'Natasha (Australia - woman)'
		},
		{
			id: 'en-AU-WilliamNeural',
			name: 'William (Australia - man)'
		},
		{
			id: 'en-IN-NeerjaNeural',
			name: 'Nisha (India - woman)'
		},
		{
			id: 'en-IN-PrabhatNeural',
			name: 'Prabhat (India - man)'
		}
	],
	es: [
		{
			id: 'es-MX-DaliaNeural',
			name: 'Dalia (Mexico - mujer)'
		},
		{
			id: 'es-MX-JorgeNeural',
			name: 'Jorge (Mexico - hombre)'
		},
		{
			id: 'es-ES-ElviraNeural',
			name: 'Elvira (España - mujer)'
		},
		{
			id: 'es-ES-AlvaroNeural',
			name: 'Álvaro (España - hombre)'
		},
		{
			id: 'es-AR-ElenaNeural',
			name: 'Elena (Argentina - mujer)'
		},
		{
			id: 'es-AR-TomasNeural',
			name: 'Tomás (Argentina - hombre)'
		}
	],
	ru: [
		{
			id: 'ru-RU-SvetlanaNeural',
			name: 'Светлана (Россия - женщина)'
		},
		{
			id: 'ru-RU-DmitryNeural',
			name: 'Дмитрий (Россия - мужчина)'
		}
	],
	'zh-CN': [
		{
			id: 'zh-CN-XiaoxiaoNeural',
			name: '小小 (中国 - 女)'
		},
		{
			id: 'zh-CN-YunxiNeural',
			name: '云溪 (中国 - 男)'
		},
		{
			id: 'zh-CN-XiaoyouNeural',
			name: '小优 (中国 - 女孩)'
		}
	],
	'zh-TW': [
		{
			id: 'zh-TW-HsiaoChenNeural',
			name: '小臻 (台灣 - 女)'
		},
		{
			id: 'zh-TW-YunJheNeural',
			name: '雲哲 (台灣 - 男)'
		}
	],
	kk: [
		{
			id: 'kk-KZ-AigulNeural',
			name: 'Айгүл (Қазақстан - әйел)'
		},
		{
			id: 'kk-KZ-DauletNeural',
			name: 'Даулет (Қазақстан - ер)'
		}
	]
};

function voicesStore() {
	const defaultState: Record<string, string> = {};
	for (const lang in voices) {
		defaultState[lang] = voices[lang][0].id;
	}
	const { subscribe, update } = writable(defaultState);
	return {
		subscribe,
		set: (lang: string, id: string) =>
			update((state) => {
				state[lang] = id;
				return state;
			})
	};
}

export const selectedVoices = voicesStore();
