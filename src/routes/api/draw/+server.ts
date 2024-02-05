import { openai } from '$lib/server/openai';
import { sampleArray } from '$lib/util';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const imageURL: string = body.image;
	let pastGuesses: string[] = body.pastGuesses;
	const lang: string = body.lang;
	const prompts = await import(`../../../lib/translations/${lang}/prompts.json`).then(
		(m) => m.default
	);
	console.log(prompts);
	if (!pastGuesses || !pastGuesses.length) pastGuesses = prompts['draw.initial_guesses'];
	pastGuesses = sampleArray(pastGuesses, 15);

	const response = await openai.chat.completions.create({
		model: 'gpt-4-vision-preview',
		messages: [
			{
				role: 'system',
				content:
					'You are a playing pictionary with the user. The user has a word and is trying to draw a picture of it. You should respond with a JSON array of guesses for what the word might be.'
			},
			{ role: 'user', content: prompts['draw.what_is_this'] },
			{ role: 'assistant', content: JSON.stringify(pastGuesses) },
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: prompts['draw.wrong']
					},
					{
						type: 'image_url',
						image_url: {
							url: imageURL
						}
					}
				]
			}
		],
		max_tokens: 200
	});
	try {
		const guesses = JSON.parse(response.choices[0].message.content ?? '[]');
		console.log(guesses);
		return json({ guesses });
	} catch (error) {
		return json({ guesses: [] });
	}
};
