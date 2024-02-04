import { openai } from '$lib/server/openai';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const imageURL: string = body.image;
	let pastGuesses: string[] = body.pastGuesses;
	if (!pastGuesses || !pastGuesses.length)
		pastGuesses = ['Is it an elephant?', 'Is it a helicopter?', 'Is it a warehouse?'];

	const response = await openai.chat.completions.create({
		model: 'gpt-4-vision-preview',
		messages: [
			{
				role: 'system',
				content:
					'You are a playing pictionary with the user. The user has a word and is trying to draw a picture of it. You should respond with a JSON array of guesses for what the word might be.'
			},
			{ role: 'user', content: 'What is this?' },
			{ role: 'assistant', content: JSON.stringify(pastGuesses) },
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: "That's not it. Try again."
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
