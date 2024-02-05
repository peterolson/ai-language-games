export async function getWords() {
	const response = await fetch('/api/draw/get_words');
	return response.json() as Promise<string[]>;
}

export async function guessImage(
	ctx: CanvasRenderingContext2D,
	pastGuesses: Set<string>,
	lang: string
): Promise<string[]> {
	const response = await fetch('/api/draw', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			image: ctx.canvas.toDataURL(),
			pastGuesses: Array.from(pastGuesses),
			lang
		})
	});
	const data = await response.json();
	const { guesses } = data;
	return guesses;
}
