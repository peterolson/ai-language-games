import { json, type RequestHandler } from '@sveltejs/kit';
import {
	MICROSOFT_TTS_ISSUE_TOKEN_ENDPOINT,
	MICROSOFT_TTS_ISSUE_TOKEN_HOST,
	MICROSOFT_TTS_SUBSCRIPTION_KEY
} from '$env/static/private';

const EXPIRE_MS = 1000 * 60 * 9;
let lastTokenTimestamp: number = 0;
let lastToken: string = '';

export const GET: RequestHandler = async ({ params }) => {
	if (lastTokenTimestamp && Date.now() - lastTokenTimestamp < EXPIRE_MS) {
		return json({ token: lastToken, timeToExpire: EXPIRE_MS - (Date.now() - lastTokenTimestamp) });
	}
	const token = await fetch(MICROSOFT_TTS_ISSUE_TOKEN_ENDPOINT, {
		method: 'POST',
		headers: {
			'Ocp-Apim-Subscription-Key': MICROSOFT_TTS_SUBSCRIPTION_KEY,
			Host: MICROSOFT_TTS_ISSUE_TOKEN_HOST,
			'Content-type': 'application/x-www-form-urlencoded',
			'Content-Length': '0'
		}
	}).then((res) => res.text());
	lastToken = token;
	lastTokenTimestamp = Date.now();
	return json({ token, timeToExpire: EXPIRE_MS });
};
