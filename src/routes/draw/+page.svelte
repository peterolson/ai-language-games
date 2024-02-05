<script lang="ts">
	import { speak } from '$lib/client/tts';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import { getWords, guessImage } from './api';
	import { locale, t } from '$lib/translations';
	import { selectedVoices } from '$lib/translations/voices';

	let ctx: CanvasRenderingContext2D | null = null;
	let color = '#000000';
	let strokeWidth = 5;
	let hasChanges = false;

	let wordsToGuess: string[] = [];
	let wordsToGuessCurrentIndex = 0;

	onMount(async () => {
		const canvasContainer = document.querySelector('.canvas-container');
		if (!canvasContainer) return;
		const canvas = canvasContainer.querySelector('canvas');
		if (!canvas) return;
		const dimensions = canvasContainer.getBoundingClientRect();
		const length = Math.min(dimensions.width, dimensions.height);
		canvas.width = length - 8;
		canvas.height = length - 8;
		ctx = canvas.getContext('2d');
		clear();
		wordsToGuess = await getWords();
	});

	function clear() {
		if (!ctx) return;
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	type CoordEvent = {
		x: number;
		y: number;
	};

	let currentLocation: { x: number; y: number } | null = null;
	let actionStack: {
		fn: (event: CoordEvent) => void;
		currentLocation: { x: number; y: number };
		color: string;
		strokeWidth: number;
	}[] = [];

	function startStroke({ x, y }: CoordEvent) {
		if (!ctx) return;
		currentLocation = { x, y };
		ctx.beginPath();
		actionStack.push({ fn: startStroke, currentLocation, color, strokeWidth });
	}
	function endStroke(event: CoordEvent) {
		if (!ctx || !currentLocation) return;
		draw(event);
		actionStack.push({ fn: endStroke, currentLocation, color, strokeWidth });
		currentLocation = null;
	}
	function draw({ x, y }: CoordEvent) {
		if (!ctx || !currentLocation) return;
		ctx.moveTo(currentLocation.x, currentLocation.y);
		ctx.lineTo(x, y);
		ctx.lineCap = 'round';
		ctx.strokeStyle = color;
		ctx.lineWidth = strokeWidth;
		ctx.stroke();
		currentLocation = { x, y };
		actionStack.push({ fn: draw, currentLocation, color, strokeWidth });
		hasChanges = true;
	}
	function reset() {
		if (!ctx) return;
		clear();
		actionStack.push({ fn: reset, currentLocation: { x: 0, y: 0 }, color, strokeWidth });
	}

	function undo() {
		if (!ctx || !actionStack.length) return;
		clear();
		actionStack.pop();
		while (actionStack.length > 0) {
			const tail = actionStack[actionStack.length - 1];
			if (tail.fn === draw || tail.fn === startStroke) {
				actionStack.pop();
			} else {
				break;
			}
		}
		const clone = [...actionStack];
		actionStack = [];
		clone.forEach(({ fn, currentLocation, ...settings }) => {
			color = settings.color;
			strokeWidth = settings.strokeWidth;
			fn(currentLocation);
		});
		currentLocation = null;
	}

	const mouseToCoord = (handler: (event: CoordEvent) => void) => (event: MouseEvent) => {
		const offset = (event.target as HTMLElement).getBoundingClientRect();
		const x = event.clientX - offset.left;
		const y = event.clientY - offset.top;
		handler({ x, y });
	};

	const touchToCoord = (handler: (event: CoordEvent) => void) => (event: TouchEvent) => {
		const offset = (event.target as HTMLElement).getBoundingClientRect();
		const x = event.touches[0].clientX - offset.left;
		const y = event.touches[0].clientY - offset.top;
		handler({ x, y });
	};

	let pastGuesses = new Set<string>();
	let speechQueue: string[] = [];
	let hasStartedSpeaking = false;

	async function getGuesses() {
		if (!hasChanges) return;
		if (!ctx) return;
		hasChanges = false;
		const guesses = await guessImage(ctx, pastGuesses, $locale);
		for (const guess of guesses) {
			pastGuesses.add(guess);
		}
		speechQueue = [...guesses, ...speechQueue];
		if (!hasStartedSpeaking) {
			hasStartedSpeaking = true;
			speakNext();
		}
	}

	let speakNextTimeout: NodeJS.Timeout;
	let spokenWords = new Set<string>();
	let isDestroyed = false;

	async function speakNext() {
		if (isDestroyed) return;
		if (speechQueue.length === 0) {
			speakNextTimeout = setTimeout(speakNext, 1000);
			return;
		}
		const guess = speechQueue.shift();
		if (!guess || spokenWords.has(guess)) {
			speakNextTimeout = setTimeout(speakNext, 100);
			return;
		}
		toast.push(guess, {
			theme: {
				'--toastBarHeight': 0
			}
		});
		await speak(guess, $selectedVoices[$locale]);
		spokenWords.add(guess);
		speakNextTimeout = setTimeout(speakNext, 100);
	}

	let timeout = setTimeout(async function getGuessesInterval() {
		if (isDestroyed) return;
		await getGuesses();
		timeout = setTimeout(getGuessesInterval, 5000);
	}, 1000);

	onDestroy(() => {
		isDestroyed = true;
		clearTimeout(timeout);
		clearTimeout(speakNextTimeout);
	});
</script>

<section>
	<header>
		<h2>&nbsp;{wordsToGuess[wordsToGuessCurrentIndex] ?? ''}&nbsp;</h2>
	</header>
	<div class="canvas-container">
		<canvas
			on:mousedown={mouseToCoord(startStroke)}
			on:mouseup={mouseToCoord(endStroke)}
			on:mousemove={mouseToCoord(draw)}
			on:mouseleave={mouseToCoord(endStroke)}
			on:mouseenter={mouseToCoord(endStroke)}
			on:touchstart={touchToCoord(startStroke)}
			on:touchend={touchToCoord(endStroke)}
			on:touchmove={touchToCoord(draw)}
			on:touchcancel={touchToCoord(endStroke)}
		/>
	</div>
	<footer>
		<label><input type="color" bind:value={color} /></label>
		<label style="display: flex; align-items: center; gap: 4px;">
			<svg width={3} height={3}>
				<circle cx={2} cy={2} r={1} fill={color} />
			</svg>
			<input type="range" min="1" max="20" bind:value={strokeWidth} />
			<svg width={20} height={20}>
				<circle cx={10} cy={10} r={10} fill={color} />
			</svg>
		</label>
		<button on:click={undo}>
			<img src="icon/undo.svg" alt="Undo" />
		</button>
		<input type="reset" value={$t('general.reset')} on:click={reset} />
	</footer>
</section>

<style>
	header {
		padding: 8px;
		display: flex;
		justify-content: center;
	}
	header h2 {
		margin: 0;
		padding: 0;
	}
	section {
		display: grid;
		grid-template-rows: auto 1fr auto;
		height: 100%;
	}

	.canvas-container {
		display: flex;
		background-color: #ddd;
	}

	canvas {
		border: 1px solid #888;
		margin: auto;
		cursor:
			url('cursor/pen.png') 0 32,
			pointer;
	}

	input[type='range'] {
		width: 64px;
	}

	footer {
		padding: 8px;
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	button img {
		width: 24px;
		height: 24px;
	}
</style>
