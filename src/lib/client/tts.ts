import { PUBLIC_MICROSOFT_TTS_REGION } from '$env/static/public';
import SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

let previousToken = '';
let expirationTime = 0;
async function getToken() {
	if (!previousToken || Date.now() > expirationTime) {
		const response = await fetch('/api/tts');
		const { token, timeToExpire } = await response.json();
		previousToken = token;
		expirationTime = Date.now() + timeToExpire;
		return token;
	}
	return previousToken;
}

let sdkLoaded = false;
let sdk: typeof SpeechSDK;
async function loadSDK(): Promise<typeof SpeechSDK> {
	if (sdkLoaded) return sdk;
	const path = '/js/microsoft.cognitiveservices.speech.sdk.bundle-min.js';
	const script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = path;
	await new Promise((resolve, reject) => {
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
	sdk = (window as any).SpeechSDK;
	return sdk;
}
let audio: HTMLAudioElement;
export async function speak(text: string, voice: string) {
	const sdk = await loadSDK();
	const token = await getToken();
	const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, PUBLIC_MICROSOFT_TTS_REGION);
	const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
	const locale = voice.slice(0, 5);
	console.log('speak start', text, voice);
	const ssml = `<speak version='1.0' 
		xmlns="http://www.w3.org/2001/10/synthesis" 
		xmlns:mstts="https://www.w3.org/2001/mstts" 
		xml:lang='${locale}'>
			<voice name='${voice}'>${text}</voice>
		</speak>`;
	await new Promise((resolve, reject) => {
		synthesizer.speakSsmlAsync(
			ssml,
			async (result) => {
				await new Promise((resolve) => setTimeout(resolve, result.audioDuration / 10000));
				resolve(result);
			},
			reject
		);
	});
	console.log('speak done', text);
	synthesizer.close();
}
