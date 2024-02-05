import { openai } from '$lib/server/openai';
import { sampleArray } from '$lib/util';
import { readFile, writeFile } from 'fs/promises';

const prompts: Record<string, string[]> = {
	en: [
		'Give me some words that are easy to draw.',
		'Thanks! Give me 50 more words. Make sure that they are very easy to draw.'
	],
	ru: [
		'Дай мне несколько слов, которые легко нарисовать.',
		'Спасибо! Дай мне еще 50 слов, которых нету выше. Убедись, что они очень легко нарисовать, что они на русском языке, что не слишком редкие и что они не слишком похожи друг на друга.'
	],
	es: [
		'Dame algunas palabras fáciles de dibujar.',
		'¡Gracias! Dame 50 palabras más, que no estén arriba. Asegúrate de que sean muy fáciles de dibujar, que estén en español, que no sean demasiado raras y que no se parezcan demasiado entre sí.'
	],
	'zh-CN': [
		'给我一些容易画的词。',
		'谢谢！再给我50个词。确保它们非常容易画，是中文的，不太罕见，而且彼此不太相似。'
	],
	'zh-TW': [
		'給我一些容易畫的詞。',
		'謝謝！再給我50個詞。確保它們非常容易畫，是中文的，不太罕見，而且彼此不太相似。'
	],
	kz: [
		'Маған суретке оқшауы оңай сөздер бер.',
		'Рахмет! Қосымша 50 сөз бер. Олардың өте оңай суретке оқшауы керек, олар қазақ тілінде болуы керек, олар өте көп жоқ болмауы керек және олар бір-біріне өте қатарласуы керек.'
	]
};

export async function generateWords(lang: string, count: number): Promise<string[]> {
	const savedWords = JSON.parse(
		await readFile(`src/routes/api/draw/get_words/words.json`, 'utf-8')
	);
	const words = savedWords[lang] as string[];
	let newWords = new Set<string>(words);
	while (newWords.size < count) {
		console.log(lang, prompts[lang]);
		const response = await openai.chat.completions.create({
			model: 'gpt-4-turbo-preview',
			messages: [
				{
					role: 'system',
					content:
						'You are a system that generates words for playing pictionary. You should respond with a JSON array of words.'
				},
				{
					role: 'user',
					content: prompts[lang][0]
				},
				{
					role: 'assistant',
					content: JSON.stringify([...newWords])
				},
				{
					role: 'user',
					content: prompts[lang][1]
				}
			],
			response_format: {
				type: 'json_object'
			}
		});
		try {
			const obj = JSON.parse(response.choices[0].message.content ?? '{"words":[]}');
			let words: string[] = [];
			for (const prop in obj) {
				if (obj.hasOwnProperty(prop) && Array.isArray(obj[prop])) {
					words = obj[prop];
					break;
				}
			}
			console.log(words);
			for (const word of words) {
				newWords.add(word);
			}
			console.log(newWords.size, 'words generated so far.');
			savedWords[lang] = Array.from(newWords);
			await writeFile(
				`src/routes/api/draw/get_words/words.json`,
				JSON.stringify(savedWords, null, 2)
			);
		} catch (error) {
			console.error(error);
		}
	}
	console.log('done generating words');
	return words;
}
