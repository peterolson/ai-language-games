import { OPEN_API_KEY } from '$env/static/private';
import OpenAI from 'openai';

export const openai = new OpenAI({
	apiKey: OPEN_API_KEY
});
