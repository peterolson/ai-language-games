import { json, type RequestHandler } from '@sveltejs/kit';
import words from './words.json';
import { sampleArray } from '$lib/util';

export const GET: RequestHandler = async ({ request }) => {
	const url = new URL(request.url);
	const lang = url.searchParams.get('lang') || 'en';
	return json(sampleArray(words[lang as 'en'], 256));
};
